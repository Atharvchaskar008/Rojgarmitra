import {
  TrainingCenter,
  DEMO_SEED_CENTERS,
  CandidateProfile,
  SupportedLocale,
} from '@rojgarmitra/shared';

export interface VerifiedCourseDetail {
  id: string;
  centerId: string;
  centerName: string;
  centerAddress: string;
  centerTaluka?: string;
  title: string;
  titleMr?: string;
  titleHi?: string;
  tradeId: string;
  skillsTaught: string[];
  durationMonths: number;
  feeEstimated: number; // 0 for government ITI
  isGovernmentFunded: boolean;
  officialUrl: string;
  admissionStatus: 'open' | 'closed' | 'upcoming';
  distanceCategory: 'local_taluka' | 'same_district' | 'regional';
  relevanceExplanation: string;
}

export interface TrainingDiscoveryResponse {
  targetSkills: string[];
  candidateLocation: string;
  recommendedCourses: VerifiedCourseDetail[];
  totalCentersEvaluated: number;
  sourceAttribution: string;
}

// Canonical certified vocational courses in DVET Maharashtra ITIs
const VERIFIED_DVET_COURSES: Array<Omit<VerifiedCourseDetail, 'centerName' | 'centerAddress' | 'centerTaluka' | 'distanceCategory' | 'relevanceExplanation'>> = [
  {
    id: 'course_dvet_elec_cts',
    centerId: 'iti_nagpur_gov',
    title: 'CTS Electrician & Industrial Wiring',
    titleMr: 'इलेक्ट्रिशियन व औद्योगिक वायरिंग (CTS)',
    titleHi: 'इलेक्ट्रीशियन एवं औद्योगिक वायरिंग (CTS)',
    tradeId: 'electrician',
    skillsTaught: ['house_wiring', 'industrial_panel', 'motor_rewinding', 'transformer_maintenance'],
    durationMonths: 24,
    feeEstimated: 0,
    isGovernmentFunded: true,
    officialUrl: 'https://admission.dvet.gov.in',
    admissionStatus: 'open',
  },
  {
    id: 'course_dvet_elec_hingna',
    centerId: 'iti_hingna_gov',
    title: 'Industrial Electrical Maintenance & Control Panels',
    titleMr: 'औद्योगिक इलेक्ट्रिकल देखभाल आणि कंट्रोल पॅनल',
    titleHi: 'औद्योगिक इलेक्ट्रिकल मेंटेनेंस एवं कंट्रोल पैनल',
    tradeId: 'electrician',
    skillsTaught: ['industrial_panel', 'motor_rewinding'],
    durationMonths: 6,
    feeEstimated: 0,
    isGovernmentFunded: true,
    officialUrl: 'https://admission.dvet.gov.in',
    admissionStatus: 'open',
  },
  {
    id: 'course_dvet_welder_butibori',
    centerId: 'iti_butibori_sub',
    title: 'MIG/TIG Welding & Pressure Vessel Fabrication',
    titleMr: 'मिग/टिग वेल्डिंग आणि प्रेशरायझ्ड फॅब्रिकेशन',
    titleHi: 'मिग/टिग वेल्डिंग एवं फैब्रिकेशन',
    tradeId: 'welder',
    skillsTaught: ['arc_welding', 'mig_welding', 'tig_welding', 'sheet_metal_fabrication'],
    durationMonths: 12,
    feeEstimated: 0,
    isGovernmentFunded: true,
    officialUrl: 'https://admission.dvet.gov.in',
    admissionStatus: 'open',
  },
  {
    id: 'course_dvet_solar_umred',
    centerId: 'iti_umred_gov',
    title: 'Solar PV Rooftop Technician (Surya Ghar Yojana)',
    titleMr: 'सोलर पीव्ही रूफटॉप तंत्रज्ञ (सूर्यघर योजना)',
    titleHi: 'सोलर पीवी रूफटॉप तकनीशियन',
    tradeId: 'electrician',
    skillsTaught: ['solar_pv_wiring', 'house_wiring'],
    durationMonths: 3,
    feeEstimated: 0,
    isGovernmentFunded: true,
    officialUrl: 'https://admission.dvet.gov.in',
    admissionStatus: 'open',
  },
  {
    id: 'course_dvet_fitter_katol',
    centerId: 'iti_katol_gov',
    title: 'Mechanical Fitter & Lathe Machine Operation',
    titleMr: 'मेकॅनिकल फिटर व लेथ मशीन ऑपरेटर',
    titleHi: 'मैकेनिकल फिटर एवं लेथ मशीन ऑपरेटर',
    tradeId: 'fitter_turner',
    skillsTaught: ['lathe_operation', 'bench_fitting', 'precision_measurement'],
    durationMonths: 24,
    feeEstimated: 0,
    isGovernmentFunded: true,
    officialUrl: 'https://admission.dvet.gov.in',
    admissionStatus: 'open',
  },
  {
    id: 'course_dvet_welder_saoner',
    centerId: 'iti_saoner_gov',
    title: 'Gas & Electric Arc Welder (Structural)',
    titleMr: 'गॅस व इलेक्ट्रिक आर्क वेल्डर (स्ट्रक्चरल)',
    titleHi: 'गैस एवं इलेक्ट्रिक आर्क वेल्डर',
    tradeId: 'welder',
    skillsTaught: ['arc_welding', 'gas_cutting', 'safety_compliance'],
    durationMonths: 12,
    feeEstimated: 0,
    isGovernmentFunded: true,
    officialUrl: 'https://admission.dvet.gov.in',
    admissionStatus: 'open',
  },
];

