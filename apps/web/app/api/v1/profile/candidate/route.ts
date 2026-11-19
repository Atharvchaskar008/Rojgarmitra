import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireRole, handleApiError } from '@/lib/auth/server-auth';
import { adminDb } from '@/lib/firebase/admin';
import { CandidateProfileSchema, CandidateProfile } from '@rojgarmitra/shared';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    requireRole(user, ['candidate', 'admin']);

    const docSnap = await adminDb.collection('candidates').doc(user.uid).get();
    if (!docSnap.exists) {
      return NextResponse.json({ data: null, meta: { exists: false } });
    }

    return NextResponse.json({
      data: docSnap.data() as CandidateProfile,
      meta: { exists: true },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    requireRole(user, ['candidate', 'admin']);

    const body = await req.json();
    const validated = CandidateProfileSchema.parse(body);

    const candidateProfile: CandidateProfile = {
      ...validated,
      uid: user.uid,
      updatedAt: new Date().toISOString(),
    };

    await adminDb.collection('candidates').doc(user.uid).set(candidateProfile, { merge: true });

    return NextResponse.json(
      {
        data: candidateProfile,
        message: 'Candidate profile saved successfully',
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
