import { CandidateProfile, CareerPlan, SupportedLocale } from '@rojgarmitra/shared';
import { geminiClient } from '../ai/gemini-client';

export class CareerPlannerService {
  /**
   * Generates a context-aware, evidence-grounded career development roadmap.
   * Uses Gemini with candidate regional context, falling back gracefully to deterministic plan.
   */
  async generateCareerPlan(
    candidate: Partial<CandidateProfile>,
    targetRole?: string,
    locale: SupportedLocale = 'mr'
  ): Promise<CareerPlan> {
    const trade = candidate.trade || 'electrician';
    const currentSkills = candidate.skillIds || ['house_wiring'];
    const location = candidate.taluka ? `${candidate.taluka}, ${candidate.district || 'Nagpur'}` : candidate.district || 'Nagpur';
    const expMonths = candidate.experienceMonths || 0;

    if (geminiClient.isConfigured()) {
      try {
        const prompt = `You are a vocational career guidance advisor for Maharashtra candidates in rural/semi-urban regions (Nagpur, Hingna, Butibori MIDC, Umred, Katol, Saoner).
Candidate Context:
- Current Trade: "${trade}"
- Skills possessed: ${JSON.stringify(currentSkills)}
- Experience: ${expMonths} months
- Target Role: "${targetRole || 'Senior Industrial Technician'}"
- Location: "${location}"
- Language: "${locale}" (mr = Marathi, hi = Hindi, en = English)

Generate a grounded 3-stage practical career roadmap for this candidate.
Stage 1: Immediate next skills to master locally (0-6 months).
Stage 2: Advanced certification or specialized equipment (6-12 months).
Stage 3: Supervisory, contractor license (PWD/Government), or specialized industrial role (12-24 months).
Reference real regional training institutions (such as Government ITI Nagpur, ITI Hingna, ITI Butibori, DVET Maharashtra).
Do NOT invent salary promises. Use honest, supportive phrasing in the requested language "${locale}".

Respond strictly with a JSON object conforming to this schema:
{
  "currentTrade": string,
  "targetRole": string,
  "missingSkills": string[],
  "milestones": [
    {
      "title": string,
      "description": string,
      "estimatedMonths": number,
      "targetRole": string,
      "recommendedSkillIds": string[],
      "suggestedCourses": string[]
    }
  ],
  "disclaimer": string
}`;

        const aiPlan = await geminiClient.generateStructuredJson<CareerPlan>(
          prompt,
          'You are an expert vocational career development system for Maharashtra rural and semi-urban trades.'
        );

        if (aiPlan && aiPlan.milestones && Array.isArray(aiPlan.milestones) && aiPlan.milestones.length > 0) {
          return aiPlan;
        }
      } catch (err) {
        console.warn('[CareerPlannerService] AI generation fallback used:', (err as Error).message);
      }
    }

    // Deterministic fallback plan
    return this.getDeterministicPlan(candidate, targetRole, locale);
  }

