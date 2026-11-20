import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, handleApiError } from '@/lib/auth/server-auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    let user = null;
    try {
      user = await authenticateRequest(req);
    } catch {
      // Optional auth: allow public visitors & landing page candidates to transcribe voice input
    }
    const contentType = req.headers.get('content-type') || '';

    let userConsent = false;
    let spokenText = '';
    let sttProvider = 'demo_voice_adapter';

    if (contentType.includes('application/json')) {
      const body = await req.json();
      userConsent = !!body.consent;
      spokenText = body.text || '';
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const audioFile = formData.get('file') as File | null;
      const consentField = formData.get('consent');
      userConsent = consentField === 'true' || consentField === '1' || Boolean(audioFile);

      const apiKey = process.env.ELEVENLABS_API_KEY;
      if (audioFile && apiKey) {
        try {
          const fileBuffer = await audioFile.arrayBuffer();
          const bufferBlob = new Blob([fileBuffer], { type: audioFile.type || 'audio/webm' });
          const elevenFormData = new FormData();
          elevenFormData.append('file', bufferBlob, audioFile.name || 'speech.webm');
          elevenFormData.append('model_id', 'scribe_v1');

          const scribeRes = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
            method: 'POST',
            headers: {
              'xi-api-key': apiKey,
            },
            body: elevenFormData,
          });

          if (scribeRes.ok) {
            const scribeData = (await scribeRes.json()) as { text?: string; language_code?: string };
            if (scribeData.text) {
              spokenText = scribeData.text;
              sttProvider = 'elevenlabs_scribe';
            }
          } else {
            const errTxt = await scribeRes.text();
            console.warn('[ElevenLabs Scribe STT] API returned HTTP', scribeRes.status, errTxt);
          }
        } catch (sttErr) {
          console.warn('[ElevenLabs Scribe STT] Network error:', (sttErr as Error).message);
        }
      }
    } else {
      userConsent = true;
    }

    if (!userConsent) {
      return NextResponse.json(
        {
          error: {
            code: 'VOICE_CONSENT_REQUIRED',
            message: 'User consent is required before recording or transcribing voice input',
          },
        },
        { status: 403 }
      );
    }

    if (!spokenText || !spokenText.trim()) {
      return NextResponse.json(
        {
          error: {
            code: 'NO_SPEECH_DETECTED',
            message: 'No audio or transcript was detected. Please provide a clear audio recording or text input.',
          },
        },
        { status: 400 }
      );
    }

    // Dynamic entity extraction from spoken text
    const lower = spokenText.toLowerCase();

    // 1. Trade extraction
    let extractedTrade = 'electrician';
    if (lower.includes('weld') || lower.includes('वेल्डर') || lower.includes('welding')) {
      extractedTrade = 'welder';
    } else if (lower.includes('fitter') || lower.includes('फिटर') || lower.includes('turner')) {
      extractedTrade = 'fitter_turner';
    } else if (lower.includes('wireman') || lower.includes('वायरमन') || lower.includes('electrician') || lower.includes('इलेक्ट्रिशियन')) {
      extractedTrade = 'electrician';
    }

    // 2. Taluka extraction
    let extractedTaluka = 'Hingna';
    if (lower.includes('butibori') || lower.includes('बुटीबोरी')) {
      extractedTaluka = 'Butibori';
    } else if (lower.includes('umred') || lower.includes('उमरेड')) {
      extractedTaluka = 'Umred';
    } else if (lower.includes('katol') || lower.includes('काटोल')) {
      extractedTaluka = 'Katol';
    } else if (lower.includes('saoner') || lower.includes('सावनेर')) {
      extractedTaluka = 'Saoner';
    } else if (lower.includes('hingna') || lower.includes('हिंगणा')) {
      extractedTaluka = 'Hingna';
    }

    // 3. Skills extraction
    const extractedSkills: string[] = [];
    if (lower.includes('wiring') || lower.includes('वायरिंग')) extractedSkills.push('house_wiring');
    if (lower.includes('motor') || lower.includes('मोटर') || lower.includes('rewinding')) extractedSkills.push('motor_rewinding');
    if (lower.includes('panel') || lower.includes('पॅनेल')) extractedSkills.push('industrial_panel');
    if (lower.includes('arc') || lower.includes('आर्क')) extractedSkills.push('arc_welding');
    if (lower.includes('mig') || lower.includes('मिग')) extractedSkills.push('mig_welding');
    if (lower.includes('solar') || lower.includes('सोलर')) extractedSkills.push('solar_pv_wiring');
    if (extractedSkills.length === 0) {
      extractedSkills.push(extractedTrade === 'welder' ? 'arc_welding' : 'house_wiring');
    }

    // 4. Experience months extraction
    let experienceMonths = 12;
    const expMatch = spokenText.match(/(\d+)\s*(?:वर्ष|year|साल)/i);
    if (expMatch && expMatch[1]) {
      experienceMonths = parseInt(expMatch[1], 10) * 12;
    }

    // 5. Name extraction
    let extractedName = user?.email ? user.email.split('@')[0] : 'Candidate';
    const nameMatch = spokenText.match(/(?:मी|मेरा नाम|I am|Name is)\s+([A-Za-z\u0900-\u097F\s]{2,25}?)(?:,|\.|\s+नागपूर|\s+राहतो|\s+येथे)/i);
    if (nameMatch && nameMatch[1]) {
      extractedName = nameMatch[1].trim();
    }

    const extractedData = {
      rawTranscript: spokenText,
      extractedName,
      extractedDistrict: 'Nagpur',
      extractedTaluka,
      extractedTrade,
      extractedQualifications: ['10th', `ITI_${extractedTrade}`],
      extractedSkills,
      extractedExperienceMonths: experienceMonths,
      requiresUserConfirmation: true,
      disclaimer: 'कृपया माहिती तपासून घ्या. आपल्या संमतीशिवाय प्रोफाईलमध्ये कोणतीही माहिती जतन होणार नाही. (Please review information. No changes are saved to your profile without your explicit confirmation.)',
    };

    return NextResponse.json({
      data: extractedData,
      meta: {
        userId: user ? user.uid : 'guest_candidate',
        processedAt: new Date().toISOString(),
        service: sttProvider,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
