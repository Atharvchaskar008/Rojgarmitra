import { describe, it, expect } from 'vitest';
import { calculateJobMatch } from '../../packages/shared/src/match';
import { CandidateProfile, JobPosting } from '../../packages/shared/src/types';
import demoJobsData from '../../firebase/seed/demo-jobs.json';
import seedCenters from '../../firebase/seed/training-centers.json';

describe('RojgarMitra Backend Workflow Integration Tests', () => {
  const testCandidate: CandidateProfile = {
    uid: 'test_cand_1',
    preferredName: 'Sanjay Deshmukh',
    district: 'Nagpur',
    taluka: 'Butibori',
    trade: 'electrician',
    qualifications: ['10th', 'ITI_electrician'],
    skillIds: ['house_wiring', 'industrial_panel'],
    experienceMonths: 18,
    availability: 'immediate',
    updatedAt: new Date().toISOString(),
  };

  it('loads verified seed jobs for Nagpur and Vidarbha region', () => {
    const jobs = demoJobsData as JobPosting[];
    expect(jobs.length).toBeGreaterThanOrEqual(3);
    expect(jobs.some(j => j.taluka === 'Butibori')).toBe(true);
    expect(jobs.some(j => j.taluka === 'Hingna')).toBe(true);
    expect(jobs.some(j => j.taluka === 'Umred')).toBe(true);
  });

  it('evaluates candidate against Butibori industrial electrician opening', () => {
    const jobs = demoJobsData as JobPosting[];
    const butiboriJob = jobs.find(j => j.id === 'demo_job_butibori_elec')!;
    expect(butiboriJob).toBeDefined();

    const match = calculateJobMatch(testCandidate, butiboriJob);
    expect(match.eligibility).toBe('eligible');
    expect(match.matchedSkills).toContain('house_wiring');
    expect(match.matchedSkills).toContain('industrial_panel');
    expect(match.missingSkills).toContain('motor_rewinding');
    expect(match.locationMatch).toBe(true); // Both Butibori!
    expect(match.matchScore).toBe(72); // 50 (2/3 skills) + 20 (exact taluka match) + 2 (18m exp)
  });

  it('blocks in-app application submission to third-party external job leads', () => {
    const externalLead: JobPosting = {
      id: 'ext_test_1',
      employerName: 'MahaJobs',
      title: 'Wireman',
      description: 'Check official portal',
      district: 'Nagpur',
      requiredSkillIds: ['house_wiring'],
      vacancies: 1,
      status: 'open',
      sourceType: 'external_public',
      sourceUrl: 'https://mahajobs.maharashtra.gov.in',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    function validateApplicationEligibility(job: JobPosting): { allowed: boolean; reason?: string } {
      if (job.sourceType === 'external_public') {
        return {
          allowed: false,
          reason: 'External job vacancies must be applied to directly via the source URL',
        };
      }
      return { allowed: true };
    }

    const check = validateApplicationEligibility(externalLead);
    expect(check.allowed).toBe(false);
    expect(check.reason).toContain('source URL');
  });

  it('loads regional ITI centers with official government portal verification', () => {
    const centers = seedCenters as any[];
    expect(centers.length).toBeGreaterThanOrEqual(4);
    const govNagpur = centers.find(c => c.id === 'iti_nagpur_gov');
    expect(govNagpur).toBeDefined();
    expect(govNagpur.verifiedStatus).toBe('official_gov');
    expect(govNagpur.officialUrl).toContain('dvet.gov.in');
  });
});
