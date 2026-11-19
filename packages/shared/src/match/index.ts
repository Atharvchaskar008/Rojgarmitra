import { CandidateProfile, JobPosting, MatchExplanation, EligibilityStatus } from '../types';

export interface MatchingOptions {
  strictCertification?: boolean;
}

/**
 * Pure, deterministic, explainable matching engine for RojgarMitra.
 * Evaluates mandatory qualification/certification gates first, then calculates
 * transparent skill overlap and proximity compatibility without fabricating missing data.
 */
export function calculateJobMatch(
  candidate: CandidateProfile,
  job: JobPosting,
  _options: MatchingOptions = {}
): MatchExplanation {
  // Gate 1: Check if job is actively open
  if (job.status !== 'open') {
    return {
      eligibility: 'ineligible',
      eligibilityReasonKey: 'job_not_open',
      matchScore: 0,
      matchedSkills: [],
      missingSkills: job.requiredSkillIds,
      locationMatch: false,
      wageCompatible: 'unknown',
    };
  }

  // Gate 2: Mandatory certification / license requirements
  const mandatoryCerts = job.mandatoryCertificationIds || [];
  let certEligibility: EligibilityStatus = 'eligible';
  let certReasonKey = 'certifications_met';

  if (mandatoryCerts.length > 0) {
    const candidateQualifications = candidate.qualifications || [];
    const missingCerts = mandatoryCerts.filter(
      cert => !candidateQualifications.includes(cert)
    );

    if (missingCerts.length > 0) {
      certEligibility = 'ineligible';
      certReasonKey = 'missing_mandatory_certification';
    }
  }

  // Gate 3: Skill overlap analysis
  const candidateSkills = new Set(candidate.skillIds || []);
  const requiredSkills = job.requiredSkillIds || [];

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const skillId of requiredSkills) {
    if (candidateSkills.has(skillId)) {
      matchedSkills.push(skillId);
    } else {
      missingSkills.push(skillId);
    }
  }

  // Base score based on percentage of required skills matched
  let skillScore = 0;
  if (requiredSkills.length > 0) {
    skillScore = Math.round((matchedSkills.length / requiredSkills.length) * 75); // up to 75 points
  } else {
    // If no specific skills required, neutral baseline
    skillScore = 50;
  }

  // Gate 4: Location compatibility (Nagpur / Vidarbha regional matching)
  let locationBonus = 0;
  let locationMatch = false;

  if (candidate.district && job.district) {
    const candidateDist = candidate.district.trim().toLowerCase();
    const jobDist = job.district.trim().toLowerCase();

    if (candidateDist === jobDist) {
      locationMatch = true;
      locationBonus = 15; // Same district (e.g. Nagpur)

      // Taluka / Area bonus (e.g. Butibori / Hingna)
      if (
        candidate.taluka &&
        job.taluka &&
        candidate.taluka.trim().toLowerCase() === job.taluka.trim().toLowerCase()
      ) {
        locationBonus = 20; // Exact same taluka
      }
    }
  }

  // Gate 5: Experience bonus
  let experienceBonus = 0;
  if (candidate.experienceMonths > 0) {
    // 1-5 bonus points for relevant hands-on experience
    experienceBonus = Math.min(5, Math.floor(candidate.experienceMonths / 12) * 2);
  }

  // Calculate final score (0 - 100)
  const totalRawScore = skillScore + locationBonus + experienceBonus;
  const matchScore = Math.min(100, Math.max(0, totalRawScore));

  // Determine overall eligibility status
  let finalEligibility: EligibilityStatus = certEligibility;
  let finalReasonKey = certReasonKey;

  if (certEligibility === 'eligible') {
    if (matchedSkills.length === 0 && requiredSkills.length > 0) {
      finalEligibility = 'ineligible';
      finalReasonKey = 'no_matching_skills';
    } else if (matchedSkills.length < requiredSkills.length) {
      finalEligibility = 'eligible';
      finalReasonKey = 'partial_skill_match';
    } else {
      finalEligibility = 'eligible';
      finalReasonKey = 'full_skill_match';
    }
  }

  // Wage compatibility: DO NOT invent salary or treat 0 as match
  let wageCompatible: boolean | 'unknown' = 'unknown';
  if (
    candidate.expectedWageRange &&
    typeof candidate.expectedWageRange.min === 'number' &&
    typeof job.salaryMax === 'number' &&
    job.salaryMax > 0
  ) {
    wageCompatible = job.salaryMax >= candidate.expectedWageRange.min;
  }

  return {
    eligibility: finalEligibility,
    eligibilityReasonKey: finalReasonKey,
    matchScore,
    matchedSkills,
    missingSkills,
    locationMatch,
    wageCompatible,
  };
}

/**
 * Filter and rank jobs for a candidate based on explainable matching score.
 */
export function rankJobsForCandidate(
  candidate: CandidateProfile,
  jobs: JobPosting[]
): { job: JobPosting; match: MatchExplanation }[] {
  return jobs
    .map(job => ({
      job,
      match: calculateJobMatch(candidate, job),
    }))
    .sort((a, b) => {
      // First sort by eligibility: eligible > unknown > ineligible
      const eligibilityOrder: Record<EligibilityStatus, number> = {
        eligible: 3,
        unknown: 2,
        ineligible: 1,
      };
      const diff = eligibilityOrder[b.match.eligibility] - eligibilityOrder[a.match.eligibility];
      if (diff !== 0) return diff;

      // Then sort by matchScore descending
      return b.match.matchScore - a.match.matchScore;
    });
}
