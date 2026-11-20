import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { JobPosting, DEMO_SEED_JOBS } from '@rojgarmitra/shared';
import { googleMapsService } from '@/lib/services/google-maps-service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const district = searchParams.get('district')?.toLowerCase();
    const taluka = searchParams.get('taluka')?.toLowerCase();
    const trade = searchParams.get('trade')?.toLowerCase();
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    const jobsRef = adminDb.collection('jobs');
    let query = jobsRef.where('status', '==', 'open').limit(limit);

    let jobs: JobPosting[] = [];
    try {
      const snapshot = await query.get();
      snapshot.forEach((doc) => {
        jobs.push({ id: doc.id, ...doc.data() } as JobPosting);
      });
    } catch (dbErr) {
      console.warn('[Jobs Feed] Firestore query warning, falling back to demo seed:', dbErr);
    }

    // If Firestore has no jobs (e.g. fresh database or demo mode), populate with verified seed jobs
    if (jobs.length === 0) {
      jobs = DEMO_SEED_JOBS.map(j => ({ ...j }));
    } else {
      // Ensure verified external government and public postings are present for honest redirection demonstration
      const hasExternal = jobs.some(j => j.sourceType === 'external_public');
      if (!hasExternal) {
        const externalSeeds = DEMO_SEED_JOBS.filter(j => j.sourceType === 'external_public');
        jobs = [...jobs, ...externalSeeds.map(j => ({ ...j }))];
      }
    }

    // Apply in-memory filters for flexibility
    if (district) {
      jobs = jobs.filter(j => j.district.toLowerCase().includes(district));
    }
    if (taluka) {
      jobs = jobs.filter(j => j.taluka?.toLowerCase().includes(taluka));
    }
    if (trade) {
      jobs = jobs.filter(j => 
        j.title.toLowerCase().includes(trade) || 
        j.requiredSkillIds.some(s => s.toLowerCase().includes(trade))
      );
    }

    // Sort by createdAt descending
    jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Enrich jobs with Google Maps location data
    const enrichedJobs = await Promise.all(
      jobs.slice(0, 15).map(j => googleMapsService.enrichJobWithMaps(j))
    );
    const finalJobs = [...enrichedJobs, ...jobs.slice(15)];

    // Discover nearby physical industrial hubs via Google Maps
    const nearbyHubs = await googleMapsService.searchNearbyEmployers({
      trade: trade || 'industrial technician',
      location: 'Nagpur',
      taluka: taluka || undefined,
      maxResults: 4,
    });

    return NextResponse.json({
      data: finalJobs,
      nearbyHubs,
      meta: {
        count: finalJobs.length,
        districtFilter: district || null,
        talukaFilter: taluka || null,
      },
    });
  } catch (error: any) {
    console.error('[Jobs Feed Error]:', error);
    return NextResponse.json(
      { error: { code: 'FETCH_ERROR', message: error?.message || 'Could not load jobs' } },
      { status: 500 }
    );
  }
}
