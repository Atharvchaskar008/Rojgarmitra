import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, handleApiError } from '@/lib/auth/server-auth';
import { adminDb } from '@/lib/firebase/admin';
import { SupportedLocaleSchema, SupportedLocale } from '@rojgarmitra/shared';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    return NextResponse.json({
      data: {
        preferredLocale: user.preferredLocale || 'mr',
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    const body = await req.json();
    const locale: SupportedLocale = SupportedLocaleSchema.parse(body.locale);

    await adminDb.collection('users').doc(user.uid).set(
      {
        preferredLocale: locale,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return NextResponse.json({
      data: {
        preferredLocale: locale,
      },
      message: 'Language preference saved successfully',
    });
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_LOCALE',
            message: 'Locale must be one of mr, hi, en',
          },
        },
        { status: 400 }
      );
    }
    return handleApiError(error);
  }
}
