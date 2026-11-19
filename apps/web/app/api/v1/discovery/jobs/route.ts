import { NextRequest, NextResponse } from 'next/server';
import { jobDiscoveryAgent } from '@/lib/services/job-discovery';
import { SupportedLocale } from '@rojgarmitra/shared';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const candidate = {
      uid: body.uid || 'anon_candidate',
      preferredName: body.preferredName || body.name || 'Candidate',
      district: body.district || 'Nagpur',
      taluka: body.taluka || 'Hingna',
      trade: body.trade || 'electrician',
      qualifications: Array.isArray(body.qualifications) ? body.qualifications : (body.education ? [body.education] : []),
      skillIds: Array.isArray(body.skills) ? body.skills : (Array.isArray(body.skillIds) ? body.skillIds : ['house_wiring']),
      experienceMonths: typeof body.experienceMonths === 'number' ? body.experienceMonths : 0,
      expectedWageRange: body.expectedWageRange || (body.expectedSalaryMin ? { min: body.expectedSalaryMin, max: body.expectedSalaryMin * 1.4 } : undefined),
      maximumTravelKm: body.maximumTravelKm || 25,
      availability: body.availability || 'immediate',
    };

    const locale = (body.preferredLanguage || body.locale || 'mr') as SupportedLocale;

    const discoveryResult = await jobDiscoveryAgent.discoverJobs(candidate, locale);

    return NextResponse.json({
      success: true,
      data: discoveryResult.results,
      meta: {
        totalFound: discoveryResult.totalFound,
        provider: discoveryResult.provider,
        searchQueries: discoveryResult.searchQueries,
        metadata: discoveryResult.metadata,
        attributionNotice: 'Verified public employment opportunities. Sourced with Google Search Grounding and state employment registries. No charges apply.',
      },
    });
  } catch (error: any) {
    console.error('[API /api/v1/discovery/jobs] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DISCOVERY_ERROR',
          message: error?.message || 'Failed to discover jobs',
        },
      },
      { status: 500 }
    );
  }
}
