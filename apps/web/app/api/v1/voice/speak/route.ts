import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, handleApiError } from '@/lib/auth/server-auth';
import { serverConfig } from '@/lib/config/server-config';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    let user = null;
    try {
      user = await authenticateRequest(req);
    } catch {
      // Optional auth: allow public visitors & landing page candidates to hear voice guidance
    }
    const body = await req.json();

    const { text, locale = 'mr', gender = 'male', voiceId: requestedVoiceId } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: { code: 'INVALID_TEXT', message: 'Text is required for speech synthesis' } },
        { status: 400 }
      );
    }

    const config = serverConfig.get();
    const elevenLabsKey = config.ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY;
    const sarvamKey = process.env.SARVAM_API_KEY;

    // Multilingual Voice Map by Locale and Gender for ElevenLabs
    const VOICE_MAP: Record<string, { male: string; female: string }> = {
      mr: {
        male: process.env.ELEVENLABS_VOICE_MR_MALE || 'oIhZlnorjQiJ5jF7X73a',
        female: process.env.ELEVENLABS_VOICE_MR_FEMALE || 'dSEhEXLzhnZEytnJ2rRy',
      },
      hi: {
        male: process.env.ELEVENLABS_VOICE_HI_MALE || 'f1abxvIEijusskcPWE5x',
        female: process.env.ELEVENLABS_VOICE_HI_FEMALE || 'JTPrASXyK62cF3L7w8hv',
      },
      en: {
        male: process.env.ELEVENLABS_VOICE_EN_MALE || 'CwhRBWXzGAHq8TQ4Fs17',
        female: process.env.ELEVENLABS_VOICE_EN_FEMALE || 'EXAVITQu4vr4xnSDxMaL',
      },
    };

    const targetGender = gender === 'female' ? 'female' : 'male';
    const localeMap = VOICE_MAP[locale] || VOICE_MAP.mr;
    const finalVoiceId = requestedVoiceId || localeMap[targetGender] || config.ELEVENLABS_VOICE_ID || process.env.ELEVENLABS_VOICE_ID || 'oIhZlnorjQiJ5jF7X73a';

    // 1. Try Sarvam AI Bulbul TTS if SARVAM_API_KEY is provided
    if (sarvamKey) {
      try {
        const sarvamLang = locale === 'mr' ? 'mr-IN' : locale === 'hi' ? 'hi-IN' : 'en-IN';
        const speaker = targetGender === 'female' ? 'aditi' : 'arvind';
        const sarvamRes = await fetch('https://api.sarvam.ai/text-to-speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-subscription-key': sarvamKey,
          },
          body: JSON.stringify({
            inputs: [text.slice(0, 500)],
            target_language_code: sarvamLang,
            speaker,
            pitch: 0,
            pace: 1.0,
            loudness: 1.5,
            speech_sample_rate: 22050,
            enable_preprocessing: true,
            model: 'bulbul:v1',
          }),
        });

        if (sarvamRes.ok) {
          const sData = (await sarvamRes.json()) as { audios?: string[] };
          if (sData.audios && sData.audios[0]) {
            const buffer = Buffer.from(sData.audios[0], 'base64');
            return new NextResponse(buffer, {
              headers: {
                'Content-Type': 'audio/wav',
                'Content-Length': buffer.length.toString(),
                'X-Voice-Provider': 'sarvam_bulbul',
              },
            });
          }
        } else {
          console.warn('[Sarvam TTS] API returned HTTP', sarvamRes.status);
        }
      } catch (sarvamErr) {
        console.warn('[Sarvam TTS] API call failed, attempting ElevenLabs fallback:', (sarvamErr as Error).message);
      }
    }

    // 2. Try ElevenLabs Pro Multilingual v2
    if (elevenLabsKey) {
      try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${finalVoiceId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': elevenLabsKey,
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
        });

        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          return new NextResponse(buffer, {
            headers: {
              'Content-Type': 'audio/mpeg',
              'Content-Length': buffer.length.toString(),
              'X-Voice-Id': finalVoiceId,
            },
          });
        } else {
          console.warn('[ElevenLabs TTS] API returned HTTP', response.status);
        }
      } catch (voiceErr) {
        console.warn('[ElevenLabs TTS] API call failed, falling back to text response:', (voiceErr as Error).message);
      }
    }

    // Graceful fallback when ElevenLabs key is not set or network fails
    return NextResponse.json({
      data: {
        text,
        locale,
        speechAvailable: false,
        fallbackMode: 'browser_speech_synthesis',
        message: 'Spoken guidance ready via client speech synthesis or text display.',
      },
      meta: {
        userId: user ? user.uid : 'guest_visitor',
        provider: 'fallback_text',
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
