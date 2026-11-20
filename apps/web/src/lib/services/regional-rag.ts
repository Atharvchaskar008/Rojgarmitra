import { adminDb } from '../firebase/admin';
import { geminiClient } from '../ai/gemini-client';
import { SupportedLocale } from '@rojgarmitra/shared';

export interface EvidenceDocument {
  id: string;
  evidenceType: 'job_posting' | 'training_center' | 'vocational_course' | 'government_scheme';
  title: string;
  sourceUrl: string;
  content: string;
  tradeTags: string[];
  skillTags: string[];
  geographicMetadata: {
    district: string;
    taluka?: string;
    areaOrMidc?: string;
  };
  verificationStatus: 'verified' | 'provisional' | 'unverified';
  confidence: 'high' | 'medium' | 'low';
  retrievedAt: string;
}

export interface RagResponse {
  answer: string;
  citations: Array<{
    documentId: string;
    title: string;
    sourceUrl: string;
    excerpt: string;
  }>;
  retrievedDocumentCount: number;
}

// Canonical regional evidence corpus for Vidarbha & Nagpur district
const INITIAL_REGIONAL_EVIDENCE: EvidenceDocument[] = [
  {
    id: 'ev_dvet_portal',
    evidenceType: 'government_scheme',
    title: 'Directorate of Vocational Education and Training (DVET) Centralized Admission Portal',
    sourceUrl: 'https://admission.dvet.gov.in',
    content: 'Official government portal for Craftsmen Training Scheme (CTS) ITI admissions in Maharashtra. Centralized rounds start annually in July-August with state-subsidized tuition and reserved category fee concessions.',
    tradeTags: ['electrician', 'welder', 'fitter_turner', 'mechanic', 'plumber'],
    skillTags: ['house_wiring', 'arc_welding', 'lathe_operation'],
    geographicMetadata: {
      district: 'Nagpur',
    },
    verificationStatus: 'verified',
    confidence: 'high',
    retrievedAt: '2026-11-19T06:00:00.000Z',
  },
  {
    id: 'ev_iti_hingna',
    evidenceType: 'training_center',
    title: 'Government ITI Hingna (Hingna Industrial Area)',
    sourceUrl: 'https://admission.dvet.gov.in/institutes/hingna',
    content: 'Government Industrial Training Institute located near MIDC Police Station, Hingna Road, Nagpur 440016. Offers CTS Electrician, Welder, and Fitter trades serving industrial units in Hingna MIDC.',
    tradeTags: ['electrician', 'welder', 'fitter_turner'],
    skillTags: ['industrial_panel', 'motor_rewinding', 'arc_welding'],
    geographicMetadata: {
      district: 'Nagpur',
      taluka: 'Hingna',
      areaOrMidc: 'Hingna MIDC',
    },
    verificationStatus: 'verified',
    confidence: 'high',
    retrievedAt: '2026-11-19T06:00:00.000Z',
  },
  {
    id: 'ev_iti_butibori',
    evidenceType: 'training_center',
    title: 'Butibori Vocational Training Center & ITI',
    sourceUrl: 'https://dvet.gov.in/en/institutes',
    content: 'Vocational training center in Butibori MIDC Industrial Area, Nagpur 441108. Specializes in advanced welding (MIG/TIG), pressure vessel fabrication, and CNC machining for local automotive manufacturers.',
    tradeTags: ['welder', 'fitter_turner', 'logistics_warehouse'],
    skillTags: ['arc_welding', 'mig_welding', 'sheet_metal_fabrication', 'cnc_operation'],
    geographicMetadata: {
      district: 'Nagpur',
      taluka: 'Butibori',
      areaOrMidc: 'Butibori MIDC',
    },
    verificationStatus: 'verified',
    confidence: 'high',
    retrievedAt: '2026-11-19T06:00:00.000Z',
  },
  {
    id: 'ev_iti_umred',
    evidenceType: 'training_center',
    title: 'Government ITI Umred (Bhiwapur Road)',
    sourceUrl: 'https://admission.dvet.gov.in/institutes/umred',
    content: 'Government ITI located at Bhiwapur Road, Umred 441203. Offers CTS Electrician, Motor Mechanic, and specialized PM Surya Ghar Rooftop Solar Technician courses.',
    tradeTags: ['electrician', 'mechanic'],
    skillTags: ['house_wiring', 'solar_pv_wiring'],
    geographicMetadata: {
      district: 'Nagpur',
      taluka: 'Umred',
    },
    verificationStatus: 'verified',
    confidence: 'high',
    retrievedAt: '2026-11-19T06:00:00.000Z',
  },
  {
    id: 'ev_ncs_portal',
    evidenceType: 'government_scheme',
    title: 'National Career Service (NCS) - Ministry of Labour & Employment',
    sourceUrl: 'https://www.ncs.gov.in',
    content: 'Official government job portal providing free job matching, verified vacancy notices, and career counseling for industrial workers and ITI apprentices in Maharashtra.',
    tradeTags: ['electrician', 'welder', 'fitter_turner', 'technician'],
    skillTags: ['house_wiring', 'arc_welding'],
    geographicMetadata: {
      district: 'Nagpur',
    },
    verificationStatus: 'verified',
    confidence: 'high',
    retrievedAt: '2026-11-19T06:00:00.000Z',
  },
  {
    id: 'ev_mahajobs_portal',
    evidenceType: 'government_scheme',
    title: 'MahaJobs Maharashtra Industrial Employment Portal',
    sourceUrl: 'https://mahajobs.maharashtra.gov.in',
    content: 'State of Maharashtra platform connecting local job seekers with registered MIDC industrial employers in Nagpur, Butibori, and Hingna. No fees charged to job seekers.',
    tradeTags: ['electrician', 'welder', 'fitter_turner', 'operator'],
    skillTags: ['industrial_panel', 'cnc_operation', 'arc_welding'],
    geographicMetadata: {
      district: 'Nagpur',
      areaOrMidc: 'Butibori MIDC',
    },
    verificationStatus: 'verified',
    confidence: 'high',
    retrievedAt: '2026-11-19T06:00:00.000Z',
  },
  {
    id: 'ev_msme_tc_nagpur',
    evidenceType: 'training_center',
    title: 'MSME Technology Centre Nagpur (Indo-German Tool Room - IGTR)',
    sourceUrl: 'https://msmetcnagpur.org',
    content: 'Autonomous MSME Ministry institution located at Plot P-142, Hingna MIDC, Nagpur 440028. Provides advanced non-ITI technical training in CNC Machining, CAD/CAM, Master Certificate in Tool Design, Industrial Automation (PLC/SCADA), and Robotics with direct industry placement assistance.',
    tradeTags: ['fitter_turner', 'welder', 'electrician', 'technician'],
    skillTags: ['cnc_operation', 'lathe_operation', 'precision_measurement', 'industrial_panel'],
    geographicMetadata: {
      district: 'Nagpur',
      taluka: 'Hingna',
      areaOrMidc: 'Hingna MIDC',
    },
    verificationStatus: 'verified',
    confidence: 'high',
    retrievedAt: '2026-11-19T06:00:00.000Z',
  },
  {
    id: 'ev_midc_apprenticeship',
    evidenceType: 'vocational_course',
    title: 'MIDC Dual Apprenticeship Program (Apprentices Act 1961)',
    sourceUrl: 'https://www.apprenticeshipindia.gov.in',
    content: 'On-the-job industrial apprenticeship program across Butibori & Hingna MIDC factories (including Mahindra, Solar Industries, CEAT, Morarjee). Unemployed youth and fresh ITI/10th/12th pass outs receive monthly government stipends (₹8,500 - ₹12,000/month), direct hands-on machine experience, and National Apprenticeship Certificate (NAC).',
    tradeTags: ['welder', 'fitter_turner', 'electrician', 'mechanic', 'operator'],
    skillTags: ['arc_welding', 'mig_welding', 'lathe_operation', 'industrial_panel', 'house_wiring'],
    geographicMetadata: {
      district: 'Nagpur',
      taluka: 'Butibori',
      areaOrMidc: 'Butibori & Hingna MIDC',
    },
    verificationStatus: 'verified',
    confidence: 'high',
    retrievedAt: '2026-11-19T06:00:00.000Z',
  },
  {
    id: 'ev_polytechnic_nagpur',
    evidenceType: 'training_center',
    title: 'Government Polytechnic Nagpur (Community Development CDTP)',
    sourceUrl: 'https://www.gpnagpur.ac.in',
    content: 'Autonomous government institution in Sadar, Nagpur 440001 offering polytechnic engineering diplomas and non-formal Community Development Through Polytechnics (CDTP) short-term vocational courses in electrical maintenance, automotive technician, and fabrication.',
    tradeTags: ['electrician', 'mechanic', 'fitter_turner', 'welder'],
    skillTags: ['house_wiring', 'motor_rewinding', 'diesel_engine_repair'],
    geographicMetadata: {
      district: 'Nagpur',
      taluka: 'Nagpur Urban',
    },
    verificationStatus: 'verified',
    confidence: 'high',
    retrievedAt: '2026-11-19T06:00:00.000Z',
  },
  {
    id: 'ev_pmkvy_nagpur',
    evidenceType: 'government_scheme',
    title: 'Pradhan Mantri Kaushal Vikas Yojana (PMKVY 4.0 / NSDC)',
    sourceUrl: 'https://www.pmkvyofficial.org',
    content: 'Free government skill training with zero tuition fees, certified under National Skill Development Corporation (NSDC). Offers short-term 3 to 6-month courses in Solar Rooftop PV installation, CNC turning, and logistics, with government assessment, certificate, and tool-kit allowance.',
    tradeTags: ['electrician', 'welder', 'fitter_turner', 'logistics_warehouse'],
    skillTags: ['solar_pv_wiring', 'cnc_operation', 'arc_welding'],
    geographicMetadata: {
      district: 'Nagpur',
    },
    verificationStatus: 'verified',
    confidence: 'high',
    retrievedAt: '2026-11-19T06:00:00.000Z',
  },
  {
    id: 'ev_bharat_skills_dgt',
    evidenceType: 'vocational_course',
    title: 'Bharat Skills (DGT NIMI) Free Digital Learning Resources',
    sourceUrl: 'https://bharatskills.gov.in',
    content: 'Official digital learning portal offering free downloadable textbooks, question banks, interactive practical e-books, and instructional videos in Marathi and Hindi for Electrician, Fitter, Welder, and Wireman trades.',
    tradeTags: ['electrician', 'welder', 'fitter_turner', 'mechanic'],
    skillTags: ['house_wiring', 'industrial_panel', 'arc_welding', 'mig_welding', 'lathe_operation'],
    geographicMetadata: {
      district: 'Nagpur',
    },
    verificationStatus: 'verified',
    confidence: 'high',
    retrievedAt: '2026-11-19T06:00:00.000Z',
  },
  {
    id: 'ev_rojgarmitra_platform',
    evidenceType: 'government_scheme',
    title: 'RojgarMitra Vidarbha Platform Navigation & Features',
    sourceUrl: 'https://rojgarmitra-vidarbha.firebaseapp.com',
    content: 'RojgarMitra is a localized employment and vocational platform for Nagpur and Vidarbha. Features: 1. Jobs Feed (/candidate): Browse and 1-click apply to real verified vacancies in Butibori, Hingna, Umred MIDC. 2. Profile (/candidate/onboarding): Fill in free-form words or speak in Marathi/Hindi to analyze skills. 3. Career Plan (/candidate/career): 3-year grounded roadmap with free YouTube and Bharat Skills resources. 4. Upskilling (/candidate/upskilling): Directory of DVET ITIs, MSME Tool Room, MIDC Apprenticeships, and Government Polytechnics. 5. Applications (/candidate/applications): Track employer interview and selection status.',
    tradeTags: ['electrician', 'welder', 'fitter_turner', 'mechanic', 'logistics_warehouse'],
    skillTags: ['house_wiring', 'industrial_panel', 'arc_welding', 'mig_welding', 'cnc_operation'],
    geographicMetadata: {
      district: 'Nagpur',
      taluka: 'Hingna',
      areaOrMidc: 'Vidarbha',
    },
    verificationStatus: 'verified',
    confidence: 'high',
    retrievedAt: '2026-11-19T06:00:00.000Z',
  },
];

