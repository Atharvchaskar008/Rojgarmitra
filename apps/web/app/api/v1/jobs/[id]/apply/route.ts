import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireRole, handleApiError, AuthError } from '@/lib/auth/server-auth';
import { adminDb } from '@/lib/firebase/admin';
import { JobPosting, CandidateProfile, JobApplication, DEMO_SEED_JOBS } from '@rojgarmitra/shared';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateRequest(req);
    requireRole(user, ['candidate', 'admin']);

    const resolvedParams = await params;
    const jobId = resolvedParams.id;

    // 1. Fetch Job
    let job: JobPosting | null = null;
    const jobDoc = await adminDb.collection('jobs').doc(jobId).get();
    if (jobDoc.exists) {
      job = { id: jobDoc.id, ...jobDoc.data() } as JobPosting;
    } else {
      const seed = DEMO_SEED_JOBS.find(j => j.id === jobId);
      if (seed) job = seed;
    }

    if (!job) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Job vacancy not found' } },
        { status: 404 }
      );
    }

    // Critical Requirement: Candidates cannot apply in-app to external public vacancies
    if (job.sourceType === 'external_public') {
      return NextResponse.json(
        {
          error: {
            code: 'EXTERNAL_JOB_REDIRECT',
            message: 'External job vacancies must be applied to directly via the source URL',
            sourceUrl: job.sourceUrl,
          },
        },
        { status: 400 }
      );
    }

    // 2. Prevent duplicate applications
    const existingSnap = await adminDb
      .collection('applications')
      .where('candidateUid', '==', user.uid)
      .where('jobId', '==', jobId)
      .get();

    if (!existingSnap.empty) {
      return NextResponse.json(
        {
          error: {
            code: 'ALREADY_APPLIED',
            message: 'You have already submitted an application for this vacancy',
          },
        },
        { status: 400 }
      );
    }

    // 3. Fetch Candidate Profile for application snapshot
    let candidateName = 'Candidate';
    let candidateSkills: string[] = [];
    let candidateTrade = '';
    let candidatePhone = '';

    const candidateSnap = await adminDb.collection('candidates').doc(user.uid).get();
    if (candidateSnap.exists) {
      const cData = candidateSnap.data() as CandidateProfile;
      candidateName = cData.preferredName || candidateName;
      candidateSkills = cData.skillIds || [];
      candidateTrade = cData.trade || '';
      candidatePhone = cData.phone || '';
    }

    const now = new Date().toISOString();
    const appRef = adminDb.collection('applications').doc();

    const application: JobApplication = {
      id: appRef.id,
      candidateUid: user.uid,
      jobId,
      employerUid: job.employerUid || 'unknown_employer',
      status: 'applied',
      candidateName,
      candidatePhone,
      candidateSkills,
      candidateTrade,
      createdAt: now,
      updatedAt: now,
    };

    await appRef.set(application);

    return NextResponse.json(
      {
        data: application,
        message: 'Application submitted successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
