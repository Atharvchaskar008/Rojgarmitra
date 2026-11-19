import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireRole, handleApiError, AuthError } from '@/lib/auth/server-auth';
import { adminDb } from '@/lib/firebase/admin';
import { JobPosting, JobApplication } from '@rojgarmitra/shared';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateRequest(req);
    requireRole(user, ['employer', 'admin']);

    const resolvedParams = await params;
    const jobId = resolvedParams.id;

    // Verify job ownership
    const jobSnap = await adminDb.collection('jobs').doc(jobId).get();
    if (jobSnap.exists) {
      const job = jobSnap.data() as JobPosting;
      if (user.role !== 'admin' && job.employerUid !== user.uid) {
        throw new AuthError('Forbidden: You can only view applicants for your own vacancies', 403);
      }
    }

    const appSnap = await adminDb
      .collection('applications')
      .where('jobId', '==', jobId)
      .get();

    const applicants: JobApplication[] = [];
    appSnap.forEach(doc => {
      applicants.push({ id: doc.id, ...doc.data() } as JobApplication);
    });

    applicants.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      data: applicants,
      meta: { count: applicants.length, jobId },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
