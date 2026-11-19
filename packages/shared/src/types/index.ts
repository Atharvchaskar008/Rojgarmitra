export type UserRole = 'candidate' | 'employer' | 'admin';

export type SupportedLocale = 'mr' | 'hi' | 'en';

export interface UserAccount {
  uid: string;
  email?: string;
  phone?: string;
  role: UserRole;
  preferredLocale: SupportedLocale;
  createdAt: string;
  updatedAt: string;
  consentFlags?: {
    voice?: boolean;
    sms?: boolean;
    location?: boolean;
  };
}

export interface CandidateProfile {
  uid: string;
  preferredName: string;
  district: string; // e.g. Nagpur
  taluka?: string; // e.g. Hingna, Umred, Katol, Saoner
  village?: string;
  pincode?: string;
  trade?: string; // primary trade e.g. 'electrician', 'welder', 'fitter'
  qualifications: string[]; // self-declared qualifications e.g. '10th', '12th', 'ITI_electrician'
  skillIds: string[]; // standardized skill IDs
  experienceMonths: number;
  expectedWageRange?: {
    min: number;
    max: number;
  };
  maximumTravelKm?: number;
  availability: 'immediate' | 'two_weeks' | 'one_month';
  phone?: string;
  updatedAt: string;
}

export type EmployerVerificationStatus = 'unverified' | 'self_registered' | 'verified';

export interface EmployerProfile {
  uid: string;
  businessName: string;
  contactName: string;
  district: string;
  taluka?: string;
  industrialArea?: string; // e.g. Butibori MIDC, Hingna MIDC
  companyCategory: string; // e.g. 'manufacturing', 'logistics', 'agro', 'service'
  phone?: string;
  verificationStatus: EmployerVerificationStatus;
  createdAt: string;
  updatedAt: string;
}

export type JobSourceType = 'internal_employer' | 'external_public' | 'demo_seed';
export type JobStatus = 'open' | 'closed' | 'filled' | 'unverified';

export interface JobPosting {
  id: string;
  employerUid?: string;
  employerName: string;
  title: string;
  description: string;
  district: string;
  taluka?: string;
  areaOrMidc?: string; // e.g. Butibori MIDC
  requiredSkillIds: string[];
  mandatoryCertificationIds?: string[]; // e.g. 'ITI_cert' or 'driving_license'
  salaryMin?: number;
  salaryMax?: number;
  salaryPeriod?: 'monthly' | 'daily' | 'hourly';
  vacancies?: number;
  status: JobStatus;
  sourceType: JobSourceType;
  sourceUrl?: string; // mandatory if external_public
  sourceDomain?: string;
  observedAt?: string;
  lastCheckedAt?: string;
  freshnessStatus?: 'fresh' | 'stale' | 'unverified';
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus = 
  | 'applied' 
  | 'shortlisted' 
  | 'interview_requested' 
  | 'accepted' 
  | 'rejected';

export interface JobApplication {
  id: string;
  candidateUid: string;
  jobId: string;
  employerUid: string;
  status: ApplicationStatus;
  candidateName?: string;
  candidatePhone?: string;
  candidateSkills?: string[];
  candidateTrade?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type EligibilityStatus = 'eligible' | 'ineligible' | 'unknown';

export interface MatchExplanation {
  eligibility: EligibilityStatus;
  eligibilityReasonKey: string;
  matchScore: number; // 0 - 100
  matchedSkills: string[];
  missingSkills: string[];
  locationMatch: boolean;
  wageCompatible: boolean | 'unknown';
}

export interface TrainingCenter {
  id: string;
  name: string;
  nameMr?: string;
  nameHi?: string;
  district: string;
  taluka?: string;
  address: string;
  supportedTradeIds: string[];
  officialUrl?: string;
  mapPlaceId?: string;
  sourceUrl: string;
  verifiedStatus: 'official_gov' | 'verified_partner' | 'community_reported';
  lastCheckedAt: string;
}

export interface VocationalCourse {
  id: string;
  centerId: string;
  title: string;
  titleMr?: string;
  titleHi?: string;
  tradeId: string;
  skillIds: string[];
  durationMonths: number;
  fees: number; // 0 for government ITI or subsidized
  enrollmentStatus: 'open' | 'upcoming' | 'closed' | 'unknown';
  officialEnrollUrl?: string;
  sourceUrl: string;
  lastCheckedAt: string;
}

export interface CareerMilestone {
  title: string;
  description: string;
  estimatedMonths: number;
  targetRole: string;
  recommendedSkillIds: string[];
  suggestedCourses?: string[];
}

export interface CareerPlan {
  currentTrade: string;
  targetRole: string;
  missingSkills: string[];
  milestones: CareerMilestone[];
  disclaimer: string;
}
