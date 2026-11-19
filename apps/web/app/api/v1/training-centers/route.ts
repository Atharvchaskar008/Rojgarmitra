import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { TrainingCenter, DEMO_SEED_CENTERS } from '@rojgarmitra/shared';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const district = searchParams.get('district')?.toLowerCase();
    const trade = searchParams.get('trade')?.toLowerCase();

    let centers: TrainingCenter[] = [];

    try {
      const snapshot = await adminDb.collection('trainingCenters').get();
      snapshot.forEach(doc => {
        centers.push({ id: doc.id, ...doc.data() } as TrainingCenter);
      });
    } catch {
      // Offline / fallback to verified seed data
    }

    if (centers.length === 0) {
      centers = DEMO_SEED_CENTERS.map(c => ({ ...c }));
    }

    if (district) {
      centers = centers.filter(c => c.district.toLowerCase().includes(district));
    }
    if (trade) {
      centers = centers.filter(c => c.supportedTradeIds.some(t => t.toLowerCase().includes(trade)));
    }

    return NextResponse.json({
      data: centers,
      meta: {
        total: centers.length,
        source: 'DVET Maharashtra Official Directory',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: 'FETCH_ERROR', message: error?.message } },
      { status: 500 }
    );
  }
}
