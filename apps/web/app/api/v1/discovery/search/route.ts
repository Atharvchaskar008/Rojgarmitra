import { NextRequest, NextResponse } from 'next/server';
import { ExternalJobDiscoveryQuerySchema } from '@rojgarmitra/shared';
import { jobDiscoveryAdapter } from '@/lib/services/job-discovery';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = ExternalJobDiscoveryQuerySchema.parse(body);

    const jobs = await jobDiscoveryAdapter.searchExternalJobs({
      query: validated.query,
      location: validated.location,
      limit: validated.limit,
    });

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