  public getDeterministicPlan(
    candidate: Partial<CandidateProfile>,
    targetRole?: string,
    locale: SupportedLocale = 'mr'
  ): CareerPlan {
    const trade = candidate.trade || 'electrician';
    const currentSkills = new Set(candidate.skillIds || []);

    if (trade.includes('electrician') || trade.includes('wireman')) {
      if (locale === 'mr') {
        return {
          currentTrade: 'इलेक्ट्रिशियन / वायरमन',
          targetRole: targetRole || 'सोलर व इंडस्ट्रियल इलेक्ट्रिकल सुपरवायझर',
          missingSkills: ['industrial_panel', 'solar_pv_wiring'].filter((s) => !currentSkills.has(s)),
          milestones: [
            {
              title: 'टप्पा १: मूलभूत औद्योगिक वायरिंग कौशल्ये',
              description: 'स्थानिक कारखाने (हिंगणा/बुटीबोरी MIDC) आणि पॅनल वायरिंगमधील प्रत्यक्ष अनुभव मिळवा.',
              estimatedMonths: 6,
              targetRole: 'कनिष्ठ औद्योगिक इलेक्ट्रिशियन',
              recommendedSkillIds: ['industrial_panel', 'motor_rewinding'],
              suggestedCourses: ['Government ITI Hingna - Control Panel Maintenance', 'Government ITI Nagpur CTS'],
            },
            {
              title: 'टप्पा २: पीएम सूर्यघर व सोलर इन्स्टॉलेशन प्रमाणपत्र',
              description: 'महाराष्ट्र ऊर्जा विकास अभिकरण (MEDA) मान्य सोलर पीव्ही रूफटॉप तंत्रज्ञ प्रमाणपत्र मिळवा.',
              estimatedMonths: 6,
              targetRole: 'सोलर तंत्रज्ञ व साईट लीड',
              recommendedSkillIds: ['solar_pv_wiring'],
              suggestedCourses: ['Government ITI Umred - Solar PV Rooftop Technician Course'],
            },
            {
              title: 'टप्पा ३: PWD इलेक्ट्रिकल सुपरवायझर परवाना',
              description: 'महाराष्ट्र शासनाचा सुपरवायझर परवाना परीक्षा उत्तीर्ण करून स्वतःचे काम सुरू करा किंवा मोठ्या प्रकल्पात वरिष्ठ सुपरवायझर व्हा.',
              estimatedMonths: 12,
              targetRole: 'अधिकृत इलेक्ट्रिकल सुपरवायझर',
              recommendedSkillIds: ['transformer_maintenance'],
              suggestedCourses: ['DVET Electrical Supervisor Licensing Prep'],
            },
          ],
          disclaimer: 'सदर मार्गदर्शक आराखडा कौशल्य वृद्धीसाठी आहे. नोकरीची अंतिम निवड नियोक्त्यांच्या अटींवर अवलंबून असते.',
        };
      } else if (locale === 'hi') {
        return {
          currentTrade: 'इलेक्ट्रीशियन / वायरमैन',
          targetRole: targetRole || 'सोलर एवं औद्योगिक इलेक्ट्रिकल सुपरवाइजर',
          missingSkills: ['industrial_panel', 'solar_pv_wiring'].filter((s) => !currentSkills.has(s)),
          milestones: [
            {
              title: 'चरण १: औद्योगिक वायरिंग और कंट्रोल पैनल असेंबली',
              description: 'हिंगना या बुटीबोरी एमआईडीसी के कारखानों में व्यावहारिक अनुभव प्राप्त करें।',
              estimatedMonths: 6,
              targetRole: 'जूनियर इंडस्ट्रियल इलेक्ट्रीशियन',
              recommendedSkillIds: ['industrial_panel', 'motor_rewinding'],
              suggestedCourses: ['Government ITI Hingna Electrical Maintenance'],
            },
            {
              title: 'चरण २: सोलर पीवी तकनीशियन प्रमाणन',
              description: 'पीएम सूर्यघर योजना के तहत सोलर रूफटॉप इंस्टॉलेशन कौशल सीखें।',
              estimatedMonths: 6,
              targetRole: 'सोलर तकनीशियन',
              recommendedSkillIds: ['solar_pv_wiring'],
              suggestedCourses: ['Government ITI Umred Solar PV Course'],
            },
            {
              title: 'चरण ३: राज्य सुपरवाइजर लाइसेंस',
              description: 'राज्य सरकार का विद्युत सुपरवाइजर लाइसेंस परीक्षा पास कर वरिष्ठ पद पाएं।',
              estimatedMonths: 12,
              targetRole: 'इलेक्ट्रिकल सुपरवाइजर',
              recommendedSkillIds: ['transformer_maintenance'],
              suggestedCourses: ['DVET Supervisor Licensing Exam Prep'],
            },
          ],
          disclaimer: 'यह योजना कौशल संवर्धन हेतु है। अंतिम चयन नियोक्ता के साक्षात्कार पर निर्भर करता है।',
        };
      } else {
        return {
          currentTrade: 'Electrician / Wireman',
          targetRole: targetRole || 'Solar & Industrial Electrical Supervisor',
          missingSkills: ['industrial_panel', 'solar_pv_wiring'].filter((s) => !currentSkills.has(s)),
          milestones: [
            {
              title: 'Milestone 1: Industrial Panel & Motor Wiring',
              description: 'Gain hands-on experience in manufacturing plant electrical systems in Butibori or Hingna MIDC.',
              estimatedMonths: 6,
              targetRole: 'Junior Industrial Electrician',
              recommendedSkillIds: ['industrial_panel', 'motor_rewinding'],
              suggestedCourses: ['Government ITI Hingna - Industrial Panel Maintenance'],
            },
            {
              title: 'Milestone 2: Solar Rooftop PV Certification',
              description: 'Acquire renewable energy installation and commissioning skills under PM Surya Ghar.',
              estimatedMonths: 6,
              targetRole: 'Solar Site Lead',
              recommendedSkillIds: ['solar_pv_wiring'],
              suggestedCourses: ['Government ITI Umred Solar Rooftop Course'],
            },
            {
              title: 'Milestone 3: Electrical Supervisor Licensing',
              description: 'Qualify for state licensing to lead electrical contracting projects.',
              estimatedMonths: 12,
              targetRole: 'Licensed Electrical Supervisor',
              recommendedSkillIds: ['transformer_maintenance'],
              suggestedCourses: ['DVET Electrical Supervisor Licensing'],
            },
          ],
          disclaimer: 'This career roadmap is for guidance and skill advancement. Employment decisions depend on employer criteria.',
        };
      }
    }

    // Default roadmap for Welder & Other Industrial Trades
    if (locale === 'mr') {
      return {
        currentTrade: trade === 'welder' ? 'वेल्डर / फॅब्रिकेटर' : (trade === 'fitter_turner' ? 'फिटर / टर्नर' : trade),
        targetRole: targetRole || 'वरिष्ठ फॅब्रिकेशन व वेल्डिंग सुपरवायझर',
        missingSkills: ['mig_welding', 'sheet_metal_fabrication'].filter((s) => !currentSkills.has(s)),
        milestones: [
          {
            title: 'टप्पा १: मिग / टिग वेल्डिंग प्राविण्य',
            description: 'बुटीबोरी औद्योगिक क्षेत्रातील मॅन्युफॅक्चरिंग युनिट्समध्ये प्रगत वेल्डिंग कौशल्य मिळवा.',
            estimatedMonths: 6,
            targetRole: 'कुशल वेल्डर (MIG/TIG)',
            recommendedSkillIds: ['mig_welding', 'tig_welding'],
            suggestedCourses: ['Government ITI Butibori - Specialized Welding Course'],
          },
          {
            title: 'टप्पा २: प्रेशर व्हेसल व पाईपलाईन वेल्डिंग',
            description: 'प्रेशर व्हेसल आणि हेवी स्ट्रक्चरल वेल्डिंगसाठी आयबीआर (IBR) वेल्डर प्रमाणपत्र मिळवा.',
            estimatedMonths: 6,
            targetRole: 'सर्टिफाइड स्ट्रक्चरल वेल्डर',
            recommendedSkillIds: ['sheet_metal_fabrication'],
            suggestedCourses: ['Government ITI Nagpur IBR Welder Training'],
          },
          {
            title: 'टप्पा ३: वेल्डिंग इन्स्पेक्टर व सुपरवायझर',
            description: 'क्वालिटी कंट्रोल आणि वेल्डिंग इन्स्पेक्शन लीड म्हणून कारखान्यात काम करा.',
            estimatedMonths: 12,
            targetRole: 'वेल्डिंग क्वालिटी इन्स्पेक्टर',
            recommendedSkillIds: ['precision_measurement'],
            suggestedCourses: ['NDT Level II Certification'],
          },
        ],
        disclaimer: 'सदर मार्गदर्शक आराखडा कौशल्य वृद्धीसाठी आहे. नोकरीची अंतिम निवड नियोक्त्यांच्या अटींवर अवलंबून असते.',
      };
    }

    return {
      currentTrade: trade,
      targetRole: targetRole || `${trade} Specialist & Team Lead`,
      missingSkills: [],
      milestones: [
        {
          title: 'Milestone 1: Advanced Fabrication Techniques',
          description: 'Master MIG/TIG welding and precision metal working in regional manufacturing units.',
          estimatedMonths: 6,
          targetRole: 'Skilled Welder / Fabricator',
          recommendedSkillIds: candidate.skillIds || ['arc_welding'],
          suggestedCourses: ['Government ITI Butibori Specialized Welding Course'],
        },
        {
          title: 'Milestone 2: Heavy Structural & Pipeline Qualification',
          description: 'Attain IBR certification for high-pressure industrial applications.',
          estimatedMonths: 12,
          targetRole: 'Senior Certified Welder',
          recommendedSkillIds: ['sheet_metal_fabrication'],
          suggestedCourses: ['Government ITI Nagpur Advanced Welding'],
        },
      ],
      disclaimer: 'Career guidance is for vocational advancement. Final selection depends on employer criteria.',
    };
  }
}

export const careerPlannerService = new CareerPlannerService();
