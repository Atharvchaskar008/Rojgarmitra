import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireRole, handleApiError, AuthError } from '@/lib/auth/server-auth';
import { adminDb } from '@/lib/firebase/admin';
import { JobPosting } from '@rojgarmitra/shared';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateRequest(req);
    requireRole(user, ['employer', 'admin']);

    const resolvedParams = await params;
    const jobId = resolvedParams.id;

    const jobRef = adminDb.collection('jobs').doc(jobId);
    const jobSnap = await jobRef.get();

    if (!jobSnap.exists) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Job not found' } },
        { status: 404 }
      );
    }

    const currentJob = jobSnap.data() as JobPosting;

    // Strict ownership check
    if (user.role !== 'admin' && currentJob.employerUid !== user.uid) {
      throw new AuthError('Forbidden: You can only edit jobs posted by your organization', 403);
    }

    const body = await req.json();
    const allowedFields = [
      'title',
      'description',
      'status',
      'vacancies',
      'salaryMin',
      'salaryMax',
      'requiredSkillIds',
      'mandatoryCertificationIds',
      'areaOrMidc',
    ];

    const updates: Partial<JobPosting> = {
      updatedAt: new Date().toISOString(),
    };

    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        (updates as any)[key] = body[key];
      }
    }

    await jobRef.update(updates);

    return NextResponse.json({
      data: { ...currentJob, ...updates },
      message: 'Job vacancy updated successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
