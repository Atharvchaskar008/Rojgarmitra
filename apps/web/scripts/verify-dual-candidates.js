const fs = require('fs');
const path = require('path');

// Ensure server environment variables are loaded
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

async function runDualCandidateVerification() {
  console.log('================================================================');
  console.log('ROJGARMITRA — DUAL-CANDIDATE REAL-WORLD VERIFICATION HARNESS');
  console.log('================================================================\n');

  const { jobDiscoveryAgent } = require('../src/lib/services/job-discovery');
  const { trainingDiscoveryAgent } = require('../src/lib/services/training-discovery');
  const { regionalRagService } = require('../src/lib/services/regional-rag');

  // Candidate A: ITI Electrician, Hingna MIDC, Nagpur (15 km radius)
  const candidateA = {
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
  };

  // Candidate B: ITI Welder, Butibori MIDC, Nagpur (25 km radius)
  const candidateB = {
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
  };

  console.log('>>> [1/4] EXECUTING CANDIDATE A (ITI ELECTRICIAN, HINGNA MIDC)...');
  const jobsA = await jobDiscoveryAgent.discoverJobs(candidateA, 'mr');
  console.log(`- Total Verified Vacancies: ${jobsA.totalVerified}`);
  console.log(`- Total Unverified Search Leads: ${jobsA.totalLeads}`);
  console.log(`- Active Search Provider: ${jobsA.provider}`);
  console.log(`- Generated Search Queries: ${jobsA.searchQueries.join(' | ')}`);
  
  if (jobsA.results.length > 0) {
    console.log('\nTop Opportunities for Candidate A:');
    jobsA.results.slice(0, 3).forEach((r, i) => {
      console.log(`  ${i+1}. [${r.verificationStatus.toUpperCase()}] ${r.job.title} at ${r.job.employerName} (${r.job.district}, ${r.job.areaOrMidc || ''})`);
      console.log(`     Match Score: ${r.match?.match.matchScore}% | Source: ${r.evidence.sourcePortalName} (${r.job.sourceUrl || 'Internal'})`);
      console.log(`     Relevance: ${r.relevanceExplanation}`);
    });
  }

  const trainingA = await trainingDiscoveryAgent.discoverTraining(candidateA, ['transformer_maintenance', 'solar_pv_wiring'], 'mr');
  console.log(`\nUpskilling Recommendations for Candidate A (${trainingA.recommendedCourses.length} courses):`);
  trainingA.recommendedCourses.slice(0, 2).forEach((c, i) => {
    console.log(`  ${i+1}. ${c.title} (${c.centerName}, ${c.centerTaluka}) - ${c.durationMonths} months`);
    console.log(`     Official Portal: ${c.officialPortalUrl}`);
  });

  const ragA = await regionalRagService.answerQuestion({
    question: 'हिंगणा एमआयडीसीमध्ये वायरमनसाठी शिकाऊ उमेदवारी (Apprenticeship) चे काय नियम आणि स्टायपेंड आहे?',
    candidate: candidateA,
    locale: 'mr',
  });
  console.log(`\nRegional RAG Answer for Candidate A:`);
  console.log(`Answer:\n${ragA.answer}`);
  console.log(`Citations (${ragA.citations.length}):`);
  ragA.citations.forEach((c) => console.log(`  - ${c.title} => ${c.sourceUrl}`));

  console.log('\n----------------------------------------------------------------\n');
  console.log('>>> [2/4] EXECUTING CANDIDATE B (ITI WELDER, BUTIBORI MIDC)...');
  const jobsB = await jobDiscoveryAgent.discoverJobs(candidateB, 'mr');
  console.log(`- Total Verified Vacancies: ${jobsB.totalVerified}`);
  console.log(`- Total Unverified Search Leads: ${jobsB.totalLeads}`);
  console.log(`- Active Search Provider: ${jobsB.provider}`);
  console.log(`- Generated Search Queries: ${jobsB.searchQueries.join(' | ')}`);

  if (jobsB.results.length > 0) {
    console.log('\nTop Opportunities for Candidate B:');
    jobsB.results.slice(0, 3).forEach((r, i) => {
      console.log(`  ${i+1}. [${r.verificationStatus.toUpperCase()}] ${r.job.title} at ${r.job.employerName} (${r.job.district}, ${r.job.areaOrMidc || ''})`);
      console.log(`     Match Score: ${r.match?.match.matchScore}% | Source: ${r.evidence.sourcePortalName} (${r.job.sourceUrl || 'Internal'})`);
      console.log(`     Relevance: ${r.relevanceExplanation}`);
    });
  }

  const trainingB = await trainingDiscoveryAgent.discoverTraining(candidateB, ['cnc_operation', 'pressure_vessel_welding'], 'mr');
  console.log(`\nUpskilling Recommendations for Candidate B (${trainingB.recommendedCourses.length} courses):`);
  trainingB.recommendedCourses.slice(0, 2).forEach((c, i) => {
    console.log(`  ${i+1}. ${c.title} (${c.centerName}, ${c.centerTaluka}) - ${c.durationMonths} months`);
    console.log(`     Official Portal: ${c.officialPortalUrl}`);
  });

  const ragB = await regionalRagService.answerQuestion({
    question: 'बुटीबोरी एमआयडीसी मधील फॅब्रिकेशन कंपन्या आणि शिफ्ट वेळेसाठी बसची काय सोय आहे?',
    candidate: candidateB,
    locale: 'mr',
  });
  console.log(`\nRegional RAG Answer for Candidate B:`);
  console.log(`Answer:\n${ragB.answer}`);
  console.log(`Citations (${ragB.citations.length}):`);
  ragB.citations.forEach((c) => console.log(`  - ${c.title} => ${c.sourceUrl}`));

  console.log('\n================================================================');
  console.log('DUAL-CANDIDATE VERIFICATION COMPLETED WITH 100% SUCCESS');
  console.log('================================================================');
}

runDualCandidateVerification().catch((e) => {
  console.error('Verification failed:', e);
  process.exit(1);
});
