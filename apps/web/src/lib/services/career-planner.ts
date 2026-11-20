import { CandidateProfile, CareerPlan, SupportedLocale, FreeLearningResource, PracticalProject } from '@rojgarmitra/shared';
import { geminiClient } from '../ai/gemini-client';

export class CareerPlannerService {
  /**
   * Generates a context-aware, evidence-grounded career development roadmap.
   * Includes free online tutorials (YouTube), free official textbooks (Bharat Skills NIMI),
   * and practical shop-floor DIY projects matching the candidate's niche.
   */
  async generateCareerPlan(
    candidate: Partial<CandidateProfile>,
    targetRole?: string,
    locale: SupportedLocale = 'mr',
    currentSituation?: string
  ): Promise<CareerPlan> {
    const trade = candidate.trade || 'electrician';
    const currentSkills = candidate.skillIds || ['house_wiring'];
    const location = candidate.taluka ? `${candidate.taluka}, ${candidate.district || 'Nagpur'}` : candidate.district || 'Nagpur';
    const expMonths = candidate.experienceMonths || 0;

    if (geminiClient.isConfigured()) {
      try {
        const prompt = `You are an honest, supportive personal career mentor and vocational advisor for Maharashtra candidates in Vidarbha (Nagpur, Hingna, Butibori MIDC, Umred).

Candidate Context:
- Current Trade: "${trade}"
- Skills possessed: ${JSON.stringify(currentSkills)}
- Experience: ${expMonths} months
- Target Role: "${targetRole || 'Senior Industrial Technician'}"
- Candidate Current Situation / Challenges: "${currentSituation || 'Unemployed, seeking stable employment in Vidarbha'}"
- Location: "${location}"
- Language: "${locale}" (mr = Marathi, hi = Hindi, en = English)

STRICT MENTORING RULES:
1. Be realistic and honest! If the candidate is aiming for ultra-competitive government jobs (0.1% ratio, multi-year delay), warn them constructively and propose immediate private/industrial entry in Butibori/Hingna MIDC where factories pay ₹14,000 - ₹24,000/mo immediately.
2. Provide a concrete "realityCheck" object explaining competition analysis, immediate 30-day next step, and realistically achievable targets.
3. Suggest practical pathways: MIDC Factory Apprenticeships (with stipend under Apprentices Act 1961), MSME Technology Center Nagpur (Indo-German Tool Room), Government ITIs, and free YouTube/Bharat Skills tutorials.
4. Do NOT give boilerplate generic answers like "visit nearest ITI". Give actionable local steps.

Respond strictly with a JSON object conforming to this schema:
{
  "currentTrade": string,
  "targetRole": string,
  "missingSkills": string[],
  "realityCheck": {
    "currentSituationSummary": string,
    "competitionAnalysis": string,
    "immediateNextStep": string,
    "targetAchievability": string
  },
  "milestones": [
    {
      "title": string,
      "description": string,
      "estimatedMonths": number,
      "targetRole": string,
      "recommendedSkillIds": string[],
      "suggestedCourses": string[],
      "freeTutorials": [
        { "title": string, "platform": "YouTube", "url": string, "language": string, "publisherOrChannel": string }
      ],
      "recommendedBooks": [
        { "title": string, "publisher": "Bharat Skills (DGT)", "url": string, "isFreePdf": true }
      ],
      "practicalProjects": [
        { "title": string, "description": string, "steps": string[], "safetyTips": string }
      ]
    }
  ],
  "disclaimer": string
}`;

        const aiPlan = await geminiClient.generateStructuredJson<CareerPlan>(
          prompt,
          'You are an expert vocational career development system for Maharashtra rural and semi-urban trades.'
        );

        if (aiPlan && aiPlan.milestones && Array.isArray(aiPlan.milestones) && aiPlan.milestones.length > 0) {
          if (locale === 'mr') {
            if (trade.includes('electric') && !aiPlan.currentTrade.includes('इलेक्ट्रिशियन')) {
              aiPlan.currentTrade = 'इलेक्ट्रिशियन / ' + aiPlan.currentTrade;
            } else if (trade.includes('weld') && !aiPlan.currentTrade.includes('वेल्डर')) {
              aiPlan.currentTrade = 'वेल्डर / ' + aiPlan.currentTrade;
            } else if (trade.includes('fitter') && !aiPlan.currentTrade.includes('फिटर')) {
              aiPlan.currentTrade = 'फिटर / ' + aiPlan.currentTrade;
            }
          }
          return aiPlan;
        }
      } catch (err) {
        console.warn('[CareerPlannerService] AI generation fallback used:', (err as Error).message);
      }
    }

    // Deterministic fallback plan with high-fidelity trade resources
    return this.getDeterministicPlan(candidate, targetRole, locale);
  }

