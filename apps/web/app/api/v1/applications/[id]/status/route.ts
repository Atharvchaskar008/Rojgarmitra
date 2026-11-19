import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireRole, handleApiError, AuthError } from '@/lib/auth/server-auth';
import { adminDb } from '@/lib/firebase/admin';
import { UpdateApplicationStatusSchema, JobApplication } from '@rojgarmitra/shared';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateRequest(req);
    requireRole(user, ['employer', 'admin']);

    const resolvedParams = await params;
    const applicationId = resolvedParams.id;

    const appRef = adminDb.collection('applications').doc(applicationId);
    const appSnap = await appRef.get();

    if (!appSnap.exists) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Application not found' } },
        { status: 404 }
      );
    }

    const application = appSnap.data() as JobApplication;

    // Strict ownership verification: only the employer who owns the vacancy can change its status
    if (user.role !== 'admin' && application.employerUid !== user.uid) {
      throw new AuthError('Forbidden: You can only update applications submitted to your vacancies', 403);
    }

    const body = await req.json();
    const validated = UpdateApplicationStatusSchema.parse(body);

    const now = new Date().toISOString();
    const updates: Partial<JobApplication> = {
      status: validated.status,
      notes: validated.notes || application.notes,
      updatedAt: now,
    };

    await appRef.update(updates);

    // Create in-app notification for the candidate
    if (application.candidateUid) {
      try {
        const notifRef = adminDb.collection('notifications').doc();
        const statusTitles: Record<string, string> = {
          shortlisted: 'आपला अर्ज शॉर्टलिस्ट झाला आहे!',
          interview_requested: 'मुलाखतीची विनंती: नियोक्त्यांचा थेट संपर्क',
          accepted: 'अभिनंदन! आपली निवड झाली आहे',
          rejected: 'अर्जाची सद्यस्थिती अद्ययावत',
        };
        await notifRef.set({
          id: notifRef.id,
          recipientUid: application.candidateUid,
          recipientRole: 'candidate',
          title: statusTitles[validated.status] || 'अर्जाची सद्यस्थिती अद्ययावत',
          message: `आपल्या नोकरी अर्जाची स्थिती "${validated.status}" म्हणून नोंदवली गेली आहे.`,
          link: '/candidate/applications',
          isRead: false,
          createdAt: now,
        });
      } catch (notifErr) {
        console.warn('[Candidate Notification Error]', notifErr);
      }
    }

    return NextResponse.json({
      data: { ...application, ...updates },
      message: `Application status updated to ${validated.status}`,
    });
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', details: error.errors } },
        { status: 400 }
      );
    }
    return handleApiError(error);
  }
}
