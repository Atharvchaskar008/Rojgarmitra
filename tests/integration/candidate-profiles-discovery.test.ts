import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

beforeAll(() => {
  try {
    const envPath = path.resolve(__dirname, '../../apps/web/.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/GEMINI_API_KEY=(.+)/);
      if (match) process.env.GEMINI_API_KEY = match[1].trim();
      const modelMatch = content.match(/GEMINI_MODEL=(.+)/);
      if (modelMatch) process.env.GEMINI_MODEL = modelMatch[1].trim();
    }
  } catch {}
});

import { jobDiscoveryAgent } from '../../apps/web/src/lib/services/job-discovery';
import { trainingDiscoveryAgent } from '../../apps/web/src/lib/services/training-discovery';
import { careerPlannerService } from '../../apps/web/src/lib/services/career-planner';
import { regionalRagService } from '../../apps/web/src/lib/services/regional-rag';
import { CandidateProfile } from '@rojgarmitra/shared';

describe('Rigorous Evidence-Based Verification: Candidate A vs Candidate B', () => {
  // Candidate A: Hingna ITI Electrician (wiring + motor repair, 24m exp, 25km travel)
  const candidateA: CandidateProfile = {
    uid: 'candidate_A_hingna',
    preferredName: 'Ramesh Patil',
    district: 'Nagpur',
    taluka: 'Hingna',
    trade: 'electrician',
    qualifications: ['10th', 'ITI_electrician'],
    skillIds: ['house_wiring', 'motor_rewinding'],
    experienceMonths: 24,
    maximumTravelKm: 25,
    availability: 'immediate',
    updatedAt: new Date().toISOString(),
  };

  // Candidate B: Butibori 10th Welder (arc welding, 12m exp, 20km travel)
  const candidateB: CandidateProfile = {
    uid: 'candidate_B_butibori',
    preferredName: 'Suresh Meshram',
    district: 'Nagpur',
    taluka: 'Butibori',
    trade: 'welder',
    qualifications: ['10th'],
    skillIds: ['arc_welding'],
    experienceMonths: 12,
    maximumTravelKm: 20,
    availability: 'immediate',
    updatedAt: new Date().toISOString(),
  };

  it('enforces strict vacancy verification without fabricating salary or requirements', async () => {
    const resultA = await jobDiscoveryAgent.discoverJobs(candidateA, 'mr');

    // Never fabricates candidate expected salary as advertised job salary
    for (const item of resultA.results) {
      if (item.job.sourceType === 'external_public') {
        expect(item.job.salaryMin).toBeUndefined();
        expect(item.job.salaryMax).toBeUndefined();
      }
      expect(['verified_vacancy', 'unverified_lead', 'expired', 'unavailable']).toContain(item.verificationStatus);
    }

    // If zero verified vacancies exist, provides honest alternative guidance
    if (resultA.totalVerified === 0) {
      expect(resultA.suggestedAlternativeSearches).toBeDefined();
      expect(resultA.suggestedAlternativeSearches!.some(s => s.includes('MahaJobs') || s.includes('ncs.gov.in'))).toBe(true);
    }
  }, 25000);

  it('correctly maps missing skills to official DVET ITI vocational curriculum', async () => {
    // Candidate A missing industrial_panel
    const missingA = ['industrial_panel'];
    const trainingA = await trainingDiscoveryAgent.discoverTraining(candidateA, missingA, 'mr');

    expect(trainingA.recommendedCourses.length).toBeGreaterThan(0);
    const topCourseA = trainingA.recommendedCourses[0];
    expect(topCourseA.tradeId).toBe('electrician');
    expect(topCourseA.officialPortalUrl).toBe('https://admission.dvet.gov.in');
    expect(topCourseA.admissionCycleNote).toContain('admission.dvet.gov.in');

    // Candidate B missing mig_welding
    const missingB = ['mig_welding'];
    const trainingB = await trainingDiscoveryAgent.discoverTraining(candidateB, missingB, 'mr');

    expect(trainingB.recommendedCourses.length).toBeGreaterThan(0);
    const topCourseB = trainingB.recommendedCourses[0];
    expect(topCourseB.tradeId).toBe('welder');
    expect(topCourseB.centerTaluka?.toLowerCase()).toContain('butibori');
  }, 30000);

  it('retrieves evidence-grounded regional RAG answers with citations', async () => {
    const ragResult = await regionalRagService.answerWithRag(
      'Where can I learn solar rooftop wiring in Nagpur district?',
      { trade: 'electrician', taluka: 'Umred', district: 'Nagpur' },
      'mr'
    );

    expect(ragResult.answer).toBeDefined();
    expect(ragResult.citations.length).toBeGreaterThan(0);
    expect(ragResult.retrievedDocumentCount).toBeGreaterThan(0);
    expect(ragResult.citations.some(c => c.sourceUrl.includes('dvet') || c.sourceUrl.includes('ncs'))).toBe(true);
  }, 30000);

  it('generates personalized career roadmap for Candidate A', async () => {
    const planA = await careerPlannerService.generateCareerPlan(candidateA, undefined, 'mr');
    expect(planA.milestones.length).toBeGreaterThanOrEqual(2);
    expect(planA.currentTrade.toLowerCase()).toContain('इलेक्ट्रिशियन');
    expect(planA.disclaimer).toBeDefined();
  }, 20000);

  it('generates personalized career roadmap for Candidate B', async () => {
    const planB = await careerPlannerService.generateCareerPlan(candidateB, undefined, 'mr');
    expect(planB.milestones.length).toBeGreaterThanOrEqual(2);
    expect(planB.currentTrade.toLowerCase()).toContain('वेल्डर');
    expect(planB.disclaimer).toBeDefined();
  }, 20000);
});
