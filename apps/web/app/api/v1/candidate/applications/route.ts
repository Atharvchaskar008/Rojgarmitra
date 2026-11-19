import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireRole, handleApiError } from '@/lib/auth/server-auth';
import { adminDb } from '@/lib/firebase/admin';
import { JobApplication, JobPosting } from '@rojgarmitra/shared';
import demoJobsData from '../../../../../../firebase/seed/demo-jobs.json';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    requireRole(user, ['candidate', 'admin']);

    const snapshot = await adminDb
      .collection('applications')
      .where('candidateUid', '==', user.uid)
      .get();

    const applications: (JobApplication & { jobTitle?: string; employerName?: string })[] = [];
    
    for (const doc of snapshot.docs) {
      const app = { id: doc.id, ...doc.data() } as JobApplication;
      
      // Look up job details
      let jobTitle = 'Job Vacancy';
      let employerName = 'Employer';

      try {
        const jobDoc = await adminDb.collection('jobs').doc(app.jobId).get();
        if (jobDoc.exists) {
          const j = jobDoc.data() as JobPosting;
          jobTitle = j.title;
          employerName = j.employerName;
        } else {
          const seed = (demoJobsData as any[]).find(j => j.id === app.jobId);
          if (seed) {
            jobTitle = seed.title;
            employerName = seed.employerName;
          }
        }
      } catch {
        // Continue
      }

      applications.push({
        ...app,
        jobTitle,
        employerName,
      });
    }

    applications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      data: applications,
      meta: { count: applications.length },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
