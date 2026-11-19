import { describe, it, expect } from 'vitest';
import { calculateJobMatch, rankJobsForCandidate } from '../../packages/shared/src/match';
import { CandidateProfile, JobPosting } from '../../packages/shared/src/types';

describe('JobMatchingEngine', () => {
  const baseCandidate: CandidateProfile = {
    uid: 'candidate_1',
    preferredName: 'Ramesh Patil',
    district: 'Nagpur',
    taluka: 'Hingna',
    trade: 'electrician',
    qualifications: ['10th', 'ITI_electrician'],
    skillIds: ['house_wiring', 'industrial_panel'],
    experienceMonths: 24,
    expectedWageRange: { min: 15000, max: 20000 },
    maximumTravelKm: 25,
    availability: 'immediate',
    updatedAt: new Date().toISOString(),
  };

  const baseJob: JobPosting = {
    id: 'job_1',
    employerUid: 'emp_1',
    employerName: 'Vidarbha Power Systems',
    title: 'Industrial Electrician',
    description: 'Looking for electrician in Butibori MIDC',
    district: 'Nagpur',
    taluka: 'Butibori',
    areaOrMidc: 'Butibori MIDC',
    requiredSkillIds: ['house_wiring', 'industrial_panel'],
    mandatoryCertificationIds: ['ITI_electrician'],
    salaryMin: 16000,
    salaryMax: 22000,
    salaryPeriod: 'monthly',
    vacancies: 2,
    status: 'open',
    sourceType: 'internal_employer',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('matches candidate with all skills, mandatory cert and same district', () => {
    const result = calculateJobMatch(baseCandidate, baseJob);
    expect(result.eligibility).toBe('eligible');
    expect(result.eligibilityReasonKey).toBe('full_skill_match');
    expect(result.matchedSkills).toEqual(['house_wiring', 'industrial_panel']);
    expect(result.missingSkills).toEqual([]);
    expect(result.locationMatch).toBe(true);
    expect(result.wageCompatible).toBe(true);
    expect(result.matchScore).toBeGreaterThanOrEqual(90);
  });

  it('denies eligibility if mandatory certification is missing', () => {
    const uncertifiedCandidate: CandidateProfile = {
      ...baseCandidate,
      qualifications: ['10th'], // missing ITI_electrician
    };
    const result = calculateJobMatch(uncertifiedCandidate, baseJob);
    expect(result.eligibility).toBe('ineligible');
    expect(result.eligibilityReasonKey).toBe('missing_mandatory_certification');
  });

  it('handles partial skill match with appropriate missing skills explanation', () => {
    const partialCandidate: CandidateProfile = {
      ...baseCandidate,
      skillIds: ['house_wiring'], // missing industrial_panel
    };
    const result = calculateJobMatch(partialCandidate, baseJob);
    expect(result.eligibility).toBe('eligible');
    expect(result.eligibilityReasonKey).toBe('partial_skill_match');
    expect(result.matchedSkills).toEqual(['house_wiring']);
    expect(result.missingSkills).toEqual(['industrial_panel']);
  });

  it('marks ineligible when candidate has zero matching skills', () => {
    const irrelevantCandidate: CandidateProfile = {
      ...baseCandidate,
      skillIds: ['diesel_engine_repair'],
    };
    const result = calculateJobMatch(irrelevantCandidate, baseJob);
    expect(result.eligibility).toBe('ineligible');
    expect(result.eligibilityReasonKey).toBe('no_matching_skills');
    expect(result.matchedSkills).toEqual([]);
    expect(result.missingSkills).toEqual(['house_wiring', 'industrial_panel']);
  });

  it('never invents salary when job does not disclose salary', () => {
    const noSalaryJob: JobPosting = {
      ...baseJob,
      salaryMin: undefined,
      salaryMax: undefined,
    };
    const result = calculateJobMatch(baseCandidate, noSalaryJob);
    expect(result.wageCompatible).toBe('unknown');
  });

  it('marks job ineligible if status is closed', () => {
    const closedJob: JobPosting = {
      ...baseJob,
      status: 'closed',
    };
    const result = calculateJobMatch(baseCandidate, closedJob);
    expect(result.eligibility).toBe('ineligible');
    expect(result.eligibilityReasonKey).toBe('job_not_open');
    expect(result.matchScore).toBe(0);
  });

  it('ranks jobs deterministically with eligible matches on top', () => {
    const closedJob: JobPosting = { ...baseJob, id: 'job_closed', status: 'closed' };
    const partialJob: JobPosting = { ...baseJob, id: 'job_partial', requiredSkillIds: ['house_wiring', 'solar_pv_wiring'] };
    const fullJob: JobPosting = { ...baseJob, id: 'job_full' };

    const ranked = rankJobsForCandidate(baseCandidate, [closedJob, partialJob, fullJob]);
    expect(ranked[0].job.id).toBe('job_full');
    expect(ranked[1].job.id).toBe('job_partial');
    expect(ranked[2].job.id).toBe('job_closed');
  });
});
