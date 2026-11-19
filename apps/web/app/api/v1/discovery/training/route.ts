import { NextRequest, NextResponse } from 'next/server';
import { trainingDiscoveryAgent } from '@/lib/services/training-discovery';
import { SupportedLocale } from '@rojgarmitra/shared';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const candidate = {
      uid: body.uid,
      district: body.district || 'Nagpur',
      taluka: body.taluka || 'Hingna',
      trade: body.trade || 'electrician',
    };

    const missingSkills = Array.isArray(body.missingSkills) ? body.missingSkills : [];
    const locale = (body.locale || body.preferredLanguage || 'mr') as SupportedLocale;

    const result = await trainingDiscoveryAgent.discoverTraining(candidate, missingSkills, locale);

    return NextResponse.json({
      success: true,
      data: result.recommendedCourses,
      meta: {
        candidateLocation: result.candidateLocation,
        targetSkills: result.targetSkills,
        totalCentersEvaluated: result.totalCentersEvaluated,
        sourceAttribution: result.sourceAttribution,
      },
    });
  } catch (error: any) {
    console.error('[API /api/v1/discovery/training] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'TRAINING_DISCOVERY_ERROR',
          message: error?.message || 'Failed to discover training centers',
        },
      },
      { status: 500 }
    );
  }
}
