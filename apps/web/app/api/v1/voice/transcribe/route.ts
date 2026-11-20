import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, handleApiError } from '@/lib/auth/server-auth';
import { extractOpenEndedProfile, getTradeName } from '@rojgarmitra/shared';

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
      const sarvamKey = process.env.SARVAM_API_KEY;

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

      // Fallback or standalone Sarvam Saaras STT if SARVAM_API_KEY is present
      if (audioFile && !spokenText && sarvamKey) {
        try {
          const sarvamForm = new FormData();
          sarvamForm.append('file', audioFile);
          sarvamForm.append('model', 'saaras:v1');
          sarvamForm.append('language_code', 'unknown');

          const sarvamRes = await fetch('https://api.sarvam.ai/speech-to-text', {
            method: 'POST',
            headers: {
              'api-subscription-key': sarvamKey,
            },
            body: sarvamForm,
          });

          if (sarvamRes.ok) {
            const sarvamData = (await sarvamRes.json()) as { transcript?: string };
            if (sarvamData.transcript) {
              spokenText = sarvamData.transcript;
              sttProvider = 'sarvam_saaras';
            }
          } else {
            console.warn('[Sarvam Saaras STT] API returned HTTP', sarvamRes.status);
          }
        } catch (sarvamErr) {
          console.warn('[Sarvam Saaras STT] Network error:', (sarvamErr as Error).message);
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

    // Dynamic Open-Ended Extraction across thousands of potential vocations
    const fallbackName = user?.email ? user.email.split('@')[0] : 'Candidate';
    const parsed = extractOpenEndedProfile(spokenText, fallbackName);

    const extractedData = {
      rawTranscript: spokenText,
      extractedName: parsed.candidateName,
      extractedDistrict: 'Nagpur',
      extractedTaluka: parsed.taluka,
      extractedTrade: parsed.detectedTrade,
      customTradeTitle: parsed.customTradeTitle,
      extractedQualifications: ['Practical Work Experience', `${getTradeName(parsed.detectedTrade, 'mr')}`],
      extractedSkills: parsed.detectedSkills,
      extractedExperienceMonths: parsed.experienceMonths,
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
