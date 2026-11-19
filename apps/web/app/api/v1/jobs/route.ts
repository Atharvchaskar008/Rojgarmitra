import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { JobPosting, DEMO_SEED_JOBS } from '@rojgarmitra/shared';

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

    // In demo mode or if no jobs in database yet, include verified demo seed jobs
    if (jobs.length === 0) {
      jobs = DEMO_SEED_JOBS.map(j => ({ ...j }));
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

    return NextResponse.json({
      data: jobs,
      meta: {
        count: jobs.length,
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