export class TrainingDiscoveryAgent {
  private centers: TrainingCenter[];

  constructor(centers?: TrainingCenter[]) {
    this.centers = centers || DEMO_SEED_CENTERS;
  }

  /**
   * Recommends verified vocational training courses and institutes based on missing candidate skills.
   */
  discoverTraining(
    candidate: Partial<CandidateProfile>,
    missingSkills: string[] = [],
    locale: SupportedLocale = 'mr'
  ): TrainingDiscoveryResponse {
    const candidateTaluka = (candidate.taluka || '').toLowerCase();
    const candidateDistrict = (candidate.district || 'Nagpur').toLowerCase();
    const centerMap = new Map<string, TrainingCenter>();
    for (const c of this.centers) {
      centerMap.set(c.id, c);
    }

    const missingSkillsSet = new Set(missingSkills);

    const scoredCourses = VERIFIED_DVET_COURSES.map((course) => {
      const center = centerMap.get(course.centerId);
      const centerTaluka = (center?.taluka || '').toLowerCase();
      const centerDistrict = (center?.district || 'Nagpur').toLowerCase();

      // Proximity score
      let distanceCategory: 'local_taluka' | 'same_district' | 'regional' = 'regional';
      let proximityBonus = 0;
      if (candidateTaluka && centerTaluka.includes(candidateTaluka)) {
        distanceCategory = 'local_taluka';
        proximityBonus = 40;
      } else if (centerDistrict.includes(candidateDistrict)) {
        distanceCategory = 'same_district';
        proximityBonus = 20;
      }

      // Skill overlap with missing skills
      const overlapSkills = course.skillsTaught.filter((s) => missingSkillsSet.has(s));
      const overlapScore = overlapSkills.length * 30;

      // Trade match bonus
      const tradeBonus = (candidate.trade && course.tradeId === candidate.trade) ? 20 : 0;

      const totalScore = overlapScore + proximityBonus + tradeBonus;

      // Localized explanation
      let relevanceExplanation = '';
      if (locale === 'mr') {
        relevanceExplanation = overlapSkills.length > 0
          ? `हे प्रशिक्षण तुमच्याकडील कमी असलेली कौशल्ये (${overlapSkills.join(', ')}) शिकवते.`
          : `तुमच्या ${course.tradeId} व्यवसायाशी संबंधित अधिकृत शासकीय प्रशिक्षण.`;
      } else if (locale === 'hi') {
        relevanceExplanation = overlapSkills.length > 0
          ? `यह प्रशिक्षण आपके आवश्यक कौशल (${overlapSkills.join(', ')}) सिखाता है।`
          : `आपके व्यवसाय से संबंधित प्रमाणित सरकारी प्रशिक्षण।`;
      } else {
        relevanceExplanation = overlapSkills.length > 0
          ? `Covers your missing skills: ${overlapSkills.join(', ')}.`
          : `Official government certified vocational training for ${course.tradeId}.`;
      }

      const result: VerifiedCourseDetail & { totalScore: number } = {
        ...course,
        centerName: center?.name || 'Government ITI',
        centerAddress: center?.address || '',
        centerTaluka: center?.taluka,
        distanceCategory,
        relevanceExplanation,
        totalScore,
      };

      return result;
    });

    // Rank courses by score
    scoredCourses.sort((a, b) => b.totalScore - a.totalScore);

    return {
      targetSkills: missingSkills,
      candidateLocation: candidate.taluka ? `${candidate.taluka}, ${candidate.district}` : (candidate.district || 'Nagpur'),
      recommendedCourses: scoredCourses.map(({ totalScore, ...course }) => course),
      totalCentersEvaluated: this.centers.length,
      sourceAttribution: 'Directorate of Vocational Education and Training (DVET), Government of Maharashtra (admission.dvet.gov.in)',
    };
  }
}

export const trainingDiscoveryAgent = new TrainingDiscoveryAgent();