export class RegionalRagService {
  private inMemoryCorpus: Map<string, EvidenceDocument> = new Map();
  private queryCache: Map<string, { response: RagResponse; expiresAt: number }> = new Map();

  constructor() {
    for (const doc of INITIAL_REGIONAL_EVIDENCE) {
      this.inMemoryCorpus.set(doc.id, doc);
    }
  }

  /**
   * Stores verified evidence into Firestore and memory index.
   */
  async storeEvidence(doc: EvidenceDocument): Promise<void> {
    this.inMemoryCorpus.set(doc.id, doc);
    try {
      if (adminDb && typeof adminDb.collection === 'function') {
        await adminDb.collection('regionalEvidence').doc(doc.id).set(doc, { merge: true });
      }
    } catch {
      // Memory fallback for tests
    }
  }

  /**
   * Hybrid retrieval: filters and ranks evidence by trade, skills, and geographic proximity.
   */
  async retrieveEvidence(params: {
    trade?: string;
    skills?: string[];
    taluka?: string;
    district?: string;
    query?: string;
    limit?: number;
  }): Promise<EvidenceDocument[]> {
    const limit = params.limit || 5;
    const targetTrade = (params.trade || '').toLowerCase();
    const targetTaluka = (params.taluka || '').toLowerCase();
    const targetDistrict = (params.district || 'Nagpur').toLowerCase();
    const targetSkills = new Set((params.skills || []).map((s) => s.toLowerCase()));
    const queryTokens = (params.query || '')
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 2);

