import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { JobPosting, DEMO_SEED_JOBS } from '@rojgarmitra/shared';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const jobId = resolvedParams.id;

    // Check Firestore
    try {
      const docSnap = await adminDb.collection('jobs').doc(jobId).get();
      if (docSnap.exists) {
        return NextResponse.json({
          data: { id: docSnap.id, ...docSnap.data() } as JobPosting,
        });
      }
    } catch {
      // Continue to check demo seed
    }

    // Check demo seed jobs
    const seedJob = DEMO_SEED_JOBS.find(j => j.id === jobId);
    if (seedJob) {
      return NextResponse.json({
        data: seedJob as JobPosting,
      });
    }

    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Job not found' } },
      { status: 404 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: error?.message } },
      { status: 500 }
    );
  }
}
