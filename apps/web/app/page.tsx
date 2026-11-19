'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { getDictionary } from '@rojgarmitra/i18n';
import { 
  IconSearch, 
  IconUser, 
  IconBuilding, 
  IconMapPin, 
  IconBriefcase, 
  IconCheck, 
  IconShieldCheck, 
  IconGraduationCap, 
  IconArrowRight 
} from '@/components/icons';

export default function HomePage() {
  const { preferredLocale, user } = useAuth();
  const dict = getDictionary(preferredLocale);

  const heroTexts = {
    mr: {
      headline: 'स्थानिक कौशल्ये.',
      headlineAccent: 'थेट नोकऱ्या.',
      subline: 'विदर्भ व परिसरातील सर्व कुशल, अकुशल, तंत्रज्ञ व नवोदित उमेदवारांसाठी खुले रोजगार व्यासपीठ.',
      badges: 'Zero Consultancy Fees · 100% Real Vacancies · Open for All Jobseekers',
      searchLabel: 'शोध निवडा (Search Positions & Areas)',
      searchPlaceholder: 'उदा. वेल्डर, वायरमन, फिटर, ऑपरेटर, सेल्स, हिंगणा, बुटीबोरी...',
      searchBtn: 'शोधा',
      candidateTitle: 'मी नोकरी शोधत आहे',
      candidateSubtitle: 'Candidate / Open to All Jobseekers',
      candidateF1: 'आवाज किंवा साध्या शब्दांत २ मिनिटांत प्रोफाइल बनवा',
      candidateF2: 'नागपूर, बुटीबोरी व जवळच्या स्थानिक कारखान्यांतील थेट नोकऱ्या',
      candidateF3: 'शासकीय ITI अभ्यासक्रमांसह करिअर वाढवा',
      candidateBtn: 'नोकऱ्या पहा व अर्ज करा',
      employerTitle: 'मला कुशल कामगार हवे आहेत',
      employerSubtitle: 'Plant Head / Workshop / Business Owner',
      employerF1: 'स्थानिक तंत्रज्ञ, कामगार व शिकाऊ उमेदवार थेट उपलब्ध',
      employerF2: 'विना-मध्यस्थ, शून्य कन्सल्टन्सी कमिशन',
      employerF3: '१ मिनिटात नवीन कामगार भरती जाहिरात द्या',
      employerBtn: 'उमेदवार शोधा व जागा टाका',
      proof1: '100% प्रत्यक्ष सत्यापन',
      proof2: 'DVET शासकीय अभ्यासक्रम मार्गदर्शन',
      proof3: 'मराठी • हिंदी • English',
    },
    hi: {
      headline: 'स्थानीय कौशल.',
      headlineAccent: 'सीधी नौकरियां.',
      subline: 'विदर्भ और आसपास के सभी कुशल, तकनीशियन व नए उम्मीदवारों के लिए खुला रोजगार मंच।',
      badges: 'Zero Consultancy Fees · 100% Real Vacancies · Open for All Jobseekers',
      searchLabel: 'कार्य या क्षेत्र खोजें (Search Positions & Areas)',
      searchPlaceholder: 'उदा. वेल्डर, वायरमैन, फिटर, ऑपरेटर, सेल्स, हिंगणा, बुटीबोरी...',
      searchBtn: 'खोजें',
      candidateTitle: 'मैं नौकरी ढूंढ रहा हूँ',
      candidateSubtitle: 'Candidate / Open to All Jobseekers',
      candidateF1: 'आवाज या सरल शब्दों में २ मिनट में प्रोफाइल बनाएं',
      candidateF2: 'नागपुर, बुटीबोरी और स्थानीय उद्योगों में सीधी भर्तियां',
      candidateF3: 'सरकारी ITI कोर्सेस के साथ अपना हुनर बढ़ाएं',
      candidateBtn: 'नौकरियां देखें और आवेदन करें',
      employerTitle: 'मुझे कुशल कामगार चाहिए',
      employerSubtitle: 'Plant Head / Workshop / Business Owner',
      employerF1: 'स्थानीय कुशल कारीगर व अप्रेंटिस सीधे उपलब्ध',
      employerF2: 'बिना किसी बिचौलिए या कंसल्टेंसी कमीशन के',
      employerF3: '१ मिनट में नई भर्ती विज्ञापन पोस्ट करें',
      employerBtn: 'उम्मीदवार खोजें और भर्ती पोस्ट करें',
      proof1: '100% वास्तविक सत्यापन',
      proof2: 'DVET सरकारी पाठ्यक्रम मार्गदर्शन',
      proof3: 'मराठी • हिंदी • English',
    },
    en: {
      headline: 'Local Skills.',
      headlineAccent: 'Direct Opportunities.',
      subline: 'An inclusive employment platform connecting technicians, apprentices, and jobseekers with verified plants across Vidarbha.',
      badges: 'Zero Consultancy Fees · 100% Real Vacancies · Open for All Jobseekers',
      searchLabel: 'Search Positions & Areas',
      searchPlaceholder: 'e.g. Welder, Wireman, Fitter, CNC Operator, Sales, Butibori...',
      searchBtn: 'Search',
      candidateTitle: 'I am looking for a job',
      candidateSubtitle: 'Candidate / Open to All Jobseekers',
      candidateF1: 'Create your verified profile in 2 mins using voice or simple text',
      candidateF2: 'Direct vacancies in verified plants across Nagpur & Vidarbha',
      candidateF3: 'Upgrade skills with certified government ITI courses',
      candidateBtn: 'Explore Jobs & Apply',
      employerTitle: 'I need workforce',
      employerSubtitle: 'Plant Head / Workshop / Business Owner',
      employerF1: 'Direct access to certified technicians, operators & apprentices',
      employerF2: 'Zero third-party commissions or agency fees',
      employerF3: 'Post job vacancies in under 1 minute',
      employerBtn: 'Find Candidates & Post Jobs',
      proof1: '100% Verified Vacancies',
      proof2: 'DVET Vocational Guidance',
      proof3: 'Marathi • Hindi • English',
    },
  };

  const t = heroTexts[preferredLocale] || heroTexts.mr;

  return (
    <main className="min-h-[85vh] flex flex-col items-center justify-center py-8 px-4">
      <div className="max-w-4xl w-full text-center space-y-8">
        {/* Pilot Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-steel-soft border border-steel text-steel-deep text-xs font-bold shadow-sm">
          <span className="font-mono uppercase tracking-wider">YCCE HACKKUMBH 2026</span>
          <span className="text-steel">•</span>
          <span>{dict.app.pilot_region}</span>
          <span className="text-steel">•</span>
          <span className="text-primary font-bold">सर्व उमेदवारांसाठी मुक्त</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-ink tracking-tight">
            {t.headline} <span className="text-primary underline decoration-steel underline-offset-8">{t.headlineAccent}</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-ink-secondary max-w-2xl mx-auto font-medium leading-relaxed">
            {t.subline}
            <br />
            <span className="text-xs sm:text-sm text-ink-muted">{t.badges}</span>
          </p>
        </div>

        {/* Quick Auth Actions for Unauthenticated Visitors */}
        {!user && (
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <Link
              href="/signup"
              className="settle-pill-btn px-6 py-2.5 text-xs sm:text-sm font-bold shadow-solid inline-flex items-center gap-2"
            >
              <span>{dict.nav.register} (Get Started)</span>
              <IconArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/login"
              className="settle-pill-btn bg-white text-ink border-ink hover:bg-steel-soft px-6 py-2.5 text-xs sm:text-sm font-bold shadow-solid-sm inline-flex items-center gap-1.5"
            >
              <IconUser className="w-3.5 h-3.5 text-ink-secondary" />
              <span>{dict.nav.login}</span>
            </Link>
          </div>
        )}

        {/* Settle-Style Search Box */}
        <div className="max-w-2xl mx-auto">
          <div className="settle-card-hero p-3 sm:p-4 flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 text-left w-full px-2">
              <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider block">
                {t.searchLabel}
              </label>
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                readOnly
                className="w-full bg-transparent text-sm font-semibold text-ink focus:outline-none cursor-pointer"
              />
            </div>
            <Link
              href="/candidate"
              className="settle-pill-btn px-6 py-2.5 text-xs sm:text-sm w-full sm:w-auto text-center inline-flex items-center justify-center gap-1.5"
            >
              <IconSearch className="w-3.5 h-3.5" />
              <span>{t.searchBtn}</span>
            </Link>
          </div>

          {/* Clean Pill Filter Chips (Zero Emojis) */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
            <Link href="/candidate?area=Hingna" className="settle-pill-chip px-3 py-1 text-xs inline-flex items-center gap-1.5">
              <IconMapPin className="w-3 h-3 text-ink-secondary" />
              <span>हिंगणा MIDC</span>
            </Link>
            <Link href="/candidate?area=Butibori" className="settle-pill-chip px-3 py-1 text-xs inline-flex items-center gap-1.5">
              <IconMapPin className="w-3 h-3 text-ink-secondary" />
              <span>बुटीबोरी MIDC</span>
            </Link>
            <Link href="/candidate?trade=welder" className="settle-pill-chip px-3 py-1 text-xs inline-flex items-center gap-1.5">
              <IconBriefcase className="w-3 h-3 text-ink-secondary" />
              <span>वेल्डर (Welder)</span>
            </Link>
            <Link href="/candidate?trade=electrician" className="settle-pill-chip px-3 py-1 text-xs inline-flex items-center gap-1.5">
              <IconBriefcase className="w-3 h-3 text-ink-secondary" />
              <span>वायरमन (Electrician)</span>
            </Link>
            <Link href="/candidate?trade=fitter" className="settle-pill-chip px-3 py-1 text-xs inline-flex items-center gap-1.5">
              <IconBriefcase className="w-3 h-3 text-ink-secondary" />
              <span>फिटर (Fitter)</span>
            </Link>
          </div>
        </div>

        {/* Two Pathway Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 text-left">
          {/* Candidate Card */}
          <div className="settle-card-interactive p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-full bg-steel-soft flex items-center justify-center border-2 border-ink mb-4">
                <IconUser className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-ink mb-1">
                {t.candidateTitle}
              </h2>
              <p className="text-xs font-bold text-ink-secondary mb-4 uppercase tracking-wider">
                {t.candidateSubtitle}
              </p>
              <ul className="space-y-2.5 text-xs sm:text-sm text-ink-secondary mb-6 font-medium">
                <li className="flex items-center gap-2">
                  <IconCheck className="w-4 h-4 text-verified shrink-0" />
                  <span>{t.candidateF1}</span>
                </li>
                <li className="flex items-center gap-2">
                  <IconCheck className="w-4 h-4 text-verified shrink-0" />
                  <span>{t.candidateF2}</span>
                </li>
                <li className="flex items-center gap-2">
                  <IconCheck className="w-4 h-4 text-verified shrink-0" />
                  <span>{t.candidateF3}</span>
                </li>
              </ul>
            </div>
            <Link
              href="/candidate"
              className="settle-pill-btn py-2.5 px-6 text-xs sm:text-sm text-center block w-full inline-flex items-center justify-center gap-1.5 font-bold"
            >
              <span>{t.candidateBtn}</span>
              <IconArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Employer Card */}
          <div className="settle-card-interactive p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-full bg-steel-soft flex items-center justify-center border-2 border-ink mb-4">
                <IconBuilding className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-ink mb-1">
                {t.employerTitle}
              </h2>
              <p className="text-xs font-bold text-ink-secondary mb-4 uppercase tracking-wider">
                {t.employerSubtitle}
              </p>
              <ul className="space-y-2.5 text-xs sm:text-sm text-ink-secondary mb-6 font-medium">
                <li className="flex items-center gap-2">
                  <IconCheck className="w-4 h-4 text-primary shrink-0" />
                  <span>{t.employerF1}</span>
                </li>
                <li className="flex items-center gap-2">
                  <IconCheck className="w-4 h-4 text-primary shrink-0" />
                  <span>{t.employerF2}</span>
                </li>
                <li className="flex items-center gap-2">
                  <IconCheck className="w-4 h-4 text-primary shrink-0" />
                  <span>{t.employerF3}</span>
                </li>
              </ul>
            </div>
            <Link
              href="/employer"
              className="settle-pill-btn bg-ink hover:bg-ink/90 py-2.5 px-6 text-xs sm:text-sm text-center block w-full inline-flex items-center justify-center gap-1.5 font-bold"
            >
              <span>{t.employerBtn}</span>
              <IconArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Bottom Proof Strip */}
        <div className="pt-6 border-t border-steel/40 flex flex-wrap items-center justify-center gap-6 text-xs text-ink-secondary font-medium">
          <span className="flex items-center gap-1.5">
            <IconShieldCheck className="w-4 h-4 text-verified" />
            <span>{t.proof1}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <IconGraduationCap className="w-4 h-4 text-primary" />
            <span>{t.proof2}</span>
          </span>
          <span className="flex items-center gap-1.5 font-bold text-ink">
            <span>{t.proof3}</span>
          </span>
        </div>
      </div>
    </main>
  );
}
