import { NextRequest, NextResponse } from 'next/server';
import { regionalRagService } from '@/lib/services/regional-rag';
import { checkRateLimit, handleApiError } from '@/lib/auth/server-auth';
import { SupportedLocale } from '@rojgarmitra/shared';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting per client IP or authorization header
    const ip = req.headers.get('x-forwarded-for') || 'local_client';
    checkRateLimit(`rag_ask_${ip}`, 20, 60000);

    const body = await req.json();
    const rawQuestion = (body.question || '').trim();
    const locale: SupportedLocale = body.locale || 'mr';

    if (!rawQuestion) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'Question parameter is required.' } },
        { status: 400 }
      );
    }

    const candidateContext = {
      trade: body.trade || 'electrician',
      skills: Array.isArray(body.skills) ? body.skills : [],
      taluka: body.taluka || 'Hingna',
      district: body.district || 'Nagpur',
      currentPath: body.currentPath || body.pathname || '/',
      userRole: body.userRole || 'candidate',
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
