import { CandidateProfile, CareerPlan, SupportedLocale } from '@rojgarmitra/shared';

export class CareerPlannerService {
  generateCareerPlan(
    candidate: CandidateProfile,
    targetRole?: string,
    locale: SupportedLocale = 'mr'
  ): CareerPlan {
    const trade = candidate.trade || 'electrician';
    const currentSkills = new Set(candidate.skillIds || []);

    if (trade.includes('electrician')) {
      if (locale === 'mr') {
        return {
          currentTrade: 'इलेक्ट्रिशियन / वायरमन',
          targetRole: targetRole || 'सोलर व इंडस्ट्रियल इलेक्ट्रिकल सुपरवायझर',
          missingSkills: ['industrial_panel', 'solar_pv_wiring'].filter(s => !currentSkills.has(s)),
          milestones: [
            {
              title: 'टप्पा १: मूलभूत औद्योगिक वायरिंग कौशल्ये',
              description: 'स्थानिक कारखाने आणि पॅनल वायरिंगमधील प्रत्यक्ष अनुभव मिळवा.',
              estimatedMonths: 6,
              targetRole: 'कनिष्ठ इलेक्ट्रिशियन',
              recommendedSkillIds: ['industrial_panel', 'motor_rewinding'],
              suggestedCourses: ['Government ITI Nagpur - CTS Electrician', 'Butibori Industrial Training'],
            },
            {
              title: 'टप्पा २: पीएम सूर्यघर व सोलर इन्स्टॉलेशन प्रमाणपत्र',
              description: 'महाराष्ट्र ऊर्जा विकास अभिकरण (MEDA) मान्य सोलर पीव्ही रूफटॉप तंत्रज्ञ प्रमाणपत्र मिळवा.',
              estimatedMonths: 6,
              targetRole: 'सोलर तंत्रज्ञ व साईट लीड',
              recommendedSkillIds: ['solar_pv_wiring'],
              suggestedCourses: ['MEDA Solar Rooftop Technician Course'],
            },
            {
              title: 'टप्पा ३: PWD इलेक्ट्रिकल सुपरवायझर परवाना',
              description: 'महाराष्ट्र शासनाचा सुपरवायझर परवाना परीक्षा उत्तीर्ण करून स्वतःचे काम सुरू करा किंवा मोठ्या प्रकल्पात वरिष्ठ सुपरवायझर व्हा.',
              estimatedMonths: 12,
              targetRole: 'अधिकृत इलेक्ट्रिकल सुपरवायझर',
              recommendedSkillIds: ['transformer_maintenance'],
            },
          ],
          disclaimer: 'सदर मार्गदर्शक आराखडा कौशल्य वृद्धीसाठी आहे. नोकरीची अंतिम निवड नियोक्त्यांच्या अटींवर अवलंबून असते.',
        };
      } else if (locale === 'hi') {
        return {
          currentTrade: 'इलेक्ट्रीशियन / वायरमैन',
          targetRole: targetRole || 'सोलर एवं औद्योगिक इलेक्ट्रिकल सुपरवाइजर',
          missingSkills: ['industrial_panel', 'solar_pv_wiring'].filter(s => !currentSkills.has(s)),
          milestones: [
            {
              title: 'चरण १: औद्योगिक वायरिंग और पैनल असेंबली',
              description: 'कारखानों और वाणिज्यिक भवनों में व्यावहारिक अनुभव प्राप्त करें।',
              estimatedMonths: 6,
              targetRole: 'जूनियर इलेक्ट्रीशियन',
              recommendedSkillIds: ['industrial_panel', 'motor_rewinding'],
              suggestedCourses: ['Government ITI Nagpur CTS Electrician'],
            },
            {
              title: 'चरण २: सोलर पीवी तकनीशियन प्रमाणन',
              description: 'सोलर ऊर्जा क्षेत्र में बढ़ते अवसरों के लिए प्रमाणन प्राप्त करें।',
              estimatedMonths: 6,
              targetRole: 'सोलर तकनीशियन',
              recommendedSkillIds: ['solar_pv_wiring'],
              suggestedCourses: ['Solar PV Rooftop Technician Course'],
            },
            {
              title: 'चरण ३: इलेक्ट्रिकल सुपरवाइजर लाइसेंस',
              description: 'राज्य सरकार का सुपरवाइजर लाइसेंस प्राप्त कर स्वतंत्र कार्य या वरिष्ठ पद पाएं।',
              estimatedMonths: 12,
              targetRole: 'इलेक्ट्रिकल सुपरवाइजर',
              recommendedSkillIds: ['transformer_maintenance'],
            },
          ],
          disclaimer: 'यह योजना कौशल संवर्धन हेतु है। अंतिम चयन नियोक्ता के साक्षात्कार पर निर्भर करता है।',
        };
      } else {
        return {
          currentTrade: 'Electrician / Wireman',
          targetRole: targetRole || 'Solar & Industrial Electrical Supervisor',
          missingSkills: ['industrial_panel', 'solar_pv_wiring'].filter(s => !currentSkills.has(s)),
          milestones: [
            {
              title: 'Milestone 1: Industrial Panel & Motor Wiring',
              description: 'Gain hands-on experience in manufacturing plant electrical systems.',
              estimatedMonths: 6,
              targetRole: 'Junior Industrial Electrician',
              recommendedSkillIds: ['industrial_panel', 'motor_rewinding'],
              suggestedCourses: ['Government ITI Nagpur - CTS Electrician'],
            },
            {
              title: 'Milestone 2: Solar Rooftop PV Certification',
              description: 'Acquire renewable energy installation and commissioning skills.',
              estimatedMonths: 6,
              targetRole: 'Solar Site Lead',
              recommendedSkillIds: ['solar_pv_wiring'],
              suggestedCourses: ['MEDA Solar Rooftop Technician'],
            },
            {
              title: 'Milestone 3: Electrical Supervisor Licensing',
              description: 'Qualify for state licensing to lead electrical contracting projects.',
              estimatedMonths: 12,
              targetRole: 'Licensed Electrical Supervisor',
              recommendedSkillIds: ['transformer_maintenance'],
            },
          ],
          disclaimer: 'This career roadmap is for guidance and skill advancement. Employment decisions depend on employer criteria.',
        };
      }
    }

    // Default roadmap for other trades (Welder, Machinist, Mechanic)
    return {
      currentTrade: trade,
      targetRole: targetRole || `${trade} Specialist & Team Lead`,
      missingSkills: [],
      milestones: [
        {
          title: locale === 'mr' ? 'टप्पा १: मूलभूत ट्रेड प्राविण्य' : locale === 'hi' ? 'चरण १: बुनियादी ट्रेड प्रवीणता' : 'Milestone 1: Foundational Trade Proficiency',
          description: locale === 'mr' ? 'स्थानिक कार्यशाळांमध्ये प्रत्यक्ष कामाचा अनुभव घ्या.' : 'Gain foundational hands-on experience in regional workshops.',
          estimatedMonths: 6,
          targetRole: 'Apprentice / Technician',
          recommendedSkillIds: candidate.skillIds,
          suggestedCourses: ['Local Government ITI Trade Certification'],
        },
        {
          title: locale === 'mr' ? 'टप्पा २: प्रगत तंत्रज्ञान व मशिनरी' : locale === 'hi' ? 'चरण २: उन्नत तकनीक व मशीनरी' : 'Milestone 2: Advanced Equipment Operation',
          description: locale === 'mr' ? 'आधुनिक सीएनसी किंवा स्वयंचलित उपकरणांचे प्रशिक्षण घ्या.' : 'Learn modern automated and precision machinery.',
          estimatedMonths: 12,
          targetRole: 'Senior Technician',
          recommendedSkillIds: [],
        },
      ],
      disclaimer: locale === 'mr' ? 'करिअर मार्गदर्शक आराखडा माहितीस्तव आहे.' : 'Career guidance is indicative.',
    };
  }
}

export const careerPlannerService = new CareerPlannerService();
