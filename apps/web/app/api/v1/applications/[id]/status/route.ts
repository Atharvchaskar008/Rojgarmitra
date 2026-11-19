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
