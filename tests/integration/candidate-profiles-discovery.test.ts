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
import { CandidateProfile } from '@rojgarmitra/shared';

describe('Dual Profile Verification: Candidate A vs Candidate B', () => {
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

  it('delivers relevant electrical job opportunities for Candidate A (Hingna)', async () => {
    const resultA = await jobDiscoveryAgent.discoverJobs(candidateA, 'mr');
    expect(resultA.results.length).toBeGreaterThan(0);

    const topMatchA = resultA.results[0];
    expect(topMatchA.job.title.toLowerCase()).toMatch(/electric|wireman|solar/);
    expect(topMatchA.match?.match.matchScore).toBeGreaterThanOrEqual(50);
    expect(topMatchA.job.sourceUrl).toBeDefined();
    expect(topMatchA.job.sourceUrl?.startsWith('http')).toBe(true);
  }, 25000);

  it('delivers relevant welding job opportunities for Candidate B (Butibori)', async () => {
    const resultB = await jobDiscoveryAgent.discoverJobs(candidateB, 'mr');
    expect(resultB.results.length).toBeGreaterThan(0);

    const topMatchB = resultB.results[0];
    expect(topMatchB.job.title.toLowerCase()).toContain('weld');
    expect(topMatchB.match?.match.matchScore).toBeGreaterThanOrEqual(40);
    expect(topMatchB.job.sourceUrl).toBeDefined();
    expect(topMatchB.job.sourceUrl?.startsWith('http')).toBe(true);
  }, 25000);

  it('correctly maps missing skills to verified local ITI training courses', () => {
    // Candidate A missing industrial_panel
    const missingA = ['industrial_panel'];
    const trainingA = trainingDiscoveryAgent.discoverTraining(candidateA, missingA, 'mr');

    expect(trainingA.recommendedCourses.length).toBeGreaterThan(0);
    const topCourseA = trainingA.recommendedCourses[0];
    expect(topCourseA.tradeId).toBe('electrician');
    expect(topCourseA.officialUrl).toBe('https://admission.dvet.gov.in');

    // Candidate B missing mig_welding
    const missingB = ['mig_welding'];
    const trainingB = trainingDiscoveryAgent.discoverTraining(candidateB, missingB, 'mr');

    expect(trainingB.recommendedCourses.length).toBeGreaterThan(0);
    const topCourseB = trainingB.recommendedCourses[0];
    expect(topCourseB.tradeId).toBe('welder');
    expect(topCourseB.centerTaluka?.toLowerCase()).toContain('butibori');
  });

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