    // Try fetching latest evidence from Firestore first so allDocs includes external additions
    try {
      if (adminDb && typeof adminDb.collection === 'function') {
        const snap = await adminDb.collection('regionalEvidence').get();
        if (!snap.empty) {
          snap.forEach((d) => {
            const data = d.data() as EvidenceDocument;
            this.inMemoryCorpus.set(d.id, data);
          });
        }
      }
    } catch {
      // Memory fallback
    }

    const allDocs: EvidenceDocument[] = Array.from(this.inMemoryCorpus.values());

    const scored = allDocs.map((doc) => {
      let score = 0;

      // Location matching
      const docDistrict = doc.geographicMetadata.district.toLowerCase();
      const docTaluka = (doc.geographicMetadata.taluka || '').toLowerCase();
      if (targetTaluka && docTaluka.includes(targetTaluka)) {
        score += 40;
      } else if (docDistrict.includes(targetDistrict)) {
        score += 20;
      }

      // Trade matching
      if (targetTrade && doc.tradeTags.some((t) => t.toLowerCase().includes(targetTrade))) {
        score += 35;
      }

      // Skill overlap
      for (const skill of doc.skillTags) {
        if (targetSkills.has(skill.toLowerCase())) {
          score += 20;
        }
      }

      // Query token overlap against title and content
      if (queryTokens.length > 0) {
        const titleLower = doc.title.toLowerCase();
        const contentLower = doc.content.toLowerCase();
        for (const token of queryTokens) {
          if (titleLower.includes(token)) score += 15;
          if (contentLower.includes(token)) score += 8;
        }
      }

      // High confidence bonus
      if (doc.confidence === 'high') score += 10;

      return { doc, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map((s) => s.doc);
  }

  /**
   * Convenience alias for answerWithRag
   */
  async answerQuestion(params: {
    question: string;
    candidate: { trade?: string; skillIds?: string[]; skills?: string[]; taluka?: string; district?: string };
    locale?: SupportedLocale;
  }): Promise<RagResponse> {
    return this.answerWithRag(
      params.question,
      {
        trade: params.candidate.trade,
        skills: params.candidate.skillIds || params.candidate.skills,
        taluka: params.candidate.taluka,
        district: params.candidate.district,
      },
      params.locale || 'mr'
    );
  }

  /**
   * Executes Grounded RAG reasoning using retrieved evidence and Gemini.
   */
  async answerWithRag(
    question: string,
    candidateContext: {
      trade?: string;
      skills?: string[];
      taluka?: string;
      district?: string;
      currentPath?: string;
      userRole?: string;
      currentSituation?: string;
      targetGoal?: string;
      candidateName?: string;
    },
    locale: SupportedLocale = 'mr'
  ): Promise<RagResponse> {
    const sanitizedQuestion = geminiClient.sanitizeInput(question);
    const cacheKey = `${locale}:${candidateContext.trade || ''}:${candidateContext.taluka || ''}:${sanitizedQuestion.toLowerCase().trim()}`;
    const cached = this.queryCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.response;
    }

    // 1. Retrieve relevant evidence
    const evidenceDocs = await this.retrieveEvidence({
      trade: candidateContext.trade,
      skills: candidateContext.skills,
      taluka: candidateContext.taluka,
      district: candidateContext.district,
      query: sanitizedQuestion,
      limit: 4,
    });

    const citations = evidenceDocs.map((doc) => ({
      documentId: doc.id,
      title: doc.title,
      sourceUrl: doc.sourceUrl,
      excerpt: doc.content.slice(0, 180),
    }));

    // 2. Synthesize with Gemini if configured
    if (geminiClient.isConfigured() && evidenceDocs.length > 0) {
      try {
        const evidenceContextText = evidenceDocs
          .map((doc, idx) => `[DOC-${idx + 1}] Title: ${doc.title}\nURL: ${doc.sourceUrl}\nContent: ${doc.content}`)
          .join('\n\n');

        const prompt = `You are "Mitra" (मित्र), the intelligent, friendly JARVIS-like AI career and employment companion for Maharashtra youth on the RojgarMitra Vidarbha platform.

Candidate Query: "${sanitizedQuestion}"
Preferred Language: "${locale}" (mr = Marathi, hi = Hindi, en = English)
Active Page in App: "${candidateContext.currentPath || '/'}"
User Role: "${candidateContext.userRole || 'candidate'}"
Candidate Name: "${candidateContext.candidateName || 'Candidate'}"
Candidate Trade/Location: "${candidateContext.trade || 'general'} in ${candidateContext.taluka || 'Vidarbha'}, ${candidateContext.district || 'Nagpur'}"
Current Situation & Pressure: "${candidateContext.currentSituation || 'Seeking immediate stable income / career progression'}"
Target Goal: "${candidateContext.targetGoal || 'Standard trade employment in Vidarbha'}"

STRICT GUIDELINES:
1. Speak naturally as a supportive, knowledgeable mentor and companion ("मी मित्र बोलतोय..."). Address the candidate warmly.
2. Base factual claims on the official evidence provided below. When discussing training, highlight that options include not just ITI, but also MIDC Factory Apprenticeships (with monthly stipend under Apprentices Act 1961), MSME Technology Center (Indo-German Tool Room) Hingna, Government Polytechnics, PMKVY 4.0, and free Bharat Skills digital textbooks.
3. REALISTIC MARKET HONESTY (NO GENERIC BOILERPLATE):
   - NEVER give thoughtless brush-offs like "visit your nearest ITI".
   - If the candidate describes distress, financial pressure, or multi-year government exam preparation (e.g. MPSC/Talathi traps with 0.1% selection rates), provide honest, compassionate counsel: recommend not giving up on long-term dreams entirely, but advise them to stop remaining financially vulnerable. Explain that Hingna and Butibori MIDC industries have immediate paying vacancies (starting at ₹12,000–₹18,000/mo) and paid on-the-job apprenticeships (₹9,500/mo stipend) where they can start earning within 15–30 days while preparing part-time.
   - Outline a concrete 30-day next step.
4. If the user asks about using the website or finding jobs, guide them clearly:
   - Browse & 1-click apply to jobs at /candidate
   - Complete skill profile at /candidate/onboarding
   - View 3-year career development roadmap & reality check at /candidate/career
   - View technical institutions & apprenticeships at /candidate/upskilling
   - Track application status at /candidate/applications
5. Always answer in "${locale}". Keep the answer punchy, spoken-friendly, conversational, and uplifting.

RETRIEVED EVIDENCE:
${evidenceContextText}

Respond with a JSON object:
{
  "answer": "your conversational, grounded answer here"
}`;

        const aiResult = await geminiClient.generateStructuredJson<{ answer: string }>(prompt);
        if (aiResult?.answer) {
          const resObj = {
            answer: aiResult.answer,
            citations,
            retrievedDocumentCount: evidenceDocs.length,
          };
          this.queryCache.set(cacheKey, { response: resObj, expiresAt: Date.now() + 15 * 60 * 1000 });
          return resObj;
        }
      } catch (err) {
        console.warn('[RegionalRagService] Gemini synthesis error, using evidence fallback:', (err as Error).message);
      }
    }

    // Deterministic evidence-backed fallback
    let fallbackAnswer = '';
    const topDoc = evidenceDocs[0];
    if (locale === 'mr') {
      fallbackAnswer = `उपलब्ध अधिकृत माहितीनुसार: ${topDoc.title} येथे संबंधित माहिती उपलब्ध आहे. तपशील: ${topDoc.content} अधिक माहितीसाठी अधिकृत पोर्टलला भेट द्या: ${topDoc.sourceUrl}`;
    } else if (locale === 'hi') {
      fallbackAnswer = `उपलब्ध आधिकारिक जानकारी के अनुसार: ${topDoc.title} पर संबंधित जानकारी उपलब्ध है। विवरण: ${topDoc.content} अधिक जानकारी के लिए आधिकारिक पोर्टल पर जाएं: ${topDoc.sourceUrl}`;
    } else {
      fallbackAnswer = `Based on retrieved official evidence from ${topDoc.title}: ${topDoc.content} For complete details, visit: ${topDoc.sourceUrl}`;
    }

    const fallbackResponse = {
      answer: fallbackAnswer,
      citations,
      retrievedDocumentCount: evidenceDocs.length,
    };
    this.queryCache.set(cacheKey, { response: fallbackResponse, expiresAt: Date.now() + 15 * 60 * 1000 });
    return fallbackResponse;
  }
}

export const regionalRagService = new RegionalRagService();
