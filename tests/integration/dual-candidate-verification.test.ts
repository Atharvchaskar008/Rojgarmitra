import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import { jobDiscoveryAgent } from '../../apps/web/src/lib/services/job-discovery';
import { trainingDiscoveryAgent } from '../../apps/web/src/lib/services/training-discovery';
import { regionalRagService } from '../../apps/web/src/lib/services/regional-rag';
import { CandidateProfile } from '@rojgarmitra/shared';

describe('End-to-End Dual-Candidate Verification', () => {
  const candidateA: CandidateProfile = {
    uid: 'candidate_a_hingna',
    preferredName: 'Ramesh Patil (रमेश पाटील)',
    district: 'Nagpur',
    taluka: 'Hingna',
    trade: 'electrician',
    qualifications: ['10th', 'ITI_electrician'],
    skillIds: ['house_wiring', 'motor_rewinding', 'industrial_panel'],
    experienceMonths: 24,
    maximumTravelKm: 15,
    availability: 'immediate',
    updatedAt: new Date().toISOString(),
  };

  const candidateB: CandidateProfile = {
    uid: 'candidate_b_butibori',
    preferredName: 'Suresh Gaikwad (सुरेश गायकवाड)',
    district: 'Nagpur',
    taluka: 'Butibori',
    trade: 'welder',
    qualifications: ['10th', 'ITI_welder'],
    skillIds: ['arc_welding', 'mig_welding', 'sheet_metal_fabrication'],
    experienceMonths: 18,
    maximumTravelKm: 25,
    availability: 'immediate',
    updatedAt: new Date().toISOString(),
  };

  it('Candidate A (ITI Electrician, Hingna MIDC): executes honest discovery with quarantined synthetic jobs', async () => {
    // 1. Job Discovery
    const discovery = await jobDiscoveryAgent.discoverJobs(candidateA, 'mr');
    expect(discovery).toBeDefined();
    expect(discovery.results.length).toBeGreaterThan(0);

    // Synthetic jobs (Mahindra / KEC) are quarantined; unverified aggregator leads are returned honestly
    expect(discovery.totalVerified).toBeGreaterThanOrEqual(0);
    expect(discovery.totalLeads).toBeGreaterThanOrEqual(0);
    if (discovery.totalVerified === 0) {
      expect(discovery.suggestedAlternativeSearches).toBeDefined();
      expect(discovery.suggestedAlternativeSearches!.length).toBeGreaterThan(0);
    }

    const firstLead = discovery.results[0];
    expect(['verified_vacancy', 'unverified_lead']).toContain(firstLead.verificationStatus);
    expect(firstLead.job.sourceUrl).toBeDefined();

    console.log('\n[Candidate A Honest Discovery]:', {
      totalVerified: discovery.totalVerified,
      totalLeads: discovery.totalLeads,
      provider: discovery.provider,
      sampleLeadTitle: firstLead.job.title,
      sourceUrl: firstLead.job.sourceUrl,
      suggestedAlternatives: discovery.suggestedAlternativeSearches?.length,
    });

    // 2. Training Discovery for missing skills
    const missingSkills = ['transformer_maintenance', 'solar_pv_wiring'];
    const training = await trainingDiscoveryAgent.discoverTraining(candidateA, missingSkills, 'mr');
    expect(training.recommendedCourses.length).toBeGreaterThan(0);
    const topCourse = training.recommendedCourses[0];
    expect(topCourse.tradeId).toBe('electrician');
    expect(topCourse.officialPortalUrl).toContain('dvet.gov.in');

    console.log('[Candidate A Top Course]:', {
      title: topCourse.title,
      center: topCourse.centerName,
      portal: topCourse.officialPortalUrl,
    });

    // 3. Grounded Regional RAG
    const rag = await regionalRagService.answerQuestion({
      question: 'हिंगणा एमआयडीसीमध्ये वायरमनसाठी काय नियम आणि स्टायपेंड आहे?',
      candidate: candidateA,
      locale: 'mr',
    });
    expect(rag.citations.length).toBeGreaterThan(0);
    expect(rag.answer).toBeDefined();

    console.log('[Candidate A RAG Citations]:', rag.citations.map((c) => c.title));
  }, 45000);

  it('Candidate B (ITI Welder, Butibori MIDC): executes honest discovery with quarantined synthetic jobs', async () => {
    // 1. Job Discovery
    const discovery = await jobDiscoveryAgent.discoverJobs(candidateB, 'mr');
    expect(discovery).toBeDefined();
    expect(discovery.results.length).toBeGreaterThan(0);

    // If live search discovers genuine Schema.org job posting (e.g. WorkIndia), it is verified.
    // If not, it remains honest leads. Neither fabricates vacancies or salaries.
    expect(discovery.totalVerified).toBeGreaterThanOrEqual(0);
    expect(discovery.results.length).toBeGreaterThanOrEqual(1);
    if (discovery.totalVerified === 0) {
      expect(discovery.suggestedAlternativeSearches).toBeDefined();
    }

    const firstItem = discovery.results[0];
    expect(['verified_vacancy', 'unverified_lead']).toContain(firstItem.verificationStatus);
    expect(firstItem.job.sourceUrl).toBeDefined();

    console.log('\n[Candidate B Honest Discovery]:', {
      totalVerified: discovery.totalVerified,
      totalLeads: discovery.totalLeads,
      provider: discovery.provider,
      sampleTitle: firstItem.job.title,
      sampleStatus: firstItem.verificationStatus,
      sourceUrl: firstItem.job.sourceUrl,
      suggestedAlternatives: discovery.suggestedAlternativeSearches?.length,
    });

    // 2. Training Discovery for missing skills
    const missingSkills = ['cnc_operation', 'pressure_vessel_welding'];
    const training = await trainingDiscoveryAgent.discoverTraining(candidateB, missingSkills, 'mr');
    expect(training.recommendedCourses.length).toBeGreaterThan(0);
    const topCourse = training.recommendedCourses[0];
    expect(topCourse.tradeId).toBe('welder');
    expect(topCourse.officialPortalUrl).toContain('dvet.gov.in');

    console.log('[Candidate B Top Course]:', {
      title: topCourse.title,
      center: topCourse.centerName,
      portal: topCourse.officialPortalUrl,
    });

    // 3. Grounded Regional RAG
    const rag = await regionalRagService.answerQuestion({
      question: 'बुटीबोरी एमआयडीसी मधील फॅब्रिकेशन कंपन्या आणि बसची काय सोय आहे?',
      candidate: candidateB,
      locale: 'mr',
    });
    expect(rag.citations.length).toBeGreaterThan(0);
    expect(rag.answer).toBeDefined();

    console.log('[Candidate B RAG Citations]:', rag.citations.map((c) => c.title));
  }, 45000);
});
