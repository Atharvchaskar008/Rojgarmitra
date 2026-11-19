import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireRole, handleApiError } from '@/lib/auth/server-auth';
import { adminDb } from '@/lib/firebase/admin';
import { CandidateProfile, JobPosting, getSkillName, DEMO_SEED_JOBS } from '@rojgarmitra/shared';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    requireRole(user, ['candidate', 'admin']);

    const body = await req.json();
    const { jobId, targetSkillIds = [], locale = 'mr' } = body;

    // 1. Fetch Candidate
    let candidateSkills: string[] = [];
    const candDoc = await adminDb.collection('candidates').doc(user.uid).get();
    if (candDoc.exists) {
      const c = candDoc.data() as CandidateProfile;
      candidateSkills = c.skillIds || [];
    }

    // 2. Fetch Job skills
    let requiredSkills: string[] = targetSkillIds;
    let jobTitle = 'Target Role';

    if (jobId) {
      let job: JobPosting | null = null;
      const jobDoc = await adminDb.collection('jobs').doc(jobId).get();
      if (jobDoc.exists) {
        job = { id: jobDoc.id, ...jobDoc.data() } as JobPosting;
      } else {
        const seed = DEMO_SEED_JOBS.find(j => j.id === jobId);
        if (seed) job = seed;
      }

      if (job) {
        requiredSkills = job.requiredSkillIds;
        jobTitle = job.title;
      }
    }

    const candidateSkillSet = new Set(candidateSkills);
    const matchedSkills = requiredSkills.filter(s => candidateSkillSet.has(s));
    const missingSkills = requiredSkills.filter(s => !candidateSkillSet.has(s));

    const missingWithNames = missingSkills.map(id => ({
      id,
      name: getSkillName(id, locale),
      learningRecommendation: locale === 'mr' 
        ? `स्थानिक ITI किंवा व्यावसायिक प्रशिक्षण केंद्रात या कौशल्याचा अभ्यासक्रम उपलब्ध आहे.`
        : locale === 'hi'
        ? `स्थानीय आईटीआई या व्यावसायिक प्रशिक्षण केंद्र में यह पाठ्यक्रम उपलब्ध है।`
        : `Vocational courses available at regional ITI centers.`,
    }));

    return NextResponse.json({
      data: {
        jobTitle,
        totalRequired: requiredSkills.length,
        matchedCount: matchedSkills.length,
        missingCount: missingSkills.length,
        matchedSkills,
        missingSkills: missingWithNames,
        readinessPercentage: requiredSkills.length > 0 
          ? Math.round((matchedSkills.length / requiredSkills.length) * 100) 
          : 100,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
