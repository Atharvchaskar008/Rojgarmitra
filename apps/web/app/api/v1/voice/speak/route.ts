import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, handleApiError } from '@/lib/auth/server-auth';

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

    const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'; // default multilingual voice

    if (elevenLabsKey) {
      try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
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
            },
          });
        }
      } catch (voiceErr) {
        console.warn('[ElevenLabs TTS] API call failed, falling back to text response:', voiceErr);
      }
    }

    // Graceful fallback when ElevenLabs key is not yet set
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
