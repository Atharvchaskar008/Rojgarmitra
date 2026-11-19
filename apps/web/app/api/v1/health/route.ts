import { NextResponse } from 'next/server';
import { geminiClient } from '@/lib/ai/gemini-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    app: 'RojgarMitra',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      auth: 'firebase',
      database: 'firestore',
      gemini: geminiClient.isConfigured() ? 'configured' : 'not_configured',
      geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      i18n: ['mr', 'hi', 'en']
    }
  });
}
