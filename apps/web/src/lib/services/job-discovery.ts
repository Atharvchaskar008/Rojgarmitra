import {
  CandidateProfile,
  JobPosting,
  JobMatchResult,
  rankJobsForCandidate,
  SupportedLocale,
} from '@rojgarmitra/shared';
import { geminiClient } from '../ai/gemini-client';
import { adminDb } from '../firebase/admin';
import {
  SearchProvider,
  NormalizedSourceRecord,
  OrchestratedSearchProvider,
  searchProviderService,
} from './search-providers';
import {
  VacancyVerificationStatus,
  VerifiedSourceEvidence,
  vacancyVerifier,
} from './vacancy-verifier';

export type { VacancyVerificationStatus, VerifiedSourceEvidence };

export interface DiscoveredJobOpportunity {
  job: JobPosting;
  verificationStatus: VacancyVerificationStatus;
  evidence: VerifiedSourceEvidence;
  match?: JobMatchResult;
  relevanceExplanation?: string;
}

export interface JobDiscoveryResponse {
  totalVerified: number;
  totalLeads: number;
  provider: string;
  searchQueries: string[];
  results: DiscoveredJobOpportunity[];
  suggestedAlternativeSearches?: string[];
  metadata: {
    searchedAt: string;
    candidateTrade?: string;
    targetLocation: string;
    hasGroundingEvidence: boolean;
  };
}

export type { SearchProvider };

export class JobDiscoveryAgent {
  private provider: SearchProvider;

  constructor(provider?: SearchProvider) {
    this.provider = provider || searchProviderService;
  }

