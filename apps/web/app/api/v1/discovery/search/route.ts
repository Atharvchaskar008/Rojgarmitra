import { NextRequest, NextResponse } from 'next/server';
import { ExternalJobDiscoveryQuerySchema } from '@rojgarmitra/shared';
import { jobDiscoveryAgent } from '@/lib/services/job-discovery';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = ExternalJobDiscoveryQuerySchema.parse(body);

    const discoveryResult = await jobDiscoveryAgent.discoverJobs({
      trade: validated.query,
      district: validated.location,
    });

    const jobs = discoveryResult.results.map(r => r.job).slice(0, validated.limit || 10);

    return NextResponse.json({
      data: jobs,
      meta: {
        total: jobs.length,
        query: validated.query,
        location: validated.location,
        attributionNotice: 'External job leads sourced from certified public employment portals (MahaJobs, NCS). RojgarMitra does not collect fees for external job applications.',
      },
    });
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', details: error.errors } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: { code: 'SEARCH_ERROR', message: error?.message } },
      { status: 500 }
    );
  }
}
