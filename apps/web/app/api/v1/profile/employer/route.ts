import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireRole, handleApiError } from '@/lib/auth/server-auth';
import { adminDb } from '@/lib/firebase/admin';
import { EmployerProfileSchema, EmployerProfile } from '@rojgarmitra/shared';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    requireRole(user, ['employer', 'admin']);

    const docSnap = await adminDb.collection('employers').doc(user.uid).get();
    if (!docSnap.exists) {
      return NextResponse.json({ data: null, meta: { exists: false } });
    }

    return NextResponse.json({
      data: docSnap.data() as EmployerProfile,
      meta: { exists: true },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    requireRole(user, ['employer', 'admin']);

    const body = await req.json();
    const validated = EmployerProfileSchema.parse(body);

    const now = new Date().toISOString();
    const employerProfile: EmployerProfile = {
      ...validated,
      uid: user.uid,
      verificationStatus: 'self_registered',
      createdAt: now,
      updatedAt: now,
    };

    await adminDb.collection('employers').doc(user.uid).set(employerProfile, { merge: true });

    return NextResponse.json(
      {
        data: employerProfile,
        message: 'Employer profile saved successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            details: error.errors,
          },
        },
        { status: 400 }
      );
    }
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  return POST(req);
}