  /**
   * Discovers genuine vacancies matching the candidate's context.
   * Strict verification rules:
   * 1. Never fabricates salary, vacancies, or requirements.
   * 2. Never converts a generic web citation directly into a verified vacancy.
   * 3. Labels generic citations as 'unverified_lead'.
   * 4. Returns 0 verified jobs when no authentic vacancies are confirmed.
   * 5. Uses live Tavily / Gemini search with safe page verification.
   */
  async discoverJobs(
    candidate: Partial<CandidateProfile>,
    locale: SupportedLocale = 'mr'
  ): Promise<JobDiscoveryResponse> {
    const trade = candidate.trade || 'technician';
    const skills = candidate.skillIds || [];
    const location = candidate.taluka
      ? `${candidate.taluka}, ${candidate.district || 'Nagpur'}`
      : candidate.district || 'Nagpur';

    const opportunities: DiscoveredJobOpportunity[] = [];
    const seenJobIds = new Set<string>();

    // Step 1: Query authentic internal employer vacancies from Firestore
    try {
      if (adminDb && typeof adminDb.collection === 'function') {
        const jobsSnapshot = await adminDb.collection('jobs').where('status', '==', 'open').get();
        jobsSnapshot.forEach((doc) => {
          const data = doc.data() as JobPosting;
          const isTradeMatch =
            !candidate.trade ||
            data.title.toLowerCase().includes(trade.toLowerCase()) ||
            (data.requiredSkillIds && data.requiredSkillIds.some((s) => skills.includes(s)));

          const isLocMatch =
            !candidate.district ||
            data.district.toLowerCase() === (candidate.district || '').toLowerCase();

          if (isTradeMatch || isLocMatch) {
            const jobId = doc.id;
            if (!seenJobIds.has(jobId)) {
              seenJobIds.add(jobId);
              opportunities.push({
                job: { ...data, id: jobId },
                verificationStatus: 'verified_vacancy',
                evidence: {
                  evidenceType: 'internal_employer_posting',
                  confidence: 'high',
                  sourcePortalName: 'RojgarMitra Employer Portal',
                  observedAt: data.createdAt || new Date().toISOString(),
                  notes: 'Posted directly by registered employer with verified contact.',
                },
              });
            }
          }
        });
      }
    } catch (err) {
      console.warn('[JobDiscoveryAgent] Firestore employer query skipped:', (err as Error).message);
    }

    // Step 2: Generate localized search queries
    let plannedQueries: string[] = [];
    try {
      plannedQueries = await geminiClient.planJobSearchQueries({
        trade,
        skills,
        qualifications: candidate.qualifications,
        location,
        locale,
      });
    } catch {
      // Robust domain fallback
      const talukaName = candidate.taluka || 'Hingna';
      plannedQueries = [
        `${trade} vacancy ${talukaName} Nagpur MIDC`,
        `ITI ${trade} job ${location}`,
        `Industrial ${trade} opening Nagpur`,
      ];
    }

    if (!plannedQueries || plannedQueries.length === 0) {
      plannedQueries = [`${trade} vacancies ${location} MIDC`];
    }

    // Step 3: Execute web search (Tavily / Gemini Grounding)
    const primaryQuery = plannedQueries[0] || `${trade} jobs ${location}`;
    let searchRecords: NormalizedSourceRecord[] = [];
    let hasGrounding = false;

    if (this.provider.isAvailable()) {
      try {
        searchRecords = await this.provider.search(primaryQuery, { location, maxResults: 5 });
        hasGrounding = searchRecords.length > 0;
      } catch (searchErr) {
        console.warn('[JobDiscoveryAgent] Search provider error:', (searchErr as Error).message);
      }
    }

    // Step 4: Extract and verify external job evidence
    for (const record of searchRecords) {
      if (!record.url || !record.url.startsWith('http')) continue;

      let domain = '';
      try {
        domain = new URL(record.url).hostname.replace('www.', '');
      } catch {
        continue;
      }

      // Verify the record using VacancyVerifier
      const verification = await vacancyVerifier.verifySourceRecord(record, trade);

      // Skip expired or permanently unavailable
      if (verification.status === 'expired' || verification.status === 'unavailable') {
        continue;
      }

      const jobId = `ext_${Buffer.from(record.url).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)}`;
      if (seenJobIds.has(jobId)) continue;
      seenJobIds.add(jobId);

      let extractedDistrict = '';
      const titleLower = record.title.toLowerCase();
      if (titleLower.includes('nagpur')) extractedDistrict = 'Nagpur';
      else if (titleLower.includes('wardha')) extractedDistrict = 'Wardha';
      else if (titleLower.includes('amravati')) extractedDistrict = 'Amravati';

      const externalJob: JobPosting = {
        id: jobId,
        title: verification.extractedJob?.title || (record.title.length > 5 ? record.title.slice(0, 100) : `${trade} Lead (${domain})`),
        description: verification.status === 'verified_vacancy'
          ? `Verified external vacancy on ${domain}. Direct application available at ${record.url}.`
          : `Discovered from public source on ${domain}. This citation is an unverified search lead and does not confirm an active individual vacancy. Details must be confirmed directly at ${record.url}.`,
        employerName: verification.extractedJob?.employerName || `Employer (${domain})`,
        district: verification.extractedJob?.district || extractedDistrict,
        taluka: verification.extractedJob?.taluka,
        areaOrMidc: verification.extractedJob?.areaOrMidc,
        requiredSkillIds: verification.extractedJob?.requiredSkillIds || [],
        mandatoryCertificationIds: verification.extractedJob?.mandatoryCertificationIds || [],
        salaryMin: verification.extractedJob?.salaryMin,
        salaryMax: verification.extractedJob?.salaryMax,
        vacancies: verification.extractedJob?.vacancies || 0,
        status: verification.status === 'verified_vacancy' ? 'open' : 'unverified',
        sourceType: 'external_public',
        sourceUrl: record.url,
        sourceDomain: domain,
        observedAt: new Date().toISOString(),
        lastCheckedAt: new Date().toISOString(),
        freshnessStatus: verification.status === 'verified_vacancy' ? 'fresh' : 'unverified',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      opportunities.push({
        job: externalJob,
        verificationStatus: verification.status,
        evidence: verification.evidence,
      });

      // If independently verified, cache into Firestore externalJobs collection for regional RAG
      if (verification.status === 'verified_vacancy') {
        try {
          if (adminDb && typeof adminDb.collection === 'function') {
            await adminDb.collection('externalJobs').doc(jobId).set(externalJob, { merge: true });
          }
        } catch {
          // ignore cache errors
        }
      }
    }

    // Step 5: Rank verified jobs using the deterministic matching engine
    const candidateProfileObj: CandidateProfile = {
      uid: candidate.uid || 'candidate_anon',
      preferredName: candidate.preferredName || 'Candidate',
      district: candidate.district || 'Nagpur',
      taluka: candidate.taluka,
      trade: candidate.trade,
      qualifications: candidate.qualifications || [],
      skillIds: candidate.skillIds || [],
      experienceMonths: candidate.experienceMonths || 0,
      expectedWageRange: candidate.expectedWageRange,
      maximumTravelKm: candidate.maximumTravelKm || 25,
      availability: candidate.availability || 'immediate',
      updatedAt: new Date().toISOString(),
    };

    const ranked = rankJobsForCandidate(
      candidateProfileObj,
      opportunities.map((o) => o.job)
    );

    const opportunityMap = new Map<string, DiscoveredJobOpportunity>();
    for (const opp of opportunities) {
      opportunityMap.set(opp.job.id, opp);
    }

    const finalResults: DiscoveredJobOpportunity[] = ranked.map((matchItem) => {
      const original = opportunityMap.get(matchItem.job.id)!;
      return {
        ...original,
        match: matchItem,
        relevanceExplanation: this.generateRelevanceExplanation(matchItem, original.verificationStatus, locale),
      };
    });

    const verifiedCount = finalResults.filter((r) => r.verificationStatus === 'verified_vacancy').length;
    const leadsCount = finalResults.filter((r) => r.verificationStatus === 'unverified_lead').length;

    // Alternative suggestions if no verified vacancies exist
    const suggestedAlternativeSearches: string[] = [];
    if (verifiedCount === 0) {
      suggestedAlternativeSearches.push(
        'Check the Maharashtra State MahaJobs portal directly: https://mahajobs.maharashtra.gov.in',
        'Search the National Career Service (NCS) directory: https://www.ncs.gov.in',
        'Contact Government ITI Nagpur / Hingna placement cell for local industrial apprenticeship openings.'
      );
    }

    return {
      totalVerified: verifiedCount,
      totalLeads: leadsCount,
      provider: this.provider.name,
      searchQueries: plannedQueries,
      results: finalResults,
      suggestedAlternativeSearches: suggestedAlternativeSearches.length > 0 ? suggestedAlternativeSearches : undefined,
      metadata: {
        searchedAt: new Date().toISOString(),
        candidateTrade: trade,
        targetLocation: location,
        hasGroundingEvidence: hasGrounding,
      },
    };
  }

  private generateRelevanceExplanation(
    matchResult: JobMatchResult,
    verificationStatus: VacancyVerificationStatus,
    locale: SupportedLocale
  ): string {
    const { match, job } = matchResult;
    const score = match.matchScore;
    const matchedCount = match.matchedSkills.length;
    const missingCount = match.missingSkills.length;

    const isVerified = verificationStatus === 'verified_vacancy';

    if (locale === 'mr') {
      const statusNote = isVerified ? 'अधिकृत पडताळणी झालेली नोकरी' : 'प्राथमिक शोध माहिती (पडताळणी आवश्यक)';
      if (score >= 80) {
        return `[${statusNote}] उच्च जुळणी (${score}%): तुमच्या ${matchedCount} कौशल्यांशी थेट जुळणारे काम. ${job.areaOrMidc || job.district} येथे उपलब्ध.`;
      }
      if (score >= 40) {
        return `[${statusNote}] मध्यम जुळणी (${score}%): तुमची ${matchedCount} कौशल्ये जुळतात; ${missingCount} अतिरिक्त कौशल्ये शिकल्यास पात्रता वाढेल.`;
      }
      return `[${statusNote}] कमी जुळणी (${score}%): आवश्यक कौशल्ये पूर्ण करण्यासाठी व्यावसायिक प्रशिक्षण आवश्यक आहे.`;
    }

    if (locale === 'hi') {
      const statusNote = isVerified ? 'सत्यापित पद' : 'प्राथमिक खोज परिणाम (सत्यापन आवश्यक)';
      if (score >= 80) {
        return `[${statusNote}] उच्च मिलान (${score}%): आपके ${matchedCount} कौशलों से सीधा मेल खाता है। ${job.areaOrMidc || job.district} में उपलब्ध।`;
      }
      if (score >= 40) {
        return `[${statusNote}] मध्यम मिलान (${score}%): आपके ${matchedCount} कौशल मेल खाते हैं, ${missingCount} अतिरिक्त कौशलों का प्रशिक्षण उपयोगी होगा।`;
      }
      return `[${statusNote}] कम मिलान (${score}%): आवश्यक कौशल सीखने के लिए व्यावसायिक प्रशिक्षण की सिफारिश की जाती है।`;
    }

    // Default English
    const statusNote = isVerified ? 'Verified Vacancy' : 'Unverified Lead';
    if (score >= 80) {
      return `[${statusNote}] Strong match (${score}%): Aligns with ${matchedCount} of your skills in ${job.areaOrMidc || job.district}.`;
    }
    if (score >= 40) {
      return `[${statusNote}] Moderate match (${score}%): Aligns with ${matchedCount} skills; bridging ${missingCount} skills improves qualification.`;
    }
    return `[${statusNote}] Low match (${score}%): Further vocational training recommended.`;
  }
}

export const jobDiscoveryAgent = new JobDiscoveryAgent();