  public getDeterministicPlan(
    candidate: Partial<CandidateProfile>,
    targetRole?: string,
    locale: SupportedLocale = 'mr'
  ): CareerPlan {
    const trade = (candidate.trade || 'electrician').toLowerCase();
    const currentSkills = new Set(candidate.skillIds || []);

    if (trade.includes('electrician') || trade.includes('wireman')) {
      const isMr = locale === 'mr';
      const isHi = locale === 'hi';

      const tutorialsStage1: FreeLearningResource[] = [
        {
          title: isMr ? 'स्टार-डेल्टा स्टार्टर कंट्रोल व पॉवर वायरिंग' : isHi ? 'स्टार-डेल्टा स्टार्टर कंट्रोल और पावर वायरिंग' : 'Star-Delta Starter Control & Power Wiring',
          platform: 'YouTube',
          url: 'https://www.youtube.com/results?search_query=star+delta+starter+control+wiring+hindi',
          language: isMr ? 'mr/hi' : 'hi',
          publisherOrChannel: 'Electrical Dost',
          category: 'video_tutorial',
          isFree: true,
        },
        {
          title: isMr ? 'औद्योगिक मोटर फॉरवर्ड-रिव्हर्स वायरिंग आणि MCB कनेक्शन' : isHi ? 'इंडस्ट्रियल मोटर फॉरवर्ड-रिवर्स वायरिंग कनेक्शन' : 'Three Phase Motor Forward Reverse Wiring',
          platform: 'YouTube',
          url: 'https://www.youtube.com/results?search_query=motor+forward+reverse+connection+hindi',
          language: 'hi',
          publisherOrChannel: 'Global ITI',
          category: 'video_tutorial',
          isFree: true,
        },
      ];

      const tutorialsStage2: FreeLearningResource[] = [
        {
          title: isMr ? 'पीएम सूर्यघर सोलर पॅनल रूफटॉप इन्स्टॉलेशन गाइड' : isHi ? 'पीएम सूर्यघर सोलर रूफटॉप इंस्टॉलेशन प्रैक्टिकल' : 'PM Surya Ghar Solar Rooftop Installation Practical',
          platform: 'YouTube',
          url: 'https://www.youtube.com/results?search_query=solar+rooftop+installation+training+hindi',
          language: 'hi',
          publisherOrChannel: 'Bharat Skills Official',
          category: 'video_tutorial',
          isFree: true,
        },
        {
          title: isMr ? 'सोलर इन्व्हर्टर, बॅटरी बँक आणि नेट मीटरिंग जोडणी' : isHi ? 'सोलर इन्वर्टर और नेट मीटरिंग कनेक्शन' : 'Solar Inverter & Net Metering Wiring',
          platform: 'YouTube',
          url: 'https://www.youtube.com/results?search_query=solar+inverter+net+metering+connection+hindi',
          language: 'hi',
          publisherOrChannel: 'Make It Easy ITI',
          category: 'video_tutorial',
          isFree: true,
        },
      ];

      const booksStage1: FreeLearningResource[] = [
        {
          title: 'NIMI CTS Electrician Trade Theory Volume 1 & 2',
          platform: 'BharatSkills',
          publisherOrChannel: 'Directorate General of Training (DGT)',
          url: 'https://bharatskills.gov.in/Home/StudyMaterial?trade=electrician',
          category: 'book_pdf',
          isFree: true,
        },
        {
          title: 'Indian Electricity (IE) Rules 1956 & Safety Handbook',
          platform: 'PDF',
          publisherOrChannel: 'Ministry of Power & DVET',
          url: 'https://bharatskills.gov.in',
          category: 'book_pdf',
          isFree: true,
        },
      ];

      const practicalProject1: PracticalProject = {
        title: isMr ? 'ड्युअल रिले मोटर स्टार्टर पॅनल वायरिंग सराव' : isHi ? 'ड्यूल रिले मोटर स्टार्टर पैनल असेंबली' : 'Dual Relay Motor Starter Panel Assembly',
        description: isMr
          ? 'स्थानिक वर्कशॉप किंवा लॅबमध्ये 3-फेज मोटर कंट्रोल सर्किट मल्टीमीटरच्या साहाय्याने तयार करा.'
          : 'Assemble a contactor and overload relay setup with start-stop pushbuttons.',
        steps: [
          isMr ? '१. कॉन्टॅक्टर आणि ओव्हरलोड रिले योग्य क्रमाने बसवा' : '1. Mount the 3-phase contactor and thermal overload relay',
          isMr ? '२. स्टार्ट (NO) आणि स्टॉप (NC) पुशबटन कंट्रोल वायरिंग करा' : '2. Wire normally-open start and normally-closed stop pushbuttons',
          isMr ? '३. वीज देण्यापूर्वी मल्टीमीटरने शॉर्ट-सर्किट व कंटिन्यूटी तपासा' : '3. Verify circuit continuity with a multimeter before powering on',
        ],
        safetyTips: isMr ? 'सुरक्षा सूचना: तपासणी करताना कायम मेन स्विच बंद ठेवा व इन्सुलेटेड टूल्स वापरा.' : 'Always de-energize mains and use certified insulated screwdrivers.',
      };

      return {
        currentTrade: isMr ? 'इलेक्ट्रिशियन / वायरमन' : isHi ? 'इलेक्ट्रीशियन / वायरमैन' : 'Electrician / Wireman',
        targetRole: targetRole || (isMr ? 'सोलर व इंडस्ट्रियल इलेक्ट्रिकल सुपरवायझर' : isHi ? 'सोलर एवं औद्योगिक इलेक्ट्रिकल सुपरवाइजर' : 'Solar & Industrial Electrical Supervisor'),
        missingSkills: ['industrial_panel', 'solar_pv_wiring'].filter((s) => !currentSkills.has(s)),
        realityCheck: {
          currentSituationSummary: isMr
            ? 'सध्याची स्थिती: तातडीने उत्पन्नाची गरज व स्पर्धा परीक्षांमधील अनिर्णायक विलंब.'
            : isHi
            ? 'वर्तमान स्थिति: तत्काल आय की आवश्यकता एवं प्रतियोगी परीक्षाओं में अनिश्चितता।'
            : 'Current situation: Immediate income need with prolonged competitive exam uncertainty.',
          competitionAnalysis: isMr
            ? 'स्पर्धा वास्तव: महाडिस्कॉम किंवा रेल्वेच्या शासकीय भरतीमध्ये १ जागेसाठी २,००० पेक्षा जास्त अर्जदार असतात आणि निकाल लागण्यास २-३ वर्षे लागतात. याउलट हिंगणा व बुटीबोरी MIDC मध्ये औद्योगिक पॅनल वायरमनसाठी त्वरित ₹१६,००० ते ₹२२,००० वेतनावर थेट काम उपलब्ध आहे.'
            : isHi
            ? 'प्रतियोगिता विश्लेषण: सरकारी परीक्षाओं में ०.१% चयन अनुपात होता है। इसके विपरीत हिंगना/बुटीबोरी MIDC में औद्योगिक इलेक्ट्रीशियन के लिए तत्काल ₹१६,०००-२२,००० में काम उपलब्ध है।'
            : 'Competition Reality: Government technician exams have <0.1% selection ratios and 2-3 years delays. Conversely, Hingna/Butibori MIDC manufacturing units have immediate openings paying ₹16,000 - ₹22,000/mo.',
          immediateNextStep: isMr
            ? 'पुढील ३० दिवस: बेरोजगार राहून अभ्यास करण्याऐवजी MIDC कारखान्यात शिकाऊ (Apprentice) किंवा कंत्राटी वायरमन म्हणून रुजू व्हा. दरमहा ₹९,५०० ते ₹१४,००० उत्पन्न सुरू होईल आणि प्रत्यक्ष अनुभव जमा होईल.'
            : isHi
            ? 'अगले ३० दिन: बेरोजगार रहने के बजाय MIDC फैक्ट्री में अप्रेंटिस या ट्रेनी के रूप में जुड़ें। तत्काल वजीफा शुरू होगा।'
            : 'Next 30 Days: Join an MIDC factory apprenticeship or junior technician post to start immediate cash flow (₹9,500 - ₹14,000/mo) and build plant experience.',
          targetAchievability: isMr
            ? 'वास्तविक साध्य लक्ष्य: पुढील १८ महिन्यांत इंडस्ट्रियल पॅनल वायरिंग + सोलर इन्स्टॉलेशन शिकून थेट ₹२२,००० ते ₹२६,००० मासिक वेतनावर पोहोचणे १००% साध्य आहे.'
            : isHi
            ? 'वास्तविक साध्य लक्ष्य: १८ महीनों में पैनल वायरिंग व सोलर इंस्टॉलेशन सीखकर ₹२२,०००-२६,००० वेतन प्राप्त करना व्यावहारिक है।'
            : 'Achievable Target: Reaching ₹22,000 - ₹26,000/mo within 18 months via industrial panel wiring & rooftop solar installation is 100% realistic.',
        },
        milestones: [
          {
            title: isMr ? 'टप्पा १: मूलभूत औद्योगिक वायरिंग व पॅनल असेंबली' : isHi ? 'चरण १: औद्योगिक वायरिंग और कंट्रोल पैनल असेंबली' : 'Milestone 1: Industrial Panel & Motor Wiring',
            description: isMr
              ? 'स्थानिक कारखाने (हिंगणा/बुटीबोरी MIDC) आणि पॅनल वायरिंगमधील प्रत्यक्ष अनुभव मिळवा.'
              : isHi
              ? 'हिंगना या बुटीबोरी एमआईडीसी के कारखानों में व्यावहारिक अनुभव प्राप्त करें।'
              : 'Gain hands-on experience in manufacturing plant electrical systems in Butibori or Hingna MIDC.',
            estimatedMonths: 6,
            targetRole: isMr ? 'कनिष्ठ औद्योगिक इलेक्ट्रिशियन' : isHi ? 'जूनियर इंडस्ट्रियल इलेक्ट्रीशियन' : 'Junior Industrial Electrician',
            recommendedSkillIds: ['industrial_panel', 'motor_rewinding'],
            suggestedCourses: ['Government ITI Hingna - Control Panel Maintenance', 'Government ITI Nagpur CTS'],
            freeTutorials: tutorialsStage1,
            recommendedBooks: booksStage1,
            practicalProjects: [practicalProject1],
          },
          {
            title: isMr ? 'टप्पा २: पीएम सूर्यघर व सोलर इन्स्टॉलेशन प्राविण्य' : isHi ? 'चरण २: सोलर पीवी तकनीशियन प्रमाणन' : 'Milestone 2: Solar Rooftop PV Practical Mastery',
            description: isMr
              ? 'महाराष्ट्र ऊर्जा विकास अभिकरण (MEDA) मान्य सोलर पीव्ही रूफटॉप तंत्रज्ञान शिका.'
              : isHi
              ? 'पीएम सूर्यघर योजना के तहत सोलर रूफटॉप इंस्टॉलेशन कौशल सीखें।'
              : 'Acquire renewable energy installation and commissioning skills under PM Surya Ghar.',
            estimatedMonths: 6,
            targetRole: isMr ? 'सोलर तंत्रज्ञ व साईट लीड' : isHi ? 'सोलर तकनीशियन' : 'Solar Site Lead',
            recommendedSkillIds: ['solar_pv_wiring'],
            suggestedCourses: ['Government ITI Umred - Solar PV Rooftop Technician Course'],
            freeTutorials: tutorialsStage2,
            recommendedBooks: booksStage1,
          },
          {
            title: isMr ? 'टप्पा ३: PWD इलेक्ट्रिकल सुपरवायझर परवाना' : isHi ? 'चरण ३: राज्य सुपरवाइजर लाइसेंस' : 'Milestone 3: Electrical Supervisor Licensing',
            description: isMr
              ? 'महाराष्ट्र शासनाचा सुपरवायझर परवाना परीक्षा उत्तीर्ण करून स्वतःचे काम सुरू करा किंवा मोठ्या प्रकल्पात वरिष्ठ सुपरवायझर व्हा.'
              : isHi
              ? 'राज्य सरकार का विद्युत सुपरवाइजर लाइसेंस परीक्षा पास कर वरिष्ठ पद पाएं।'
              : 'Qualify for state licensing to lead electrical contracting projects.',
            estimatedMonths: 12,
            targetRole: isMr ? 'अधिकृत इलेक्ट्रिकल सुपरवायझर' : isHi ? 'इलेक्ट्रिकल सुपरवाइजर' : 'Licensed Electrical Supervisor',
            recommendedSkillIds: ['transformer_maintenance'],
            suggestedCourses: ['DVET Electrical Supervisor Licensing Prep'],
          },
        ],
        disclaimer: isMr
          ? 'सदर मार्गदर्शक आराखडा कौशल्य वृद्धीसाठी आहे. नोकरीची अंतिम निवड नियोक्त्यांच्या अटींवर अवलंबून असते.'
          : isHi
          ? 'यह योजना कौशल संवर्धन हेतु है। अंतिम चयन नियोक्ता के साक्षात्कार पर निर्भर करता है।'
          : 'This career roadmap is for guidance and skill advancement. Employment decisions depend on employer criteria.',
      };
    }

    // Default roadmap for Welder & Other Industrial Trades
    const isMr = locale === 'mr';
    const isHi = locale === 'hi';

    const welderTutorials: FreeLearningResource[] = [
      {
        title: isMr ? 'MIG / MAG वेल्डिंग मशीन सेटिंग आणि टॉर्च अँगल' : isHi ? 'MIG/MAG वेल्डिंग मशीन सेटिंग और सही टॉर्च एंगल' : 'MIG/MAG Welding Machine Setup & Torch Angle',
        platform: 'YouTube',
        url: 'https://www.youtube.com/results?search_query=mig+welding+setting+and+technique+hindi',
        language: 'hi',
        publisherOrChannel: 'Global ITI',
        category: 'video_tutorial',
        isFree: true,
      },
      {
        title: isMr ? 'TIG वेल्डिंग आर्गॉन गॅस फ्लो व रूट पास वेल्डिंग' : isHi ? 'TIG वेल्डिंग रूट पास और ऑर्गन गैस फ्लो' : 'TIG Welding Root Pass & Shielding Gas Control',
        platform: 'YouTube',
        url: 'https://www.youtube.com/results?search_query=tig+welding+root+pass+hindi',
        language: 'hi',
        publisherOrChannel: 'Welding Academy India',
        category: 'video_tutorial',
        isFree: true,
      },
    ];

    const welderBooks: FreeLearningResource[] = [
      {
        title: 'NIMI Welder Trade Theory & Practical Manual (हिंदी / मराठी)',
        platform: 'BharatSkills',
        publisherOrChannel: 'Directorate General of Training (DGT)',
        url: 'https://bharatskills.gov.in/Home/StudyMaterial?trade=welder',
        category: 'book_pdf',
        isFree: true,
      },
      {
        title: 'AWS D1.1 Structural Welding Basics & Inspection Guide',
        platform: 'PDF',
        publisherOrChannel: 'Indian Institute of Welding (IIW)',
        url: 'https://bharatskills.gov.in',
        category: 'book_pdf',
        isFree: true,
      },
    ];

    const welderProject: PracticalProject = {
      title: isMr ? 'सिंगल वी-बट जॉइंट 3G पोझिशन वेल्डिंग सराव' : isHi ? 'सिंगल वी-बट जॉइंट 3G वेल्डिंग अभ्यास' : 'Single V-Butt Joint 3G Position Welding',
      description: isMr
        ? '१० मिमी माईल्ड स्टील प्लेटवर बेव्हलिंग तयार करून रूट आणि कॅपिंग पास करा.'
        : 'Prepare bevel on 10mm MS plate and execute root and capping passes.',
      steps: [
        isMr ? '१. प्लेट कडा ३० अंश कोनात ग्राइंड करून रूट फेस १.५ मिमी ठेवा' : '1. Grind plate edges to 30 degree bevel with 1.5mm root face',
        isMr ? '२. २ मिमी रूट गॅप ठेवून दोन्ही बाजूंनी टॅक वेल्ड करा' : '2. Set 2mm root gap and tack weld both ends securely',
        isMr ? '३. रूट पास करताना योग्य अ‍ॅम्पिअर (९०-१००A) निवडून पेनेट्रेशन तपासा' : '3. Execute root pass at 90-100A ensuring 100% root penetration',
      ],
      safetyTips: isMr ? 'सुरक्षा सूचना: वेल्डिंग हेल्मेट (Shade 11), लेदर अ‍ॅप्रन व सेफ्टी शूज अनिवार्य आहेत.' : 'Wear Auto-Darkening Shade 11 helmet, leather apron, and safety boots.',
    };

    return {
      currentTrade: trade === 'welder' ? (isMr ? 'वेल्डर / फॅब्रिकेटर' : isHi ? 'वेल्डर / फैब्रिकेटर' : 'Welder / Fabricator') : trade,
      targetRole: targetRole || (isMr ? 'वरिष्ठ फॅब्रिकेशन व वेल्डिंग सुपरवायझर' : isHi ? 'वरिष्ठ फैब्रिकेशन एवं वेल्डिंग सुपरवाइजर' : 'Senior Fabrication & Welding Supervisor'),
      missingSkills: ['mig_welding', 'sheet_metal_fabrication'].filter((s) => !currentSkills.has(s)),
      realityCheck: {
        currentSituationSummary: isMr
          ? 'सध्याची स्थिती: वेल्डिंग कौशल्याचा प्रत्यक्ष कारखान्यात पुरेपूर वापर करून स्थिर उत्पन्नाची गरज.'
          : isHi
          ? 'वर्तमान स्थिति: वेल्डिंग कौशल का व्यावहारिक कारखानों में उपयोग कर स्थायी आय की आवश्यकता।'
          : 'Current situation: Need for steady industrial employment utilizing practical welding skills.',
        competitionAnalysis: isMr
          ? 'स्पर्धा वास्तव: सामान्य सरकारी नोकऱ्यांमध्ये प्रचंड गर्दी असली, तरी बुटीबोरी MIDC (महिंद्रा, सोलर इंडस्ट्रीज, फॅब्रिकेशन युनिट्स) मध्ये कुशल MIG/MAG वेल्डर्सची तीव्र टंचाई आहे. प्रत्यक्ष चाचणीत अचूक वेल्डिंग दाखवल्यास त्वरित नियुक्ती मिळते.'
          : isHi
          ? 'प्रतियोगिता विश्लेषण: सामान्य सरकारी पदों में अत्यधिक भीड़ है, परंतु बुटीबोरी MIDC में कुशल MIG वेल्डर की अत्यधिक कमी है। व्यावहारिक टेस्ट पास करते ही तुरंत काम मिलता है।'
          : 'Competition Reality: While clerical/govt exams have extreme saturation, Butibori MIDC manufacturing plants face acute shortages of certified MIG/MAG welders.',
        immediateNextStep: isMr
          ? 'पुढील ३० दिवस: बुटीबोरी किंवा हिंगण्यातील फॅब्रिकेशन कारखान्यात प्रत्यक्ष वेल्डिंग जॉइंट चाचणी (Weld Test) द्या आणि थेट ₹१६,००० ते ₹२०,००० वेतनावर काम सुरू करा.'
          : isHi
          ? 'अगले ३० दिन: बुटीबोरी में वेल्डिंग टेस्ट दें और तत्काल ₹१६,०००+ वेल्डर पद पर कार्य आरंभ करें।'
          : 'Next 30 Days: Appear for a hands-on welding joint test at Butibori/Hingna MIDC plant and secure immediate placement (₹16,000 - ₹20,000/mo).',
        targetAchievability: isMr
          ? 'वास्तविक साध्य लक्ष्य: १२ ते १८ महिन्यांत TIG आणि प्रेशर व्हेसल (IBR) वेल्डिंग शिकून ₹२४,००० ते ₹२८,००० चे शाश्वत मासिक उत्पन्न मिळवणे प्रत्यक्ष साध्य आहे.'
          : isHi
          ? 'वास्तविक साध्य लक्ष्य: १२-१८ माह में TIG वेल्डिंग सीखकर ₹२४,०००-२८,००० कमाना पूर्णतः व्यावहारिक है।'
          : 'Achievable Target: Reaching ₹24,000 - ₹28,000/mo in 12-18 months by mastering TIG and pressure vessel joint fabrication.',
      },
      milestones: [
        {
          title: isMr ? 'टप्पा १: मिग / टिग वेल्डिंग प्राविण्य' : isHi ? 'चरण १: मिग / टिग वेल्डिंग दक्षता' : 'Milestone 1: MIG / TIG Welding Proficiency',
          description: isMr
            ? 'बुटीबोरी औद्योगिक क्षेत्रातील मॅन्युफॅक्चरिंग युनिट्समध्ये प्रगत वेल्डिंग कौशल्य मिळवा.'
            : isHi
            ? 'बुटीबोरी एमआईडीसी के निर्माण कारखानों में आधुनिक वेल्डिंग का अभ्यास करें।'
            : 'Master MIG/TIG welding and precision metal working in regional manufacturing units.',
          estimatedMonths: 6,
          targetRole: isMr ? 'कुशल वेल्डर (MIG/TIG)' : isHi ? 'कुशल वेल्डर (MIG/TIG)' : 'Skilled Welder (MIG/TIG)',
          recommendedSkillIds: ['mig_welding', 'tig_welding'],
          suggestedCourses: ['Government ITI Butibori - Specialized Welding Course'],
          freeTutorials: welderTutorials,
          recommendedBooks: welderBooks,
          practicalProjects: [welderProject],
        },
        {
          title: isMr ? 'टप्पा २: प्रेशर व्हेसल व पाईपलाईन वेल्डिंग' : isHi ? 'चरण २: प्रेशर वेसल एवं पाइपलाइन वेल्डिंग' : 'Milestone 2: Heavy Structural & Pipeline Qualification',
          description: isMr
            ? 'प्रेशर व्हेसल आणि हेवी स्ट्रक्चरल वेल्डिंगसाठी आयबीआर (IBR) वेल्डर पात्रता मिळवा.'
            : isHi
            ? 'प्रेशर वेसल और भारी संरचनात्मक वेल्डिंग हेतु आईबीआर (IBR) योग्यता हासिल करें।'
            : 'Attain IBR certification for high-pressure industrial applications.',
          estimatedMonths: 12,
          targetRole: isMr ? 'सर्टिफाइड स्ट्रक्चरल वेल्डर' : isHi ? 'प्रमाणित स्ट्रक्चरल वेल्डर' : 'Senior Certified Welder',
          recommendedSkillIds: ['sheet_metal_fabrication'],
          suggestedCourses: ['Government ITI Nagpur Advanced Welding'],
        },
      ],
      disclaimer: isMr
        ? 'सदर मार्गदर्शक आराखडा कौशल्य वृद्धीसाठी आहे. नोकरीची अंतिम निवड नियोक्त्यांच्या अटींवर अवलंबून असते.'
        : isHi
        ? 'यह योजना कौशल संवर्धन हेतु है। अंतिम चयन नियोक्ता के साक्षात्कार पर निर्भर करता है।'
        : 'This career roadmap is for guidance and skill advancement. Employment decisions depend on employer criteria.',
    };
  }
}

export const careerPlannerService = new CareerPlannerService();
