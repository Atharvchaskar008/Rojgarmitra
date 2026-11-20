import { NextRequest, NextResponse } from 'next/server';
import { regionalRagService } from '@/lib/services/regional-rag';
import { authenticateRequest, checkRateLimit, handleApiError } from '@/lib/auth/server-auth';
import { adminDb } from '@/lib/firebase/admin';
import { SupportedLocale } from '@rojgarmitra/shared';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting per client IP or authorization header
    const ip = req.headers.get('x-forwarded-for') || 'local_client';
    checkRateLimit(`rag_ask_${ip}`, 20, 60000);

    let user = null;
    let candidateData: any = null;
    try {
      user = await authenticateRequest(req);
      if (user && user.uid && adminDb && typeof adminDb.collection === 'function') {
        const snap = await adminDb.collection('candidates').doc(user.uid).get();
        if (snap.exists) {
          candidateData = snap.data();
        }
      }
    } catch {
      // Optional auth: allow public visitors & demo exploration
    }

    const body = await req.json().catch(() => ({}));
    const rawQuestion = (body.question || '').trim();
    const locale: SupportedLocale = body.locale || user?.preferredLocale || 'mr';

    if (!rawQuestion) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'Question parameter is required.' } },
        { status: 400 }
      );
    }

    const candidateContext = {
      trade: body.trade || candidateData?.trade || 'electrician',
      skills: Array.isArray(body.skills) && body.skills.length > 0 ? body.skills : (candidateData?.skillIds || []),
      taluka: body.taluka || candidateData?.taluka || 'Hingna',
      district: body.district || candidateData?.district || 'Nagpur',
      currentPath: body.currentPath || body.pathname || '/',
      userRole: body.userRole || user?.role || 'candidate',
      currentSituation: body.currentSituation || candidateData?.currentSituation,
      targetGoal: body.targetGoal || candidateData?.targetGoal,
      candidateName: candidateData?.preferredName || (user?.email ? user.email.split('@')[0] : undefined),
    };

    const ragResult = await regionalRagService.answerWithRag(rawQuestion, candidateContext, locale);

    return NextResponse.json({
      success: true,
      data: {
        question: rawQuestion,
        answer: ragResult.answer,
        citations: ragResult.citations,
        retrievedDocumentCount: ragResult.retrievedDocumentCount,
      },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
