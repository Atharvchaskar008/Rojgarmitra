import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, handleApiError } from '@/lib/auth/server-auth';
import { SupportedLocale } from '@rojgarmitra/shared';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    const body = await req.json();

    const { jobTitle, employerName, location, locale = 'mr', consentGiven = false } = body;

    if (!consentGiven) {
      return NextResponse.json(
        {
          error: {
            code: 'CONSENT_REQUIRED',
            message: 'User consent is required before previewing or delivering SMS notifications',
          },
        },
        { status: 403 }
      );
    }

    let messageText = '';
    if (locale === 'mr') {
      messageText = `[रोजगारमित्र] नवीन नोकरी: ${jobTitle} (${employerName}, ${location}). आपल्या कौशल्यांशी सुसंगत! अधिक माहितीसाठी: https://rojgarmitra.local/jobs`;
    } else if (locale === 'hi') {
      messageText = `[रोजगारमित्र] नई नौकरी: ${jobTitle} (${employerName}, ${location}). आपके कौशल से मेल खाती है! विवरण: https://rojgarmitra.local/jobs`;
    } else {
      messageText = `[RojgarMitra] New Job Match: ${jobTitle} at ${employerName}, ${location}. Check details at https://rojgarmitra.local/jobs`;
    }

    return NextResponse.json({
      data: {
        recipientUid: user.uid,
        channel: 'mock_sms',
        status: 'preview_generated',
        message: messageText,
        characterCount: messageText.length,
        dltCompliant: true,
        disclaimer: 'Mock SMS Alert for demo/evaluation. Real SMS delivery requires TRAI/DLT template registration.',
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
