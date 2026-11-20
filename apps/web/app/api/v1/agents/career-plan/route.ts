import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireRole, handleApiError, checkRateLimit } from '@/lib/auth/server-auth';
import { adminDb } from '@/lib/firebase/admin';
import { CandidateProfile, SupportedLocale } from '@rojgarmitra/shared';
import { careerPlannerService } from '@/lib/services/career-planner';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    requireRole(user, ['candidate', 'admin']);
    checkRateLimit(`career_plan_${user.uid}`, 10, 60000);

    const body = await req.json().catch(() => ({}));
    const requestedLocale: SupportedLocale = body.locale || user.preferredLocale || 'mr';
    const targetRole: string | undefined = body.targetRole;
    const currentSituation: string | undefined = body.currentSituation;

    // Fetch candidate profile
    let candidate: CandidateProfile | null = null;
    const docSnap = await adminDb.collection('candidates').doc(user.uid).get();
    if (docSnap.exists) {
      candidate = docSnap.data() as CandidateProfile;
    } else {
      candidate = {
        uid: user.uid,
        preferredName: 'Candidate',
        district: 'Nagpur',
        trade: 'electrician',
        qualifications: ['ITI_electrician'],
        skillIds: ['house_wiring'],
        experienceMonths: 12,
        availability: 'immediate',
        updatedAt: new Date().toISOString(),
      };
    }

    const careerPlan = await careerPlannerService.generateCareerPlan(
      candidate,
      targetRole,
      requestedLocale,
      currentSituation
    );

    return NextResponse.json({
      data: careerPlan,
      meta: {
        candidateUid: user.uid,
        locale: requestedLocale,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
