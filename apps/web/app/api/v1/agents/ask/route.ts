import { NextRequest, NextResponse } from 'next/server';
import { geminiClient } from '@/lib/ai/gemini-client';
import { DEMO_SEED_CENTERS, SupportedLocale } from '@rojgarmitra/shared';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawQuestion = (body.question || '').trim();
    const locale: SupportedLocale = body.locale || 'mr';

    if (!rawQuestion) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'Question parameter is required.' } },
        { status: 400 }
      );
    }

    const questionSafe = geminiClient.sanitizeInput(rawQuestion);

    // 1. Evidence Retrieval from verified knowledge base
    const relevantInstitutes = DEMO_SEED_CENTERS.map((c) => ({
      name: locale === 'mr' ? c.nameMr || c.name : locale === 'hi' ? c.nameHi || c.name : c.name,
      district: c.district,
      taluka: c.taluka,
      address: c.address,
      trades: c.supportedTradeIds.join(', '),
      officialPortal: c.officialUrl,
    }));

    const verifiedSources = [
      {
        title: 'DVET Maharashtra Admission Portal',
        url: 'https://admission.dvet.gov.in',
        description: 'Official admission and affiliation portal for all Government ITIs in Maharashtra.',
      },
      {
        title: 'National Career Service (NCS) Maharashtra',
        url: 'https://www.ncs.gov.in',
        description: 'Ministry of Labour & Employment verified job portal.',
      },
      {
        title: 'MahaJobs Maharashtra Portal',
        url: 'https://mahajobs.maharashtra.gov.in',
        description: 'Government of Maharashtra official industrial employment platform.',
      },
    ];

    let answer = '';
    const citations = [...verifiedSources];

    if (geminiClient.isConfigured()) {
      try {
        const evidenceSummary = `
Verified Regional Government Training Institutes (Nagpur District):
${relevantInstitutes.map((i) => `- ${i.name} (${i.taluka}, ${i.district}): Trades [${i.trades}]. Address: ${i.address}. Portal: ${i.officialPortal}`).join('\n')}

Verified Employment Registries:
${verifiedSources.map((s) => `- ${s.title}: ${s.url} (${s.description})`).join('\n')}
`;

        const prompt = `You are the RojgarMitra regional AI assistant answering candidate queries about employment and vocational training in Maharashtra (Vidarbha, Nagpur, Hingna, Butibori, Umred, Katol, Saoner).

Candidate Question: "${questionSafe}"
Preferred Language: "${locale}" (mr = Marathi, hi = Hindi, en = English)

STRICT EVIDENCE GROUNDING RULES:
1. Base your answer ONLY on the retrieved verified evidence below.
2. If asking about ITI admissions or courses, cite admission.dvet.gov.in.
3. If asking about jobs, mention authentic state platforms (MahaJobs, NCS).
4. Do NOT promise guaranteed jobs or invent fake fees. Government ITI CTS courses are state-funded with nominal/free fees.
5. Provide a warm, practical, helpful response in "${locale}".

RETRIEVED EVIDENCE:
${evidenceSummary}`;

        const aiResponse = await geminiClient.generateStructuredJson<{ answer: string }>(
          `${prompt}\n\nRespond strictly with JSON: { "answer": "your localized grounded answer here" }`,
          'You are a grounded employment advisor.'
        );

        if (aiResponse?.answer) {
          answer = aiResponse.answer;
        }
      } catch (err) {
        console.warn('[API /agents/ask] Gemini error, using regional knowledge answer:', (err as Error).message);
      }
    }

    if (!answer) {
      // Deterministic regional fallback
      if (locale === 'mr') {
        answer = `नागपूर आणि विदर्भातील औद्योगिक प्रशिक्षण (ITI) प्रवेशासाठी 'admission.dvet.gov.in' या अधिकृत संकेतस्थळावर अर्ज करता येतो. हिंगणा, बुटीबोरी MIDC, काटोल, सावनेर आणि उमरेड येथे शासकीय ITI उपलब्ध आहेत. नोकरीच्या संधींसाठी महाजॉब्ज (mahajobs.maharashtra.gov.in) किंवा नॅशनल करिअर सर्व्हिस (ncs.gov.in) चा वापर करा.`;
      } else if (locale === 'hi') {
        answer = `नागपुर और विदर्भ में आईटीआई प्रवेश के लिए महाराष्ट्र सरकार के आधिकारिक पोर्टल 'admission.dvet.gov.in' पर जाएं। हिंगना, बुटीबोरी एमआईडीसी, काटोल, सावनेर और उमरेड में सरकारी आईटीआई उपलब्ध हैं। नौकरियों के लिए महाजॉब्स और एनसीएस पोर्टल प्रामाणिक स्रोत हैं।`;
      } else {
        answer = `For vocational training admissions in Nagpur district, visit the official Maharashtra DVET portal at admission.dvet.gov.in. Government ITIs operate in Hingna, Butibori MIDC, Katol, Saoner, and Umred. For verified public employment, access MahaJobs (mahajobs.maharashtra.gov.in) and NCS (ncs.gov.in).`;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        question: questionSafe,
        answer,
        citations,
      },
    });
  } catch (error: any) {
    console.error('[API /api/v1/agents/ask] Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'ASK_AGENT_ERROR', message: error?.message || 'Agent failed to answer' } },
      { status: 500 }
    );
  }
}
