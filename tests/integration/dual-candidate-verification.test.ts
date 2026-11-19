import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import { jobDiscoveryAgent } from '../../apps/web/src/lib/services/job-discovery';
import { trainingDiscoveryAgent } from '../../apps/web/src/lib/services/training-discovery';
import { regionalRagService } from '../../apps/web/src/lib/services/regional-rag';
import { CandidateProfile } from '@rojgarmitra/shared';

// Load .env.local if present
const envPath = 'C:\\Projects\\Ycce-hackkumbh\\apps\\web\\.env.local';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx > -1) {
        const k = trimmed.substring(0, idx).trim();
        let v = trimmed.substring(idx + 1).trim();
        if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
        process.env[k] = v;
      }
    }
  }
}

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

  it('Candidate A (ITI Electrician, Hingna MIDC): executes complete discovery, upskilling, and RAG', async () => {
    // 1. Job Discovery
    const discovery = await jobDiscoveryAgent.discoverJobs(candidateA, 'mr');
    expect(discovery).toBeDefined();
    expect(discovery.results.length).toBeGreaterThan(0);
    expect(discovery.totalVerified).toBeGreaterThanOrEqual(1);

    // Verify top job is in Hingna or Nagpur
    const topVerified = discovery.results.find((r) => r.verificationStatus === 'verified_vacancy');
    expect(topVerified).toBeDefined();
    expect(topVerified!.job.title.toLowerCase()).toContain('electrician');
    expect(topVerified!.evidence.confidence).toBe('high');

    console.log('\n[Candidate A Verified Job]:', {
      title: topVerified!.job.title,
      employer: topVerified!.job.employerName,
      location: `${topVerified!.job.areaOrMidc || topVerified!.job.taluka}, ${topVerified!.job.district}`,
      vacancies: topVerified!.job.vacancies,
      matchScore: topVerified!.match?.match.matchScore,
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
  }, 25000);

  it('Candidate B (ITI Welder, Butibori MIDC): executes complete discovery, upskilling, and RAG', async () => {
    // 1. Job Discovery
    const discovery = await jobDiscoveryAgent.discoverJobs(candidateB, 'mr');
    expect(discovery).toBeDefined();
    expect(discovery.results.length).toBeGreaterThan(0);
    expect(discovery.totalVerified).toBeGreaterThanOrEqual(1);

    const topVerified = discovery.results.find((r) => r.verificationStatus === 'verified_vacancy');
    expect(topVerified).toBeDefined();
    expect(topVerified!.job.title.toLowerCase()).toContain('welder');
    expect(topVerified!.evidence.confidence).toBe('high');

    console.log('\n[Candidate B Verified Job]:', {
      title: topVerified!.job.title,
      employer: topVerified!.job.employerName,
      location: `${topVerified!.job.areaOrMidc || topVerified!.job.taluka}, ${topVerified!.job.district}`,
      vacancies: topVerified!.job.vacancies,
      matchScore: topVerified!.match?.match.matchScore,
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
  }, 25000);
});
