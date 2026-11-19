import { NextResponse } from 'next/server';
import { REGIONAL_TRADES } from '@rojgarmitra/shared';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    data: {
      locales: ['mr', 'hi', 'en'],
      defaultLocale: 'mr',
      pilotRegion: {
        district: 'Nagpur',
        keyTalukas: ['Butibori', 'Hingna', 'Umred', 'Katol', 'Saoner', 'Nagpur Rural'],
        state: 'Maharashtra',
      },
      trades: REGIONAL_TRADES,
      features: {
        voiceTranscription: true,
        voiceSynthesis: true,
        smsMock: true,
        aiMatching: true,
      },
    },
  });
}
