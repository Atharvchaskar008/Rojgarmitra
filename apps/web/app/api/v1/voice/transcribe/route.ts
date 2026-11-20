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

    // Dynamic entity extraction from spoken text
    const lower = spokenText.toLowerCase();

    // 1. Trade extraction across all industries and roles
    let extractedTrade = 'general_flexible';
    if (lower.includes('weld') || lower.includes('वेल्डर') || lower.includes('welding') || lower.includes('फॅब्रिकेशन')) {
      extractedTrade = 'welder';
    } else if (lower.includes('fitter') || lower.includes('फिटर') || lower.includes('turner') || lower.includes('cnc')) {
      extractedTrade = 'fitter_turner';
    } else if (lower.includes('wireman') || lower.includes('वायरमन') || lower.includes('electrician') || lower.includes('इलेक्ट्रिशियन') || lower.includes('wiring')) {
      extractedTrade = 'electrician';
    } else if (lower.includes('diesel') || lower.includes('mechanic') || lower.includes('मेकॅनिक') || lower.includes('गाडी')) {
      extractedTrade = 'mechanic';
    } else if (lower.includes('plumb') || lower.includes('प्लंबर') || lower.includes('pipe')) {
      extractedTrade = 'plumber';
    } else if (lower.includes('computer') || lower.includes('कॉम्प्युटर') || lower.includes('tally') || lower.includes('टॅली') || lower.includes('data entry') || lower.includes('billing')) {
      extractedTrade = 'computer_operator';
    } else if (lower.includes('sales') || lower.includes('सेल्स') || lower.includes('दुकान') || lower.includes('cashier') || lower.includes('कॅशियर')) {
      extractedTrade = 'retail_sales';
    } else if (lower.includes('driver') || lower.includes('ड्रायव्हर') || lower.includes('चालक') || lower.includes('delivery') || lower.includes('warehouse') || lower.includes('packing')) {
      extractedTrade = 'logistics_warehouse';
    } else if (lower.includes('hotel') || lower.includes('हॉटेल') || lower.includes('cook') || lower.includes('कुक') || lower.includes('स्वयंपाक')) {
      extractedTrade = 'hospitality_support';
    } else if (lower.includes('hospital') || lower.includes('रुग्णालय') || lower.includes('clinic') || lower.includes('nurse') || lower.includes('ward')) {
      extractedTrade = 'healthcare_assistant';
    } else if (lower.includes('security') || lower.includes('सुरक्षा') || lower.includes('guard') || lower.includes('गार्ड')) {
      extractedTrade = 'security_facilities';
    } else if (lower.includes('mason') || lower.includes('गवंडी') || lower.includes('painter') || lower.includes('सुतार') || lower.includes('construction')) {
      extractedTrade = 'construction_masonry';
    }

    // 2. Taluka extraction
    let extractedTaluka = 'Nagpur Urban';
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
    } else if (lower.includes('kalmeshwar') || lower.includes('कळमेश्वर')) {
      extractedTaluka = 'Kalmeshwar';
    } else if (lower.includes('kamptee') || lower.includes('कामठी')) {
      extractedTaluka = 'Kamptee';
    } else if (lower.includes('wardha') || lower.includes('वर्धा')) {
      extractedTaluka = 'Wardha';
    }

    // 3. Skills extraction
    const extractedSkills: string[] = [];
    if (lower.includes('wiring') || lower.includes('वायरिंग')) extractedSkills.push('house_wiring');
    if (lower.includes('motor') || lower.includes('मोटर') || lower.includes('rewinding')) extractedSkills.push('motor_rewinding');
    if (lower.includes('panel') || lower.includes('पॅनेल')) extractedSkills.push('industrial_panel');
    if (lower.includes('arc') || lower.includes('आर्क')) extractedSkills.push('arc_welding');
    if (lower.includes('mig') || lower.includes('मिग')) extractedSkills.push('mig_welding');
    if (lower.includes('solar') || lower.includes('सोलर')) extractedSkills.push('solar_pv_wiring');
    if (lower.includes('tally') || lower.includes('टॅली') || lower.includes('excel')) extractedSkills.push('ms_excel_tally');
    if (lower.includes('billing') || lower.includes('बिलिंग')) extractedSkills.push('billing_inventory_entry');
    if (lower.includes('sales') || lower.includes('सेल्स')) extractedSkills.push('counter_sales');
    if (lower.includes('driver') || lower.includes('चालक')) extractedSkills.push('heavy_vehicle_driving');
    if (lower.includes('cook') || lower.includes('कुक')) extractedSkills.push('commercial_cooking');
    if (lower.includes('patient') || lower.includes('रुग्ण')) extractedSkills.push('patient_care');
    if (lower.includes('security') || lower.includes('सुरक्षा')) extractedSkills.push('gate_security');

    if (extractedSkills.length === 0) {
      if (extractedTrade === 'welder') extractedSkills.push('arc_welding', 'mig_welding');
      else if (extractedTrade === 'computer_operator') extractedSkills.push('ms_excel_tally', 'billing_inventory_entry');
      else if (extractedTrade === 'retail_sales') extractedSkills.push('counter_sales');
      else if (extractedTrade === 'logistics_warehouse') extractedSkills.push('dispatch_packing');
      else if (extractedTrade === 'hospitality_support') extractedSkills.push('commercial_cooking');
      else if (extractedTrade === 'healthcare_assistant') extractedSkills.push('patient_care');
      else if (extractedTrade === 'security_facilities') extractedSkills.push('gate_security');
      else extractedSkills.push('general_helper', 'quick_learner');
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
