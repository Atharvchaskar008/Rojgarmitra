import { NextResponse } from 'next/server';

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
      i18n: ['mr', 'hi', 'en']
    }
  });
}
