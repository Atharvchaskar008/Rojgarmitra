'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { getDictionary } from '@rojgarmitra/i18n';
import { CareerPlan, SupportedLocale } from '@rojgarmitra/shared';
import { 
  IconCompass, 
  IconClock, 
  IconGraduationCap, 
  IconUser, 
  IconArrowRight,
  IconVideo,
  IconBookOpen,
  IconWrench,
  IconExternalLink,
  IconCheck,
  IconAlertCircle,
  IconBriefcase
} from '@/components/icons';

export default function CandidateCareerPlanPage() {
  const { preferredLocale, user, getIdToken } = useAuth();
  const dict = getDictionary(preferredLocale);

  const [careerPlan, setCareerPlan] = useState<CareerPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Candidate real situation and custom target inputs
  const defaultSituations: Record<SupportedLocale, string> = {
    mr: 'गेल्या ६ महिन्यांपासून बेरोजगार आहे. स्पर्धा परीक्षेचा (महाडिस्कॉम/तलाठी) प्रयत्न केला पण अपयश आले. आता तातडीने उत्पन्नाची व प्रत्यक्ष कारखान्यात स्थिर कामाची गरज आहे.',
    hi: 'पिछले ६ महीनों से बेरोजगार हूँ। सरकारी परीक्षा (महाडिस्कॉम/तलाठी) की कोशिश की लेकिन सफलता नहीं मिली। अब तुरंत आय और स्थिर काम की जरूरत है।',
    en: 'Unemployed for the past 6 months after preparing for competitive exams (MPSC/DISCOM). Need immediate income and stable job within 30 days.',
  };
  const defaultTargets: Record<SupportedLocale, string> = {
    mr: '२ वर्षांत ₹२५,०००+ मासिक वेतन व हिंगणा/बुटीबोरी MIDC मध्ये कायम तंत्रज्ञ किंवा सुपरवायझर पद.',
    hi: '२ वर्षों में ₹२५,०००+ मासिक वेतन और हिंगना/बुटीबोरी MIDC में स्थायी तकनीशियन या सुपरवाइजर पद।',
    en: 'Within 2 years: earn ₹25,000+ monthly wage as a permanent technician or shopfloor supervisor in MIDC.',
  };

  const [currentSituation, setCurrentSituation] = useState(defaultSituations[preferredLocale]);
  const [customTarget, setCustomTarget] = useState(defaultTargets[preferredLocale]);

  // Sync default prompts when locale switches if not custom modified
  useEffect(() => {
    setCurrentSituation(defaultSituations[preferredLocale]);
    setCustomTarget(defaultTargets[preferredLocale]);
  }, [preferredLocale]);

  async function loadPlan(situation?: string, target?: string) {
    if (!situation && !target) setLoading(true);
    else setUpdating(true);

    try {
      const token = await getIdToken();
      if (!token) {
        setLoading(false);
        setUpdating(false);
        return;
      }
      const res = await fetch('/api/v1/agents/career-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          locale: preferredLocale,
          currentSituation: situation || currentSituation,
          targetRole: target || customTarget,
        }),
      });
      const json = await res.json();
      if (json.data) {
        setCareerPlan(json.data);
      }
    } catch (err) {
      console.error('Failed to load career plan:', err);
    } finally {
      setLoading(false);
      setUpdating(false);
    }
  }

  useEffect(() => {
    loadPlan();
  }, [preferredLocale]);

  const handleUpdateRealityPlan = (e: React.FormEvent) => {
    e.preventDefault();
    loadPlan(currentSituation, customTarget);
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 w-full">
      {/* Header Banner - SETTLE Hero Card */}
      <div className="settle-card-hero p-6 sm:p-8 mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-steel-soft border border-steel rounded-full text-xs font-bold text-steel-deep mb-3 shadow-sm">
          <IconCompass className="w-3.5 h-3.5 text-primary" />
          <span>
            {preferredLocale === 'mr'
              ? 'करिअर मार्गदर्शक (DVET, MSME व उद्योगप्रणीत रोडमॅप)'
              : preferredLocale === 'hi'
              ? 'करियर मार्गदर्शक (DVET, MSME व उद्योग आधारित रोडमैप)'
              : 'Vocational Career Guidance (DVET, MSME & Industry Grounded)'}
          </span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-ink tracking-tight mt-1">
          {dict.nav.career}
        </h1>
        <p className="text-ink-secondary text-sm mt-1 font-medium">
          {preferredLocale === 'mr'
            ? 'केवळ पुस्तकी माहिती नव्हे, तर विदर्भातील प्रत्यक्ष नोकरी बाजारावर आधारित वास्तववादी करिअर आराखडा.'
            : preferredLocale === 'hi'
            ? 'केवल किताबी बातें नहीं, बल्कि विदर्भ के वास्तविक औद्योगिक बाजार पर आधारित व्यावहारिक करियर रोडमैप।'
            : 'Personalized vocational career roadmap grounded in realistic Vidarbha job market demands.'}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-ink-secondary font-bold text-sm">
          ⌛ {dict.common.loading}
        </div>
      ) : !user ? (
        <div className="text-center py-12 settle-card p-8">
          <div className="w-12 h-12 rounded-full bg-steel-soft border border-ink/20 flex items-center justify-center mx-auto mb-3">
            <IconUser className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-base font-black text-ink mb-1">
            {preferredLocale === 'mr' ? 'लॉगिन आवश्यक आहे' : preferredLocale === 'hi' ? 'लॉग इन आवश्यक है' : 'Login Required'}
          </h3>
          <p className="text-sm text-ink-secondary mb-4 font-medium">
            {preferredLocale === 'mr'
              ? 'आपल्या कौशल्यांवर आधारित सानुकूल करिअर मार्गदर्शक पाहण्यासाठी कृपया लॉगिन करा.'
              : preferredLocale === 'hi'
              ? 'अपने कौशल पर आधारित व्यक्तिगत करियर रोडमैप देखने के लिए कृपया लॉग इन करें।'
              : 'Please sign in to see your personalized vocational career plan.'}
          </p>
          <Link
            href="/login"
            className="settle-pill-btn px-6 py-2.5 text-xs inline-flex items-center gap-1.5 font-bold"
          >
            <span>{dict.nav.login}</span>
            <IconArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : !careerPlan ? (
        <div className="text-center py-12 settle-card p-8">
          <p className="text-ink font-bold">{dict.common.not_found}</p>
          <p className="text-sm text-ink-secondary mt-1 mb-4">
            {preferredLocale === 'mr'
              ? 'करिअर प्लॅन तयार करण्यासाठी कृपया प्रथम प्रोफाईल पूर्ण करा.'
              : preferredLocale === 'hi'
              ? 'करियर रोडमैप तैयार करने के लिए कृपया पहले अपनी प्रोफाइल पूरी करें।'
              : 'Please complete your skills profile first to generate a career roadmap.'}
          </p>
          <Link
            href="/candidate/onboarding"
            className="settle-pill-btn px-6 py-2.5 text-xs inline-flex items-center gap-1.5 font-bold"
          >
            <span>
              {preferredLocale === 'mr'
                ? 'प्रोफाईल तयार करा'
                : preferredLocale === 'hi'
                ? 'प्रोफ़ाइल बनाएं'
                : 'Create Profile'}
            </span>
            <IconArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Target Role Card - SETTLE Deep Ink Focus */}
          <div className="bg-ink text-white border-2 border-ink rounded-2xl p-6 shadow-solid">
            <span className="text-xs text-steel font-bold uppercase tracking-wider block mb-1">
              {preferredLocale === 'mr'
                ? 'लक्ष्य पद (Target Career Milestone)'
                : preferredLocale === 'hi'
                ? 'लक्ष्य पद (Target Career Milestone)'
                : 'Target Career Milestone'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight">{careerPlan.targetRole}</h2>
            <p className="text-xs text-steel-soft font-semibold">
              {preferredLocale === 'mr' ? 'सध्याचा व्यवसाय:' : preferredLocale === 'hi' ? 'वर्तमान व्यवसाय:' : 'Current Trade:'}{' '}
              <span className="font-bold underline text-white">{careerPlan.currentTrade}</span>
            </p>
          </div>

          {/* Interactive Candidate Situation & Realistic Target Form */}
          <form onSubmit={handleUpdateRealityPlan} className="settle-card p-6 bg-surface space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <h3 className="text-sm sm:text-base font-black text-ink">
                {preferredLocale === 'mr'
                  ? 'माझी सद्यस्थिती व लक्ष्य (My Real Situation & Target)'
                  : preferredLocale === 'hi'
                  ? 'मेरी वर्तमान स्थिति व लक्ष्य (My Real Situation & Target)'
                  : 'My Current Situation & Target Goal'}
              </h3>
            </div>
            <p className="text-xs text-ink-secondary font-medium">
              {preferredLocale === 'mr'
                ? 'आपल्या आर्थिक अडचणी, स्पर्धा परीक्षांचा अनुभव किंवा विशिष्ट ध्येय येथे लिहा. मित्र AI अति-स्पर्धात्मक पदांऐवजी प्रत्यक्ष साध्य होणारा प्रामाणिक मार्ग दाखवेल.'
                : preferredLocale === 'hi'
                ? 'अपनी वित्तीय कठिनाई, प्रतियोगी परीक्षा का अनुभव या विशिष्ट लक्ष्य यहाँ लिखें। मित्र AI व्यावहारिक समाधान दिखाएगा।'
                : 'Share your exact challenges or target goals. Mitra AI will analyze market reality vs hyper-competitive traps.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
              <div>
                <label className="block text-ink uppercase tracking-wider mb-1 font-black">
                  {preferredLocale === 'mr' ? '१. सध्याची परिस्थिती (Financial/Job Reality):' : preferredLocale === 'hi' ? '१. वर्तमान स्थिति (Financial/Job Reality):' : '1. Current Situation & Pressure:'}
                </label>
                <textarea
                  rows={3}
                  value={currentSituation}
                  onChange={(e) => setCurrentSituation(e.target.value)}
                  placeholder={
                    preferredLocale === 'mr'
                      ? 'उदा. ६ महिने बेरोजगार, पैशांची निकड, सरकारी परीक्षेत अपयश...'
                      : preferredLocale === 'hi'
                      ? 'उदा. ६ महीने से बेरोजगार, आर्थिक दबाव, परीक्षा में असफलता...'
                      : 'e.g. 6 months unemployed, urgent financial need, exam fatigue...'
                  }
                  className="w-full bg-canvas border border-ink/20 rounded-xl p-3 text-xs font-medium text-ink focus:outline-none focus:border-ink"
                />
              </div>

              <div>
                <label className="block text-ink uppercase tracking-wider mb-1 font-black">
                  {preferredLocale === 'mr' ? '२. काय साध्य करायचे आहे (Realistic Target):' : preferredLocale === 'hi' ? '२. क्या हासिल करना है (Realistic Target):' : '2. What You Want to Achieve:'}
                </label>
                <textarea
                  rows={3}
                  value={customTarget}
                  onChange={(e) => setCustomTarget(e.target.value)}
                  placeholder={
                    preferredLocale === 'mr'
                      ? 'उदा. २ वर्षांत ₹२५,००० वेतन व MIDC कारखान्यात कायम काम...'
                      : preferredLocale === 'hi'
                      ? 'उदा. २ वर्ष में ₹२५,००० वेतन और MIDC में स्थायी काम...'
                      : 'e.g. ₹25,000/mo salary within 2 years in MIDC...'
                  }
                  className="w-full bg-canvas border border-ink/20 rounded-xl p-3 text-xs font-medium text-ink focus:outline-none focus:border-ink"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-ink-muted">
                {preferredLocale === 'mr' 
                  ? '💡 अति-स्पर्धा विरुद्ध खाजगी/औद्योगिक संधी विश्लेषण' 
                  : preferredLocale === 'hi'
                  ? '💡 अति-प्रतिस्पर्धा बनाम औद्योगिक रोजगार विश्लेषण'
                  : '💡 Anti-saturation & realistic market matching'}
              </span>
              <button
                type="submit"
                disabled={updating}
                className="settle-pill-btn px-5 py-2 text-xs font-black inline-flex items-center gap-1.5 shadow-sm"
              >
                <span>
                  {updating
                    ? dict.common.loading
                    : preferredLocale === 'mr'
                    ? 'सत्यता विश्लेषण व सल्ला अपडेट करा'
                    : preferredLocale === 'hi'
                    ? 'सत्यता विश्लेषण व सलाह अपडेट करें'
                    : 'Update Realistic Plan'}
                </span>
                <IconArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* REALITY CHECK & COMPANION MENTOR ADVICE CARD */}
          {careerPlan.realityCheck && (
            <div className="settle-card-hero p-6 sm:p-7 border-2 border-primary/40 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center gap-1">
                  <IconAlertCircle className="w-3.5 h-3.5 text-amber-700" />
                  <span>
                    {preferredLocale === 'mr'
                      ? 'सत्यता पडताळणी व मित्रचा सल्ला (Reality Check)'
                      : preferredLocale === 'hi'
                      ? 'सत्यता पड़ताल व मित्र की सलाह (Reality Check)'
                      : 'Market Competition Reality Check'}
                  </span>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium">
                {/* 1. Competition Analysis */}
                <div className="bg-canvas p-4 rounded-xl border border-steel flex flex-col justify-between">
                  <div>
                    <span className="font-black text-ink block uppercase mb-1.5 text-[11px] text-alert">
                      ⚖️ {preferredLocale === 'mr' ? 'स्पर्धा वास्तव (Competition Ratio):' : preferredLocale === 'hi' ? 'प्रतियोगिता का सच (Competition Ratio):' : 'Competition Reality:'}
                    </span>
                    <p className="text-ink-secondary leading-relaxed">
                      {careerPlan.realityCheck.competitionAnalysis}
                    </p>
                  </div>
                </div>

                {/* 2. Immediate Next Step */}
                <div className="bg-canvas p-4 rounded-xl border border-steel flex flex-col justify-between">
                  <div>
                    <span className="font-black text-ink block uppercase mb-1.5 text-[11px] text-verified">
                      🚀 {preferredLocale === 'mr' ? 'तातडीची पहिली पायरी (Next 30 Days):' : preferredLocale === 'hi' ? 'तुरंत पहला कदम (Next 30 Days):' : 'Immediate Next 30 Days:'}
                    </span>
                    <p className="text-ink-secondary leading-relaxed">
                      {careerPlan.realityCheck.immediateNextStep}
                    </p>
                  </div>
                </div>

                {/* 3. Realistically Achievable Target */}
                <div className="bg-canvas p-4 rounded-xl border border-steel flex flex-col justify-between">
                  <div>
                    <span className="font-black text-ink block uppercase mb-1.5 text-[11px] text-primary">
                      🎯 {preferredLocale === 'mr' ? 'साध्य वास्तव (Achievable Target):' : preferredLocale === 'hi' ? 'व्यावहारिक लक्ष्य (Achievable Target):' : 'Realistic Progression Curve:'}
                    </span>
                    <p className="text-ink-secondary leading-relaxed">
                      {careerPlan.realityCheck.targetAchievability}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Milestones Timeline */}
          <div className="space-y-4">
            <h3 className="text-xl font-black text-ink mb-2">
              {preferredLocale === 'mr'
                ? 'प्रगतीचे टप्पे (Actionable Milestones)'
                : preferredLocale === 'hi'
                ? 'प्रगति के चरण (Actionable Milestones)'
                : 'Actionable Career Milestones'}
            </h3>

            {careerPlan.milestones.map((m, idx) => (
              <div
                key={idx}
                className="settle-card-interactive p-6 relative"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <h4 className="text-base font-black text-ink">{m.title}</h4>
                  <span className="text-xs font-bold px-3 py-1 bg-steel-soft text-steel-deep rounded-full border border-steel/60 inline-flex items-center gap-1">
                    <IconClock className="w-3.5 h-3.5" />
                    <span>
                      {preferredLocale === 'mr'
                        ? `अंदाजे ${m.estimatedMonths} महिने`
                        : preferredLocale === 'hi'
                        ? `लगभग ${m.estimatedMonths} माह`
                        : `~${m.estimatedMonths} Months`}
                    </span>
                  </span>
                </div>
                <p className="text-sm text-ink-secondary mb-4 font-medium leading-relaxed">{m.description}</p>

                {/* Suggested Government Courses */}
                {m.suggestedCourses && m.suggestedCourses.length > 0 && (
                  <div className="mt-3 p-3.5 bg-canvas rounded-xl text-xs text-ink border border-steel/50">
                    <span className="font-black text-ink block mb-1 inline-flex items-center gap-1.5">
                      <IconGraduationCap className="w-3.5 h-3.5 text-primary" />
                      <span>
                        {preferredLocale === 'mr'
                          ? 'शिफारस केलेले अभ्यासक्रम (DVET ITI, MSME व अप्रेंटिसशिप):'
                          : preferredLocale === 'hi'
                          ? 'अनुशंसित प्रशिक्षण (DVET ITI, MSME व अप्रेंटिसशिप):'
                          : 'Recommended Courses & Apprenticeship:'}
                      </span>
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-ink-secondary font-medium">
                      {m.suggestedCourses.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Free Online YouTube Video Tutorials */}
                {m.freeTutorials && m.freeTutorials.length > 0 && (
                  <div className="mt-4 p-4 bg-surface rounded-xl border border-steel">
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="font-black text-ink text-xs inline-flex items-center gap-1.5">
                        <IconVideo className="w-3.5 h-3.5 text-alert" />
                        <span>
                          {preferredLocale === 'mr'
                            ? 'मोफत व्हिडिओ ट्यूटोरियल्स (YouTube):'
                            : preferredLocale === 'hi'
                            ? 'नि:शुल्क वीडियो ट्यूटोरियल्स (YouTube):'
                            : 'Free Video Tutorials (YouTube):'}
                        </span>
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-alert-bg text-alert border border-alert rounded-full">
                        मराठी / हिंदी
                      </span>
                    </div>
                    <div className="space-y-2">
                      {m.freeTutorials.map((tut, tIdx) => (
                        <a
                          key={tIdx}
                          href={tut.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2.5 bg-canvas hover:bg-surface-subtle border border-steel/60 hover:border-ink rounded-lg text-xs font-bold text-ink transition group"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-alert-bg text-alert flex items-center justify-center text-[10px] font-black group-hover:scale-110 transition">
                              ▶
                            </span>
                            <div>
                              <p className="leading-tight text-ink">{tut.title}</p>
                              {tut.publisherOrChannel && (
                                <p className="text-[10px] text-ink-secondary font-medium">
                                  {preferredLocale === 'mr' ? 'चॅनेल:' : preferredLocale === 'hi' ? 'चैनल:' : 'Channel:'}{' '}
                                  {tut.publisherOrChannel}
                                </p>
                              )}
                            </div>
                          </div>
                          <IconExternalLink className="w-3.5 h-3.5 text-ink-secondary group-hover:text-ink shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended Official Free NIMI Books */}
                {m.recommendedBooks && m.recommendedBooks.length > 0 && (
                  <div className="mt-4 p-4 bg-surface rounded-xl border border-steel">
                    <span className="font-black text-ink text-xs block mb-2.5 inline-flex items-center gap-1.5">
                      <IconBookOpen className="w-3.5 h-3.5 text-primary" />
                      <span>
                        {preferredLocale === 'mr'
                          ? 'अधिकृत मोफत पुस्तके व अभ्यास साहित्य (Bharat Skills NIMI):'
                          : preferredLocale === 'hi'
                          ? 'आधिकारिक नि:शुल्क पुस्तकें व अध्ययन सामग्री (Bharat Skills NIMI):'
                          : 'Official Free Books & Study Guides (Bharat Skills NIMI):'}
                      </span>
                    </span>
                    <div className="space-y-2">
                      {m.recommendedBooks.map((b, bIdx) => (
                        <a
                          key={bIdx}
                          href={b.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2.5 bg-canvas hover:bg-surface-subtle border border-steel/60 hover:border-ink rounded-lg text-xs font-bold text-ink transition group"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-steel-soft text-primary flex items-center justify-center text-[11px] font-black">
                              📄
                            </span>
                            <div>
                              <p className="leading-tight text-ink">{b.title}</p>
                              {b.publisherOrChannel && (
                                <p className="text-[10px] text-ink-secondary font-medium">
                                  {preferredLocale === 'mr' ? 'प्रकाशक:' : preferredLocale === 'hi' ? 'प्रकाशक:' : 'Publisher:'}{' '}
                                  {b.publisherOrChannel} • {preferredLocale === 'mr' ? 'मोफत PDF' : preferredLocale === 'hi' ? 'नि:शुल्क PDF' : 'Free PDF'}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="settle-pill-chip text-[11px] px-2 py-0.5 group-hover:bg-ink group-hover:text-white transition">
                            {preferredLocale === 'mr' ? 'PDF वाचा' : preferredLocale === 'hi' ? 'PDF पढ़ें' : 'Read PDF'}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Practical Shop-Floor Projects */}
                {m.practicalProjects && m.practicalProjects.length > 0 && (
                  <div className="mt-4 p-4 bg-verified-bg/40 rounded-xl border-2 border-verified">
                    <span className="font-black text-verified text-xs block mb-2 inline-flex items-center gap-1.5">
                      <IconWrench className="w-3.5 h-3.5 text-verified" />
                      <span>
                        {preferredLocale === 'mr'
                          ? 'वर्कशॉप प्रत्यक्ष सराव (Shop-Floor Hands-on Practice):'
                          : preferredLocale === 'hi'
                          ? 'वर्कशॉप प्रत्यक्ष अभ्यास (Shop-Floor Hands-on Practice):'
                          : 'Shop-Floor Hands-on Practice Projects:'}
                      </span>
                    </span>
                    {m.practicalProjects.map((proj, pIdx) => (
                      <div key={pIdx} className="space-y-1.5 text-xs text-ink font-medium">
                        <p className="font-black text-sm text-ink">{proj.title}</p>
                        <p className="text-xs text-ink-secondary mb-2">{proj.description}</p>
                        <div className="bg-canvas p-3 rounded-lg border border-steel/60 space-y-1 text-[11px]">
                          <strong className="block text-ink font-bold mb-1">
                            {preferredLocale === 'mr' ? 'कृतीचे टप्पे:' : preferredLocale === 'hi' ? 'क्रियान्वयन चरण:' : 'Action Steps:'}
                          </strong>
                          {proj.steps.map((st, sIdx) => (
                            <p key={sIdx} className="text-ink-secondary">{st}</p>
                          ))}
                        </div>
                        {proj.safetyTips && (
                          <p className="text-[11px] font-bold text-alert mt-1.5 bg-alert-bg p-2 rounded border border-alert/50">
                            {proj.safetyTips}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
