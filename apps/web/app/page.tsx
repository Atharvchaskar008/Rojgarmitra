'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { getDictionary, SupportedLocale } from '@rojgarmitra/i18n';
import { ArtisanWorkshopArt } from '@/components/illustrations/ArtisanWorkshopArt';
import { MitraCharacter } from '@/components/character/MitraCharacter';
import { 
  IconSearch, 
  IconUser, 
  IconBuilding, 
  IconMapPin, 
  IconBriefcase, 
  IconCheck, 
  IconShieldCheck, 
  IconGraduationCap, 
  IconArrowRight,
  IconPhone,
  IconClock,
  IconLock,
  IconExternalLink
} from '@/components/icons';

export default function LandingPage() {
  const { preferredLocale, user, userRole } = useAuth();
  const dict = getDictionary(preferredLocale);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const copy = {
    mr: {
      badge: 'विदर्भ व ग्रामीण महाराष्ट्रासाठी थेट रोजगार व्यासपीठ',
      heroTitle1: 'सत्य माहिती. थेट रोजगार.',
      heroTitle2: 'शून्य मध्यस्थ.',
      heroLead: 'दलाली आणि बनावट जाहिरातींना पूर्णविराम. रोजगारमित्र नागपूर, बुटीबोरी, हिंगणा व ग्रामीण भागातील कारागीर, तंत्रज्ञ, चालक, सेल्स व कार्यालयीन कर्मचाऱ्यांना थेट स्थानिक कारखाने व आस्थापनांशी जोडते.',
      ctaCandidate: 'नोकरी शोधा (Candidate Portal)',
      ctaEmployer: 'कामगार भरती करा (Employer Portal)',
      dashboardBtn: 'डॅशबोर्डवर जा (Go to Dashboard)',
      proof1: '100% प्रत्यक्ष फोन पडताळणी',
      proof2: 'शून्य कन्सल्टन्सी किंवा दलाली फी',
      proof3: 'कारखाना मालकांशी थेट थेट संवाद',
      proof4: 'DVET व शासकीय ITI कोर्सेस',
      dilemmaTitle: 'आजच्या रोजगार बाजारातील खरी समस्या',
      dilemmaCandTag: 'उमेदवारांची अडचण',
      dilemmaCandTitle: 'बनावट जाहिराती व दलालांची लूट',
      dilemmaCandDesc: 'WhatsApp वर येणाऱ्या खोट्या जाहिराती, नोकरीच्या नावाखाली ₹२,००० रजिस्ट्रेशन फी मागणारे मध्यस्थ आणि प्रत्यक्षात कामाची जागा न मिळणे.',
      dilemmaEmpTag: 'नियोक्त्यांची अडचण',
      dilemmaEmpTitle: 'स्थानिक कुशल कामगारांचा अभाव',
      dilemmaEmpDesc: 'शहरातील दूरचे उमेदवार २ दिवसांत काम सोडतात. स्थानिक गावातील प्रामाणिक कारागीर व तंत्रज्ञांशी थेट संपर्क साधण्यासाठी कोणतेही विश्वासार्ह माध्यम नाही.',
      loopEyebrow: 'कामाची पद्धत',
      loopTitle: '३ सोप्या पायऱ्यांत थेट रोजगार',
      loopLead: 'कोणताही क्लिष्ट बायोडाटा (Resume) नको. साध्या शब्दांत किंवा आवाजात माहिती सांगा.',
      step1Num: '01',
      step1Title: 'कौशल्य सांगा',
      step1Desc: 'आपल्या स्वतःच्या भाषेत (मराठी/हिंदी) माहिती बोला किंवा निवडा. मित्र AI आपली प्रोफाइल लगेच तयार करतो.',
      step2Num: '02',
      step2Title: 'सत्यापित पदे',
      step2Desc: 'आमची प्रणाली स्थानिक औद्योगिक क्षेत्रांमधील चालू असणाऱ्या खऱ्याखुऱ्या रिक्त जागा तपासून समोर आणते.',
      step3Num: '03',
      step3Title: 'थेट संपर्क',
      step3Desc: 'एका क्लिकवर कंपनीच्या व्यवस्थापकाशी फोनवर बोला किंवा थेट मुलाखतीसाठी अर्ज पाठवा.',
      mitraHeading: 'भेटा "मित्र" — आपला व्हॉइस मार्गदर्शक',
      mitraSub: 'इंग्रजी किंवा कॉम्प्युटरचे ज्ञान नसले तरी चालेल. मित्र आपल्याशी मराठीत बोलतो, योग्य नोकऱ्या शोधतो आणि मोफत ITI कोर्सेसची माहिती देतो.',
      faqTitle: 'वारंवार विचारले जाणारे प्रश्न',
    },
    hi: {
      badge: 'विदर्भ और ग्रामीण भारत के लिए सीधा रोजगार मंच',
      heroTitle1: 'सटीक जानकारी. सीधा रोजगार.',
      heroTitle2: 'शून्य बिचौलिए.',
      heroLead: 'दलाली और फर्जी विज्ञापनों को अलविदा। रोजगारमित्र नागपुर, बुटीबोरी, हिंगना और ग्रामीण क्षेत्र के कारीगरों, तकनीशियनों, ड्राइवरों और सेल्स कर्मियों को सीधे स्थानीय उद्योगों से जोड़ता है।',
      ctaCandidate: 'नौकरी खोजें (Candidate Portal)',
      ctaEmployer: 'कर्मचारी भर्ती करें (Employer Portal)',
      dashboardBtn: 'डैशबोर्ड पर जाएं (Go to Dashboard)',
      proof1: '100% सत्यापित रिक्तियां',
      proof2: 'शून्य कंसल्टेंसी या कमीशन',
      proof3: 'फैक्ट्री मालिकों से सीधा फोन संपर्क',
      proof4: 'DVET व सरकारी ITI कौशल विकास',
      dilemmaTitle: 'रोजगार की असली चुनौतियाँ',
      dilemmaCandTag: 'उम्मीदवार की समस्या',
      dilemmaCandTitle: 'फर्जी विज्ञापन और बिचौलियों की ठगी',
      dilemmaCandDesc: 'सोशल मीडिया पर आने वाले फर्जी संदेश, नौकरी के नाम पर अग्रिम फीस की मांग और अंत में काम न मिलना।',
      dilemmaEmpTag: 'नियोक्ता की समस्या',
      dilemmaEmpTitle: 'स्थानीय व विश्वसनीय प्रतिभा की कमी',
      dilemmaEmpDesc: 'दूर से आने वाले कर्मचारी कुछ ही दिनों में नौकरी छोड़ देते हैं। स्थानीय युवाओं तक सीधी पहुंच का अभाव।',
      loopEyebrow: 'प्रक्रिया',
      loopTitle: '३ सरल चरणों में सीधा रोजगार',
      loopLead: 'किसी कठिन बायोडाटा (Resume) की जरूरत नहीं। सरल भाषा या बोलकर बताएं।',
      step1Num: '01',
      step1Title: 'हुनर बताएं',
      step1Desc: 'अपनी मातृभाषा (हिंदी/मराठी) में बोलें। मित्र AI आपकी प्रोफाइल तुरंत तैयार कर देता है।',
      step2Num: '02',
      step2Title: 'सत्यापित अवसर',
      step2Desc: 'हमारा सिस्टम स्थानीय MIDC व कारखानों की वास्तविक रिक्तियों को सत्यापित कर दिखाता है।',
      step3Num: '03',
      step3Title: 'सीधा संवाद',
      step3Desc: 'एक क्लिक में प्लांट मैनेजर से फोन पर बात करें या सीधे साक्षात्कार के लिए आवेदन करें।',
      mitraHeading: 'मिलिए "मित्र" से — आपका वॉयस सलाहकार',
      mitraSub: 'कंप्यूटर या अंग्रेजी की कोई मजबूरी नहीं। मित्र आपसे सीधे बात करता है, नौकरियां खोजता है और मार्गदर्शन करता है।',
      faqTitle: 'अक्सर पूछे जाने वाले सवाल',
    },
    en: {
      badge: 'Verified Regional Employment Platform for Maharashtra',
      heroTitle1: 'Honest Work. Direct Hiring.',
      heroTitle2: 'Zero Middlemen.',
      heroLead: 'Put an end to recruitment scams and dead leads. RojgarMitra connects local technicians, welders, retail associates, drivers, and office staff directly with verified industrial and business employers across Tier 2, Tier 3, and rural India.',
      ctaCandidate: 'Find Jobs (Candidate Portal)',
      ctaEmployer: 'Hire Staff (Employer Portal)',
      dashboardBtn: 'Go to My Dashboard',
      proof1: '100% Phone & Evidence-Verified Vacancies',
      proof2: 'Zero Consultancy or Placement Fees',
      proof3: 'Direct Phone Access to Plant Managers',
      proof4: 'DVET & Government ITI Upskilling',
      dilemmaTitle: 'The Real Bottlenecks in Blue-Collar Hiring',
      dilemmaCandTag: 'The Candidate Dilemma',
      dilemmaCandTitle: 'Ghost Vacancies & Consultancy Scams',
      dilemmaCandDesc: 'Candidates are misled by outdated WhatsApp forwards and predatory agencies demanding upfront registration fees without real jobs.',
      dilemmaEmpTag: 'The Employer Dilemma',
      dilemmaEmpTitle: 'High Attrition & Missing Local Reach',
      dilemmaEmpDesc: 'Recruiters struggle with distant workers who leave within days, with no transparent channel to reach skilled talent in nearby talukas.',
      loopEyebrow: 'The Loop',
      loopTitle: 'Direct Employment in 3 Simple Steps',
      loopLead: 'No resume formatting required. Simply speak or type your core craft in plain words.',
      step1Num: '01',
      step1Title: 'State Your Skills',
      step1Desc: 'Speak or select your craft in Marathi, Hindi, or English. Mitra AI builds your structured profile instantly.',
      step2Num: '02',
      step2Title: 'Verified Matches',
      step2Desc: 'Our autonomous agent verifies active, genuine plant openings within your chosen travel radius.',
      step3Num: '03',
      step3Title: 'Direct Contact',
      step3Desc: 'Call the plant manager directly or submit a 1-tap application with zero brokerage fees.',
      mitraHeading: 'Meet "Mitra" — Your Regional Voice Advisor',
      mitraSub: 'No computer literacy needed. Mitra converses naturally in your language, finds matching openings, and connects you to government ITI training.',
      faqTitle: 'Frequently Asked Questions',
    },
  }[preferredLocale];

  const faqs = [
    {
      q: preferredLocale === 'mr' ? 'रोजगारमित्रवर नोकरी शोधण्यासाठी काही शुल्क आहे का?' : preferredLocale === 'hi' ? 'क्या रोजगारमित्र पर नौकरी ढूंढने के लिए कोई शुल्क है?' : 'Is RojgarMitra completely free for jobseekers?',
      a: preferredLocale === 'mr' ? 'नाही, हे व्यासपीठ सर्व उमेदवारांसाठी १००% विनामूल्य आहे. कोणत्याही दलाली, कमिशन किंवा नोंदणी शुल्काशिवाय थेट कारखान्यांशी संपर्क होतो.' : preferredLocale === 'hi' ? 'नहीं, यह मंच सभी उम्मीदवारों के लिए १००% निशुल्क है। बिना किसी बिचौलिए या कमीशन के सीधे संपर्क संभव है।' : 'RojgarMitra is 100% free for candidates. No registration charges, consultancy fees, or salary cuts are ever charged.',
    },
    {
      q: preferredLocale === 'mr' ? 'नोकरीच्या जागा खरोखर सुरू आहेत हे कसे समजते?' : preferredLocale === 'hi' ? 'नौकरियों की वास्तविकता की जांच कैसे की जाती है?' : 'How does RojgarMitra verify job vacancies?',
      a: preferredLocale === 'mr' ? 'आमची प्रणाली प्रत्येक जाहिरातीची कंपनी नोंदणी, चालू उत्पादन युनिट व थेट फोन नंबरद्वारे पडताळणी करते. बनावट किंवा जुन्या जाहिराती त्वरित हटवल्या जातात.' : preferredLocale === 'hi' ? 'हमारा सिस्टम प्रत्येक रिक्ति की कंपनी पंजीकरण, सक्रिय इकाई और फोन नंबर से जांच करता है। फर्जी विज्ञापनों को तुरंत हटा दिया जाता है।' : 'Every vacancy requires independent evidence of an active opening, employer phone verification, and plant verification across industrial zones.',
    },
    {
      q: preferredLocale === 'mr' ? 'माझ्याकडे इंग्रजीत बायोडाटा (Resume) नाही, तरीही अर्ज करता येईल का?' : preferredLocale === 'hi' ? 'मेरे पास अंग्रेजी रिज्यूमे नहीं है, क्या मैं आवेदन कर सकता हूँ?' : 'Can I apply without a formatted English resume?',
      a: preferredLocale === 'mr' ? 'होय! आपण मराठी किंवा हिंदीत बोलून आपल्या कामाचा अनुभव व कौशल्ये सांगू शकता. आमचे व्हॉइस असिस्टंट "मित्र" आपल्यासाठी संपूर्ण प्रोफाइल तयार करतो.' : preferredLocale === 'hi' ? 'हाँ! आप हिंदी या मराठी में बोलकर अपना अनुभव बता सकते हैं। हमारा वॉयस असिस्टेंट "मित्र" आपकी प्रोफाइल खुद तैयार कर देगा।' : 'Yes! You can speak your experience in Marathi or Hindi. Our voice advisor Mitra transcribes and structures your trade profile automatically.',
    },
    {
      q: preferredLocale === 'mr' ? 'कारखाने व कंपन्या नवीन नोकऱ्या कशा टाकू शकतात?' : preferredLocale === 'hi' ? 'कंपनियां नई भर्तियां कैसे पोस्ट कर सकती हैं?' : 'How do employers post vacancies?',
      a: preferredLocale === 'mr' ? 'नियोक्ते "कामगार भरती करा" बटनावर क्लिक करून १ मिनिटात फोन नंबर, आवश्यक पदे व वेतनासह थेट नोकरी टाकू शकतात आणि लगेच स्थानिक अर्ज पाहू शकतात.' : preferredLocale === 'hi' ? 'नियोक्ता "कर्मचारी भर्ती करें" पर क्लिक कर १ मिनट में पद, स्थान और वेतन के साथ रिक्ति पोस्ट कर सकते हैं।' : 'Employers can sign in via Google or Phone OTP, post their requirements in under a minute, and review pre-screened local candidate applications directly.',
    },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-canvas via-white to-canvas border-b-2 border-ink pt-12 pb-16 sm:py-20">
        {/* Subtle Background Grid Texture */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#101638 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Headline, Description & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              {/* Eyebrow Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-steel-soft border border-ink text-ink text-xs font-black shadow-solid-sm">
                <span className="w-2 h-2 rounded-full bg-verified animate-ping" />
                <span>{copy.badge}</span>
              </div>

              {/* Grand Display Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-ink tracking-tight leading-[1.1]">
                {copy.heroTitle1}
                <br />
                <span className="text-primary underline decoration-steel/40 decoration-wavy">
                  {copy.heroTitle2}
                </span>
              </h1>

              {/* Natural Language Lead */}
              <p className="text-base sm:text-lg text-ink-secondary font-medium leading-relaxed max-w-2xl">
                {copy.heroLead}
              </p>

              {/* Dual Action CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                {user ? (
                  <Link
                    href={userRole === 'employer' ? '/employer' : '/candidate'}
                    className="settle-pill-btn px-8 py-3.5 text-sm sm:text-base font-bold shadow-solid text-center inline-flex items-center justify-center gap-2"
                  >
                    <span>{copy.dashboardBtn}</span>
                    <IconArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/candidate"
                      className="settle-pill-btn px-6 py-3.5 text-sm sm:text-base font-bold shadow-solid text-center inline-flex items-center justify-center gap-2"
                    >
                      <IconBriefcase className="w-4 h-4" />
                      <span>{copy.ctaCandidate}</span>
                      <IconArrowRight className="w-4 h-4" />
                    </Link>

                    <Link
                      href="/employer"
                      className="settle-pill-chip px-6 py-3.5 text-sm sm:text-base font-bold text-center border-2 border-ink hover:bg-steel-soft text-ink inline-flex items-center justify-center gap-2 transition"
                    >
                      <IconBuilding className="w-4 h-4" />
                      <span>{copy.ctaEmployer}</span>
                    </Link>
                  </>
                )}
              </div>

              {/* Quick Trust Highlights */}
              <div className="pt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-bold text-ink-secondary">
                <span className="inline-flex items-center gap-1.5">
                  <IconShieldCheck className="w-4 h-4 text-verified" />
                  १००% विनामूल्य (Free)
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <IconPhone className="w-4 h-4 text-primary" />
                  थेट फोन कॉल (Direct Calling)
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <IconMapPin className="w-4 h-4 text-alert" />
                  स्थानिक तालुके (Nearby Radius)
                </span>
              </div>
            </div>

            {/* Right Column: Architectural Drawing Illustration */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md">
                <ArtisanWorkshopArt />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proof Strip (SAKER style) */}
      <section className="bg-ink text-white py-4 border-b-2 border-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-bold font-mono">
            <span className="inline-flex items-center gap-2">
              <span className="text-verified">✓</span>
              <span>{copy.proof1}</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="text-verified">✓</span>
              <span>{copy.proof2}</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="text-verified">✓</span>
              <span>{copy.proof3}</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="text-verified">✓</span>
              <span>{copy.proof4}</span>
            </span>
          </div>
        </div>
      </section>

      {/* The Problem & The Solution Section */}
      <section className="py-16 sm:py-20 border-b-2 border-ink bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-black uppercase tracking-wider text-primary font-mono">
              The Reality
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-ink mt-2">
              {copy.dilemmaTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Candidate Dilemma Card */}
            <div className="settle-card p-6 sm:p-8 bg-canvas/40 border-2 border-ink relative overflow-hidden">
              <span className="inline-block px-3 py-1 rounded-full bg-alert-bg text-alert border border-alert-border text-xs font-bold mb-4 font-mono">
                {copy.dilemmaCandTag}
              </span>
              <h3 className="text-xl font-black text-ink mb-2">
                {copy.dilemmaCandTitle}
              </h3>
              <p className="text-sm text-ink-secondary leading-relaxed font-medium">
                {copy.dilemmaCandDesc}
              </p>
            </div>

            {/* Employer Dilemma Card */}
            <div className="settle-card p-6 sm:p-8 bg-canvas/40 border-2 border-ink relative overflow-hidden">
              <span className="inline-block px-3 py-1 rounded-full bg-steel-soft text-primary border border-steel text-xs font-bold mb-4 font-mono">
                {copy.dilemmaEmpTag}
              </span>
              <h3 className="text-xl font-black text-ink mb-2">
                {copy.dilemmaEmpTitle}
              </h3>
              <p className="text-sm text-ink-secondary leading-relaxed font-medium">
                {copy.dilemmaEmpDesc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The 3-Step Loop Section (How It Works) */}
      <section id="how" className="py-16 sm:py-20 border-b-2 border-ink bg-canvas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-black uppercase tracking-wider text-primary font-mono">
              {copy.loopEyebrow}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-ink mt-2">
              {copy.loopTitle}
            </h2>
            <p className="text-sm sm:text-base text-ink-secondary mt-2 font-medium">
              {copy.loopLead}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="settle-card-hero p-6 sm:p-8 bg-white relative">
              <span className="text-4xl font-black font-mono text-steel-deep block mb-4">
                {copy.step1Num}
              </span>
              <h3 className="text-xl font-black text-ink mb-2">
                {copy.step1Title}
              </h3>
              <p className="text-sm text-ink-secondary font-medium leading-relaxed">
                {copy.step1Desc}
              </p>
            </div>

            {/* Step 2 */}
            <div className="settle-card-hero p-6 sm:p-8 bg-white relative">
              <span className="text-4xl font-black font-mono text-steel-deep block mb-4">
                {copy.step2Num}
              </span>
              <h3 className="text-xl font-black text-ink mb-2">
                {copy.step2Title}
              </h3>
              <p className="text-sm text-ink-secondary font-medium leading-relaxed">
                {copy.step2Desc}
              </p>
            </div>

            {/* Step 3 */}
            <div className="settle-card-hero p-6 sm:p-8 bg-white relative">
              <span className="text-4xl font-black font-mono text-steel-deep block mb-4">
                {copy.step3Num}
              </span>
              <h3 className="text-xl font-black text-ink mb-2">
                {copy.step3Title}
              </h3>
              <p className="text-sm text-ink-secondary font-medium leading-relaxed">
                {copy.step3Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Voice Assistant Spotlight: Meet Mitra */}
      <section className="py-16 sm:py-20 border-b-2 border-ink bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="settle-card-hero p-8 sm:p-12 bg-gradient-to-r from-canvas to-white flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-verified-bg text-verified border border-verified">
                <span className="w-2 h-2 rounded-full bg-verified" />
                Live Multilingual Voice Guidance
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-ink">
                {copy.mitraHeading}
              </h2>
              <p className="text-sm sm:text-base text-ink-secondary font-medium leading-relaxed">
                {copy.mitraSub}
              </p>
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const btn = document.querySelector('[aria-label="Mitra Voice Assistant"]') as HTMLElement;
                    btn?.click();
                  }}
                  className="settle-pill-btn px-6 py-2.5 text-xs font-bold inline-flex items-center gap-2"
                >
                  <IconPhone className="w-4 h-4" />
                  <span>मित्राशी थेट बोला (Open Voice Advisor)</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <MitraCharacter state="idle" size={96} />
              <div className="bg-white border-2 border-ink px-4 py-1.5 rounded-full text-xs font-black text-ink shadow-solid-sm">
                मित्र (Mitra)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Deep-Dive: For Jobseekers vs For Employers */}
      <section id="jobseekers" className="py-16 sm:py-20 border-b-2 border-ink bg-canvas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* For Jobseekers */}
            <div className="settle-card-hero p-8 bg-white flex flex-col justify-between">
              <div>
                <span className="text-xs font-black uppercase text-primary font-mono tracking-wider">
                  Candidate Portal
                </span>
                <h3 className="text-2xl font-black text-ink mt-1 mb-4">
                  {preferredLocale === 'mr' ? 'उमेदवारांसाठी काय आहे?' : 'What Jobseekers Get'}
                </h3>
                <ul className="space-y-3 text-sm text-ink-secondary font-medium">
                  <li className="flex items-start gap-2.5">
                    <span className="text-verified font-bold">✓</span>
                    <span>नागपूर, बुटीबोरी व स्थानिक MIDC कारखान्यांमधील थेट संधी</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-verified font-bold">✓</span>
                    <span>कोणतीही दलाली फी किंवा पगार कपात नाही</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-verified font-bold">✓</span>
                    <span>शासकीय ITI कोर्सेस आणि मोफत प्रमाणपत्रे (DVET)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-verified font-bold">✓</span>
                    <span>आवाजाद्वारे मराठी व हिंदीत प्रोफाइल निर्मिती</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-4 border-t border-steel/40">
                <Link
                  href="/candidate"
                  className="settle-pill-btn w-full py-3 text-xs sm:text-sm font-bold text-center inline-flex items-center justify-center gap-2"
                >
                  <span>{copy.ctaCandidate}</span>
                  <IconArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* For Employers */}
            <div id="employers" className="settle-card-hero p-8 bg-white flex flex-col justify-between">
              <div>
                <span className="text-xs font-black uppercase text-primary font-mono tracking-wider">
                  Employer Portal
                </span>
                <h3 className="text-2xl font-black text-ink mt-1 mb-4">
                  {preferredLocale === 'mr' ? 'नियोक्त्यांसाठी काय आहे?' : 'What Employers Get'}
                </h3>
                <ul className="space-y-3 text-sm text-ink-secondary font-medium">
                  <li className="flex items-start gap-2.5">
                    <span className="text-verified font-bold">✓</span>
                    <span>स्थानिक तालुक्यातील कुशल तंत्रज्ञ व कामगार त्वरित उपलब्ध</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-verified font-bold">✓</span>
                    <span>शून्य एजन्सी कमिशन — १ मिनिटात थेट मोफत जाहिरात</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-verified font-bold">✓</span>
                    <span>उमेदवारांशी थेट फोन कॉल व मुलाखत व्यवस्था</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-verified font-bold">✓</span>
                    <span>कौशल्यानुसार पूर्व-तपासलेले स्थानिक अर्जदार</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-4 border-t border-steel/40">
                <Link
                  href="/employer"
                  className="settle-pill-chip w-full py-3 text-xs sm:text-sm font-bold text-center border-2 border-ink text-ink hover:bg-steel-soft inline-flex items-center justify-center gap-2 transition"
                >
                  <span>{copy.ctaEmployer}</span>
                  <IconArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section (SAKER Style Expandable Accordion) */}
      <section id="faq" className="py-16 sm:py-20 border-b-2 border-ink bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-black uppercase tracking-wider text-primary font-mono">
              Got Questions?
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-ink mt-2">
              {copy.faqTitle}
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="settle-card border-2 border-ink overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-black text-ink text-sm sm:text-base hover:bg-canvas/50 transition"
                >
                  <span>{faq.q}</span>
                  <span className="text-lg font-mono text-ink-secondary">
                    {openFaq === idx ? '−' : '+'}
                  </span>
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 pt-1 text-sm text-ink-secondary font-medium leading-relaxed border-t border-steel/40 bg-canvas/20">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Hero */}
      <section className="py-16 sm:py-20 bg-ink text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-white font-mono text-xs font-bold border border-white/20">
            Open for All Jobseekers & Employers
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            स्थानिक कौशल्ये. थेट रोजगार.
          </h2>
          <p className="text-sm sm:text-base text-steel/80 max-w-xl mx-auto font-medium">
            आजच आपल्या मोबाइल नंबरद्वारे किंवा Google ने १ मिनिटात साइन इन करा.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-ink border-2 border-white hover:bg-canvas rounded-full font-bold shadow-solid transition text-sm inline-flex items-center justify-center gap-2"
            >
              <span>नवीन खाते उघडा (Sign Up)</span>
              <IconArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 bg-transparent text-white border-2 border-white hover:bg-white/10 rounded-full font-bold transition text-sm inline-flex items-center justify-center gap-2"
            >
              <span>लॉगिन करा (Sign In)</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
