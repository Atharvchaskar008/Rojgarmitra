import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireRole, handleApiError, AuthError } from '@/lib/auth/server-auth';
import { adminDb } from '@/lib/firebase/admin';
import { JobPosting, CandidateProfile, JobApplication } from '@rojgarmitra/shared';

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

    // 1. Fetch Job directly from verified database
    const jobDoc = await adminDb.collection('jobs').doc(jobId).get();
    if (!jobDoc.exists) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Job vacancy not found' } },
        { status: 404 }
      );
    }
    const job = { id: jobDoc.id, ...jobDoc.data() } as JobPosting;

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

    // Create in-app notification for the employer
    if (job.employerUid && job.employerUid !== 'unknown_employer') {
      try {
        const notifRef = adminDb.collection('notifications').doc();
        await notifRef.set({
          id: notifRef.id,
          recipientUid: job.employerUid,
          recipientRole: 'employer',
          title: `नवीन अर्ज प्राप्त: ${job.title}`,
          message: `${candidateName} (${candidateTrade || 'उमेदवार'}) यांनी ${job.title} पदासाठी अर्ज पाठवला आहे.`,
          link: `/employer/jobs/${jobId}/applicants`,
          isRead: false,
          createdAt: now,
        });
      } catch (notifErr) {
        console.warn('[Notification Error]', notifErr);
      }
    }

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
