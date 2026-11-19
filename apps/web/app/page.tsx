'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { getDictionary } from '@rojgarmitra/i18n';

export default function HomePage() {
  const { preferredLocale, user } = useAuth();
  const dict = getDictionary(preferredLocale);

  const heroTexts = {
    mr: {
      headline: 'स्थानिक कौशल्ये.',
      headlineAccent: 'थेट नोकऱ्या.',
      subline: 'विदर्भातील कुशल आयटीआय तंत्रज्ञ व स्थानिक कारखान्यांना थेट जोडणारे पारदर्शक व्यासपीठ.',
      badges: 'Zero Consultancy Fees · 100% Real Vacancies · No English Resume Required',
      searchLabel: 'शोध निवडा (Search Trades)',
      searchPlaceholder: 'उदा. MIG वेल्डर, वायरमन, फिटर (हिंगणा / बुटीबोरी)...',
      searchBtn: 'शोधा ➔',
      candidateTitle: 'मी नोकरी शोधत आहे',
      candidateSubtitle: 'Candidate / ITI Jobseeker',
      candidateF1: 'आवाज (Voice) वापरून २ मिनिटांत प्रोफाईल बनवा',
      candidateF2: 'नागपूर, बुटीबोरी व जवळच्या कारखान्यांतील थेट नोकऱ्या',
      candidateF3: 'शासकीय आयटीआय कोर्सेससह पुढील कौशल्य वाढवा',
      candidateBtn: 'नोकऱ्या पहा व अर्ज करा ➔',
      employerTitle: 'मला कुशल कामगार हवे आहेत',
      employerSubtitle: 'Plant Head / Workshop Owner',
      employerF1: 'स्थानिक आयटीआय कुशल तंत्रज्ञ थेट उपलब्ध',
      employerF2: 'विना-मध्यस्थ, शून्य कन्सल्टन्सी कमिशन',
      employerF3: '१ मिनिटात नवीन कामगार भरती जाहिरात द्या',
      employerBtn: 'उमेदवार शोधा व जागा टाका ➔',
      proof1: '100% सत्यता पडताळणी',
      proof2: 'डीव्हीईटी (DVET) अभ्यासक्रम मार्गदर्शन',
      proof3: 'मराठी • हिंदी • English',
    },
    hi: {
      headline: 'स्थानीय कौशल.',
      headlineAccent: 'सीधी नौकरियां.',
      subline: 'विदर्भ के कुशल आईटीआई तकनीशियनों और स्थानीय उद्योगों को जोड़ने वाला पारदर्शी मंच।',
      badges: 'Zero Consultancy Fees · 100% Real Vacancies · No English Resume Required',
      searchLabel: 'ट्रेड या कार्य खोजें (Search Trades)',
      searchPlaceholder: 'उदा. MIG वेल्डर, वायरमैन, फिटर (हिंगणा / बुटीबोरी)...',
      searchBtn: 'खोजें ➔',
      candidateTitle: 'मैं नौकरी ढूंढ रहा हूँ',
      candidateSubtitle: 'Candidate / ITI Jobseeker',
      candidateF1: 'आवाज (Voice) से २ मिनट में आसान प्रोफाइल बनाएं',
      candidateF2: 'नागपुर, बुटीबोरी और स्थानीय कारखानों में सीधी भर्तियां',
      candidateF3: 'सरकारी ITI कोर्सेस के साथ अपना हुनर बढ़ाएं',
      candidateBtn: 'नौकरियां देखें और आवेदन करें ➔',
      employerTitle: 'मुझे कुशल कामगार चाहिए',
      employerSubtitle: 'Plant Head / Workshop Owner',
      employerF1: 'स्थानीय आईटीआई कुशल कारीगर सीधे उपलब्ध',
      employerF2: 'बिना किसी बिचौलिए या कंसल्टेंसी कमीशन के',
      employerF3: '१ मिनट में नई भर्ती विज्ञापन पोस्ट करें',
      employerBtn: 'उम्मीदवार खोजें और भर्ती पोस्ट करें ➔',
      proof1: '100% वास्तविक सत्यापन',
      proof2: 'DVET सरकारी पाठ्यक्रम मार्गदर्शन',
      proof3: 'मराठी • हिंदी • English',
    },
    en: {
      headline: 'Local Skills.',
      headlineAccent: 'Direct Opportunities.',
      subline: 'A transparent platform connecting certified ITI technicians with verified industrial plants across Vidarbha.',
      badges: 'Zero Consultancy Fees · 100% Real Vacancies · No English Resume Required',
      searchLabel: 'Search Trades & Locations',
      searchPlaceholder: 'e.g. MIG Welder, Wireman, Fitter (Hingna / Butibori)...',
      searchBtn: 'Search ➔',
      candidateTitle: 'I am looking for a job',
      candidateSubtitle: 'Candidate / ITI Jobseeker',
      candidateF1: 'Create your verified profile in 2 mins using voice',
      candidateF2: 'Direct vacancies in Nagpur & Butibori industrial plants',
      candidateF3: 'Upgrade skills with certified government ITI courses',
      candidateBtn: 'Explore Jobs & Apply ➔',
      employerTitle: 'I need skilled workforce',
      employerSubtitle: 'Plant Head / Workshop Owner',
      employerF1: 'Direct access to certified ITI technicians & apprentices',
      employerF2: 'Zero third-party commissions or agency fees',
      employerF3: 'Post job vacancies in under 1 minute',
      employerBtn: 'Find Candidates & Post Jobs ➔',
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
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-steel-soft border border-steel text-steel-deep text-xs font-bold shadow-sm">
          <span>🌾 YCCE HACKKUMBH 2026</span>
          <span className="text-steel">•</span>
          <span>{dict.app.pilot_region}</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-ink tracking-tight">
            {t.headline} <span className="text-primary underline decoration-steel underline-offset-8">{t.headlineAccent}</span>
          </h1>
          <p className="text-lg md:text-xl text-ink-secondary max-w-2xl mx-auto font-medium leading-relaxed">
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
              className="settle-pill-btn px-6 py-2.5 text-sm font-bold shadow-solid"
            >
              🚀 {dict.nav.register} (Get Started)
            </Link>
            <Link
              href="/login"
              className="settle-pill-btn bg-white text-ink border-ink hover:bg-steel-soft px-6 py-2.5 text-sm font-bold shadow-solid-sm"
            >
              🔑 {dict.nav.login}
            </Link>
          </div>
        )}

        {/* SETTLE-Style Floating Search Box */}
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
              className="settle-pill-btn px-6 py-2.5 text-sm w-full sm:w-auto text-center"
            >
              {t.searchBtn}
            </Link>
          </div>

          {/* Quick Filter Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
            <Link href="/candidate?area=Hingna" className="settle-pill-chip px-3.5 py-1 text-xs">
              हिंगणा MIDC
            </Link>
            <Link href="/candidate?area=Butibori" className="settle-pill-chip px-3.5 py-1 text-xs">
              बुटीबोरी MIDC
            </Link>
            <Link href="/candidate?trade=welder" className="settle-pill-chip px-3.5 py-1 text-xs">
              वेल्डर (Welder)
            </Link>
            <Link href="/candidate?trade=electrician" className="settle-pill-chip px-3.5 py-1 text-xs">
              वायरमन (Electrician)
            </Link>
            <Link href="/candidate?trade=fitter" className="settle-pill-chip px-3.5 py-1 text-xs">
              फिटर (Fitter)
            </Link>
          </div>
        </div>

        {/* Two Pathway Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 text-left">
          {/* Candidate Card */}
          <div className="settle-card-interactive p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-full bg-steel-soft flex items-center justify-center text-2xl border border-ink/20 mb-4">
                👷‍♂️
              </div>
              <h2 className="text-2xl font-black text-ink mb-1">
                {t.candidateTitle}
              </h2>
              <p className="text-xs font-bold text-ink-secondary mb-4 uppercase tracking-wider">
                {t.candidateSubtitle}
              </p>
              <ul className="space-y-2 text-sm text-ink-secondary mb-6 font-medium">
                <li className="flex items-center gap-2">
                  <span className="text-verified font-bold">✓</span> {t.candidateF1}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-verified font-bold">✓</span> {t.candidateF2}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-verified font-bold">✓</span> {t.candidateF3}
                </li>
              </ul>
            </div>
            <Link
              href="/candidate"
              className="settle-pill-btn py-3 px-6 text-sm text-center block w-full"
            >
              {t.candidateBtn}
            </Link>
          </div>

          {/* Employer Card */}
          <div className="settle-card-interactive p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-full bg-steel-soft flex items-center justify-center text-2xl border border-ink/20 mb-4">
                🏭
              </div>
              <h2 className="text-2xl font-black text-ink mb-1">
                {t.employerTitle}
              </h2>
              <p className="text-xs font-bold text-ink-secondary mb-4 uppercase tracking-wider">
                {t.employerSubtitle}
              </p>
              <ul className="space-y-2 text-sm text-ink-secondary mb-6 font-medium">
                <li className="flex items-center gap-2">
                  <span className="text-primary font-bold">✓</span> {t.employerF1}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary font-bold">✓</span> {t.employerF2}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary font-bold">✓</span> {t.employerF3}
                </li>
              </ul>
            </div>
            <Link
              href="/employer"
              className="settle-pill-btn bg-ink hover:bg-ink/90 py-3 px-6 text-sm text-center block w-full"
            >
              {t.employerBtn}
            </Link>
          </div>
        </div>

        {/* Bottom Proof Strip */}
        <div className="pt-6 border-t border-steel/40 flex flex-wrap items-center justify-center gap-6 text-xs text-ink-secondary font-medium">
          <span className="flex items-center gap-1.5">
            <span className="text-verified font-bold">●</span> {t.proof1}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-primary font-bold">●</span> {t.proof2}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-ink font-bold">●</span> {t.proof3}
          </span>
        </div>
      </div>
    </main>
  );
}
