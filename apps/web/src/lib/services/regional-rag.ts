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
];

export class RegionalRagService {
  private inMemoryCorpus: Map<string, EvidenceDocument> = new Map();

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
    limit?: number;
  }): Promise<EvidenceDocument[]> {
    const limit = params.limit || 5;
    const targetTrade = (params.trade || '').toLowerCase();
    const targetTaluka = (params.taluka || '').toLowerCase();
    const targetDistrict = (params.district || 'Nagpur').toLowerCase();
    const targetSkills = new Set((params.skills || []).map((s) => s.toLowerCase()));

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
    },
    locale: SupportedLocale = 'mr'
  ): Promise<RagResponse> {
    const sanitizedQuestion = geminiClient.sanitizeInput(question);

    // 1. Retrieve relevant evidence
    const evidenceDocs = await this.retrieveEvidence({
      trade: candidateContext.trade,
      skills: candidateContext.skills,
      taluka: candidateContext.taluka,
      district: candidateContext.district,
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

        const prompt = `You are the RojgarMitra regional AI employment & vocational advisor for Maharashtra candidates.

Candidate Query: "${sanitizedQuestion}"
Preferred Language: "${locale}" (mr = Marathi, hi = Hindi, en = English)

STRICT EVIDENCE GROUNDING RULES:
1. Base your answer ONLY on the retrieved official evidence provided below.
2. Cite the source document by name or URL (e.g. admission.dvet.gov.in, mahajobs.maharashtra.gov.in).
3. Do NOT invent fake exam fees or guaranteed salaries.
4. Keep the tone helpful, clear, and encouraging in "${locale}".

RETRIEVED EVIDENCE:
${evidenceContextText}

Respond with a JSON object:
{
  "answer": "your grounded answer here"
}`;

        const aiResult = await geminiClient.generateStructuredJson<{ answer: string }>(prompt);
        if (aiResult?.answer) {
          return {
            answer: aiResult.answer,
            citations,
            retrievedDocumentCount: evidenceDocs.length,
          };
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

    return {
      answer: fallbackAnswer,
      citations,
      retrievedDocumentCount: evidenceDocs.length,
    };
  }
}

export const regionalRagService = new RegionalRagService();
