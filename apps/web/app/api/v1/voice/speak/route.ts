import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, handleApiError } from '@/lib/auth/server-auth';
import { serverConfig } from '@/lib/config/server-config';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    const body = await req.json();

    const { text, locale = 'mr' } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: { code: 'INVALID_TEXT', message: 'Text is required for speech synthesis' } },
        { status: 400 }
      );
    }

    const config = serverConfig.get();
    const elevenLabsKey = config.ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY;
    let voiceId = config.ELEVENLABS_VOICE_ID || process.env.ELEVENLABS_VOICE_ID;

    if (elevenLabsKey) {
      try {
        // If Voice ID is not provided, dynamically discover available voice from ElevenLabs API
        if (!voiceId) {
          const voicesRes = await fetch('https://api.elevenlabs.io/v1/voices', {
            headers: { 'xi-api-key': elevenLabsKey },
          });
          if (voicesRes.ok) {
            const voicesData = (await voicesRes.json()) as { voices?: Array<{ voice_id: string }> };
            if (voicesData.voices && voicesData.voices.length > 0) {
              voiceId = voicesData.voices[0].voice_id;
            }
          }
        }

        // Fallback default voice if still not found
        const finalVoiceId = voiceId || 'CwhRBWXzGAHq8TQ4Fs17';

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
        userId: user.uid,
        provider: 'fallback_text',
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
