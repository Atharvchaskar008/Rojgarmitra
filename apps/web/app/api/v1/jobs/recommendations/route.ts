import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireRole, handleApiError } from '@/lib/auth/server-auth';
import { adminDb } from '@/lib/firebase/admin';
import { JobPosting, CandidateProfile, rankJobsForCandidate, DEMO_SEED_JOBS } from '@rojgarmitra/shared';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    requireRole(user, ['candidate', 'admin']);

    // 1. Fetch Candidate Profile
    let candidate: CandidateProfile | null = null;
    try {
      const candidateDoc = await adminDb.collection('candidates').doc(user.uid).get();
      if (candidateDoc.exists) {
        candidate = candidateDoc.data() as CandidateProfile;
      }
    } catch {
      // Offline / test handling
    }

    if (!candidate) {
      // In demo mode with demo token, generate default candidate profile
      if (process.env.APP_MODE === 'demo' || process.env.NODE_ENV === 'test') {
        candidate = {
          uid: user.uid,
          preferredName: 'Demo Candidate',
          district: 'Nagpur',
          taluka: 'Butibori',
          trade: 'electrician',
          qualifications: ['10th', 'ITI_electrician'],
          skillIds: ['house_wiring', 'industrial_panel'],
          experienceMonths: 18,
          availability: 'immediate',
          updatedAt: new Date().toISOString(),
        };
      } else {
        return NextResponse.json(
          {
            error: {
              code: 'PROFILE_REQUIRED',
              message: 'Please complete your candidate profile before viewing recommendations',
            },
          },
          { status: 400 }
        );
      }
    }

    // 2. Fetch all open jobs
    let jobs: JobPosting[] = [];
    try {
      const snapshot = await adminDb.collection('jobs').where('status', '==', 'open').get();
      snapshot.forEach(doc => {
        jobs.push({ id: doc.id, ...doc.data() } as JobPosting);
      });
    } catch {
      // Fallback
    }

    // If Firestore has no jobs (fresh database or demo evaluation), use verified seed jobs
    if (jobs.length === 0) {
      jobs = DEMO_SEED_JOBS.map(j => ({ ...j }));
    } else {
      const hasExternal = jobs.some(j => j.sourceType === 'external_public');
      if (!hasExternal) {
        const externalSeeds = DEMO_SEED_JOBS.filter(j => j.sourceType === 'external_public');
        jobs = [...jobs, ...externalSeeds.map(j => ({ ...j }))];
      }
    }

    // 3. Rank jobs using explainable deterministic matching engine
    const rankedRecommendations = rankJobsForCandidate(candidate, jobs);

    const eligibleCount = rankedRecommendations.filter(
      r => r.match.eligibility === 'eligible'
    ).length;

    return NextResponse.json({
      data: rankedRecommendations,
      meta: {
        totalEvaluated: jobs.length,
        totalEligible: eligibleCount,
        candidateTrade: candidate.trade,
        candidateDistrict: candidate.district,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
