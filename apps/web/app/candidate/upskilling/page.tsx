'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { getDictionary } from '@rojgarmitra/i18n';
import { TrainingCenter, VocationalCourse } from '@rojgarmitra/shared';
import {
  IconGraduationCap,
  IconBuilding,
  IconMapPin,
  IconCheck,
  IconExternalLink,
  IconArrowRight,
  IconVideo,
  IconBookOpen,
  IconWrench,
  IconBriefcase
} from '@/components/icons';

export default function CandidateUpskillingPage() {
  const { preferredLocale } = useAuth();
  const dict = getDictionary(preferredLocale);

  const [centers, setCenters] = useState<TrainingCenter[]>([]);
  const [courses, setCourses] = useState<VocationalCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'iti' | 'apprenticeship' | 'msme' | 'polytechnic'>('all');

  useEffect(() => {
    async function loadDirectory() {
      setLoading(true);
      try {
        const [cRes, crsRes] = await Promise.all([
          fetch('/api/v1/training-centers'),
          fetch('/api/v1/courses'),
        ]);
        const cJson = await cRes.json();
        const crsJson = await crsRes.json();

        if (cJson.data) setCenters(cJson.data);
        if (crsJson.data) setCourses(crsJson.data);
      } catch (err) {
        console.error('Failed to load training directory:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDirectory();
  }, [preferredLocale]);

  const getCenterName = (center: TrainingCenter) => {
    if (preferredLocale === 'mr' && center.nameMr) return center.nameMr;
    if (preferredLocale === 'hi' && center.nameHi) return center.nameHi;
    return center.name;
  };

  const getCourseTitle = (course: VocationalCourse) => {
    if (preferredLocale === 'mr' && course.titleMr) return course.titleMr;
    if (preferredLocale === 'hi' && course.titleHi) return course.titleHi;
    return course.title;
  };

  const filteredCenters = centers.filter((c) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'iti') return c.id.includes('iti');
    if (activeFilter === 'apprenticeship') return c.id.includes('apprenticeship');
    if (activeFilter === 'msme') return c.id.includes('msme');
    if (activeFilter === 'polytechnic') return c.id.includes('polytechnic') || c.id.includes('pmkvy');
    return true;
  });

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 w-full">
      {/* Header Banner */}
      <div className="settle-card-hero p-6 sm:p-8 mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-steel-soft border border-steel rounded-full text-xs font-bold text-steel-deep mb-3 shadow-sm">
          <IconGraduationCap className="w-3.5 h-3.5 text-primary" />
          <span>
            {preferredLocale === 'mr'
              ? 'कौशल्य विकास, शिकाऊ उमेदवार योजना (Apprenticeship) व शासकीय तंत्रशिक्षण'
              : preferredLocale === 'hi'
              ? 'कौशल विकास, शिक्षुता (Apprenticeship) एवं सरकारी तकनीकी संस्थान'
              : 'Vocational Upskilling, Apprenticeships & Technical Training Directory'}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-ink tracking-tight mb-2">
          {dict.upskilling.title}
        </h1>
        <p className="text-ink-secondary text-sm max-w-3xl mb-6 font-medium">
          {preferredLocale === 'mr'
            ? 'केवळ ITI पुरते मर्यादित न राहता, MIDC प्रत्यक्ष कारखाना अप्रेंटिसशिप (दरमहा स्टायपेंड), MSME इंडो-जर्मन टूल रूम, तंत्रनिकेतन व डिजिटल स्वयं-अध्ययनाच्या संपूर्ण संधी.'
            : preferredLocale === 'hi'
            ? 'केवल ITI तक सीमित न रहकर, MIDC ऑन-द-जॉब अप्रेंटिसशिप (मासिक वजीफा), MSME इंडो-जर्मन टूल रूम, पॉलिटेक्निक और डिजिटल स्वयं-अध्ययन के संपूर्ण अवसर।'
            : 'Beyond just ITIs: Explore on-the-job MIDC factory apprenticeships with monthly stipends, MSME Indo-German Tool Room advanced CNC training, government polytechnics, and free digital manuals.'}
        </p>
        <div className="flex flex-wrap gap-2.5">
          <a
            href="https://admission.dvet.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="settle-pill-btn px-5 py-2 text-xs inline-flex items-center gap-1.5 font-bold"
          >
            <span>{dict.upskilling.official_portal}</span>
            <IconExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://www.apprenticeshipindia.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="settle-pill-chip px-5 py-2 text-xs inline-flex items-center gap-1.5 font-bold hover:bg-ink hover:text-white transition"
          >
            <IconBriefcase className="w-3.5 h-3.5 text-primary" />
            <span>
              {preferredLocale === 'mr'
                ? 'राष्ट्रीय अप्रेंटिसशिप पोर्टल (Apprenticeship India)'
                : preferredLocale === 'hi'
                ? 'राष्ट्रीय शिक्षुता पोर्टल (Apprenticeship India)'
                : 'National Apprenticeship Portal'}
            </span>
            <IconExternalLink className="w-3 h-3 text-ink-muted" />
          </a>
        </div>
      </div>

      {/* Filter Tabs for Training Pathways */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 text-xs sm:text-sm">
        <span className="font-bold text-ink whitespace-nowrap mr-2 uppercase tracking-wider text-xs">
          {preferredLocale === 'mr' ? 'मार्ग निवडा:' : preferredLocale === 'hi' ? 'मार्ग चुनें:' : 'Pathways:'}
        </span>
        {[
          { id: 'all', labelMr: 'सर्व मार्ग (All)', labelHi: 'सभी मार्ग (All)', labelEn: 'All Pathways' },
          { id: 'apprenticeship', labelMr: '⚙️ कारखाना अप्रेंटिसशिप (Stipend)', labelHi: '⚙️ फैक्ट्री अप्रेंटिसशिप (Stipend)', labelEn: '⚙️ MIDC Apprenticeships' },
          { id: 'msme', labelMr: '🛠️ MSME टूल रूम (CNC/CAD)', labelHi: '🛠️ MSME टूल रूम (CNC/CAD)', labelEn: '🛠️ MSME Tool Room' },
          { id: 'iti', labelMr: '🏢 शासकीय ITI (DVET)', labelHi: '🏢 सरकारी ITI (DVET)', labelEn: '🏢 Government ITIs' },
          { id: 'polytechnic', labelMr: '🎓 तंत्रनिकेतन व PMKVY', labelHi: '🎓 पॉलिटेक्निक व PMKVY', labelEn: '🎓 Polytechnic & PMKVY' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition text-xs ${
              activeFilter === tab.id ? 'settle-pill-chip-active' : 'settle-pill-chip'
            }`}
          >
            {preferredLocale === 'mr' ? tab.labelMr : preferredLocale === 'hi' ? tab.labelHi : tab.labelEn}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-ink-secondary font-bold text-sm">
          ⌛ {dict.common.loading}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Section: Training Centers & Industrial Apprenticeship Hubs */}
          <div>
            <h2 className="text-xl font-black text-ink mb-4 flex items-center gap-2">
              <IconBuilding className="w-5 h-5 text-primary" />
              <span>
                {preferredLocale === 'mr'
                  ? 'मान्यताप्राप्त संस्था व औद्योगिक प्रशिक्षण क्लस्टर्स'
                  : preferredLocale === 'hi'
                  ? 'मान्यताप्राप्त संस्थान एवं औद्योगिक प्रशिक्षण क्लस्टर'
                  : 'Accredited Institutes & Industrial Training Clusters (Vidarbha)'}
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCenters.map((center) => (
                <div
                  key={center.id}
                  className="settle-card-interactive p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-verified-bg text-verified border border-verified inline-flex items-center gap-1">
                        <IconCheck className="w-3 h-3" />
                        <span>
                          {center.id.includes('apprenticeship')
                            ? preferredLocale === 'mr'
                              ? 'स्टायपेंड सहित अप्रेंटिसशिप'
                              : preferredLocale === 'hi'
                              ? 'स्टाइपेंड सहित शिक्षुता'
                              : 'Stipend Apprenticeship'
                            : center.id.includes('msme')
                            ? (preferredLocale === 'mr' ? 'MSME भारत सरकार' : preferredLocale === 'hi' ? 'MSME भारत सरकार' : 'MSME Govt of India')
                            : center.verifiedStatus === 'official_gov'
                            ? preferredLocale === 'mr'
                              ? 'शासकीय मान्यताप्राप्त'
                              : preferredLocale === 'hi'
                              ? 'सरकारी मान्यताप्राप्त'
                              : 'Official Gov'
                            : 'Verified'}
                        </span>
                      </span>
                      <span className="text-xs font-bold text-ink-secondary inline-flex items-center gap-1">
                        <IconMapPin className="w-3 h-3 text-ink-muted" />
                        <span>{center.taluka || center.district}</span>
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-ink mb-2">
                      {getCenterName(center)}
                    </h3>
                    <p className="text-xs text-ink-secondary mb-4 leading-relaxed font-medium">
                      {center.address}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {center.supportedTradeIds.map((t) => (
                        <span
                          key={t}
                          className="text-xs px-2.5 py-1 bg-steel-soft text-steel-deep rounded-full font-semibold"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-steel/40 flex items-center justify-between">
                    <a
                      href={center.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="settle-pill-btn px-4 py-1.5 text-xs inline-flex items-center gap-1 bg-ink hover:bg-ink/90 font-bold"
                    >
                      <span>
                        {preferredLocale === 'mr'
                          ? 'अधिकृत तपशील पहा'
                          : preferredLocale === 'hi'
                          ? 'आधिकारिक विवरण देखें'
                          : 'View Official Details'}
                      </span>
                      <IconExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Courses Mapped to Skills */}
          <div>
            <h2 className="text-xl font-black text-ink mb-4 flex items-center gap-2">
              <IconGraduationCap className="w-5 h-5 text-primary" />
              <span>
                {preferredLocale === 'mr'
                  ? 'उपलब्ध व्यावसायिक अभ्यासक्रम व अप्रेंटिसशिप संधी'
                  : preferredLocale === 'hi'
                  ? 'उपलब्ध व्यावसायिक पाठ्यक्रम एवं अप्रेंटिसशिप अवसर'
                  : 'Available Vocational Courses & Apprenticeships'}
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="settle-card-interactive p-5 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-steel-soft text-steel-deep border border-steel mb-3 inline-block">
                      {course.fees === 0
                        ? dict.upskilling.free_subsidized
                        : `₹${course.fees}`}
                    </span>
                    <h4 className="text-base font-black text-ink mb-2 leading-snug">
                      {getCourseTitle(course)}
                    </h4>
                    <p className="text-xs text-ink-secondary mb-4 font-medium">
                      {preferredLocale === 'mr' ? 'कालावधी:' : preferredLocale === 'hi' ? 'अवधि:' : 'Duration:'}{' '}
                      <strong className="text-ink">
                        {course.durationMonths}{' '}
                        {preferredLocale === 'mr' ? 'महिने' : preferredLocale === 'hi' ? 'माह' : 'Months'}
                      </strong>
                    </p>
                  </div>

                  <a
                    href={course.officialEnrollUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="settle-pill-btn block text-center py-2 px-4 text-xs font-bold inline-flex items-center justify-center gap-1.5"
                  >
                    <span>
                      {preferredLocale === 'mr'
                        ? 'प्रवेश / नोंदणी प्रक्रिया पहा'
                        : preferredLocale === 'hi'
                        ? 'प्रवेश प्रक्रिया देखें'
                        : 'View Admission / Apply'}
                    </span>
                    <IconArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Free Self-Study Library (YouTube + Bharat Skills NIMI) */}
          <div className="settle-card-hero p-6 sm:p-8 mt-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-alert-bg border border-alert rounded-full text-xs font-bold text-alert mb-2">
                  <IconVideo className="w-3.5 h-3.5 text-alert" />
                  <span>
                    {preferredLocale === 'mr'
                      ? 'मोफत स्वयं-अध्ययन संसाधने (Free Self-Learning)'
                      : preferredLocale === 'hi'
                      ? 'नि:शुल्क स्वयं-अध्ययन संसाधन (Free Self-Learning)'
                      : 'Free Self-Learning Digital Resources'}
                  </span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-ink">
                  {preferredLocale === 'mr'
                    ? 'घरी बसून मोफत शिका (YouTube & Bharat Skills NIMI)'
                    : preferredLocale === 'hi'
                    ? 'घर बैठे नि:शुल्क सीखें (YouTube & Bharat Skills NIMI)'
                    : 'Learn Free at Your Own Pace (YouTube & Bharat Skills)'}
                </h2>
                <p className="text-xs text-ink-secondary font-medium mt-1">
                  {preferredLocale === 'mr'
                    ? 'मोठमोठ्या फीस न भरता थेट मोबाइलवरून मराठी व हिंदी भाषेत कौशल्य वाढवा.'
                    : preferredLocale === 'hi'
                    ? 'बिना भारी फीस भरे मोबाइल से सीधे हिंदी व मराठी में हुनर बढ़ाएं।'
                    : 'Level up hands-on shop floor skills in Marathi and Hindi with verified zero-cost practical videos and books.'}
                </p>
              </div>
              <a
                href="https://bharatskills.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="settle-pill-btn px-5 py-2 text-xs font-bold inline-flex items-center gap-1.5 shrink-0"
              >
                <span>Bharat Skills अधिकृत पोर्टल</span>
                <IconExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* YouTube Playlists Card */}
              <div className="settle-card p-6 flex flex-col justify-between bg-surface">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-alert-bg text-alert border border-alert flex items-center justify-center mb-3">
                    <IconVideo className="w-5 h-5 text-alert" />
                  </div>
                  <h3 className="text-base font-black text-ink mb-1">
                    {preferredLocale === 'mr'
                      ? 'YouTube मोफत व्हिडिओ लेक्चर्स'
                      : preferredLocale === 'hi'
                      ? 'YouTube नि:शुल्क वीडियो लेक्चर्स'
                      : 'YouTube Free Practical Tutorials'}
                  </h3>
                  <p className="text-xs text-ink-secondary mb-4 font-medium">
                    {preferredLocale === 'mr'
                      ? 'इलेक्ट्रिशियन, वेल्डर, फिटर व सोलर वायरिंगचे हिंदी-मराठी प्रॅक्टिकल व्हिडिओ.'
                      : preferredLocale === 'hi'
                      ? 'इलेक्ट्रीशियन, वेल्डर, फिटर व सोलर वायरिंग के हिंदी-मराठी प्रैक्टिकल वीडियो।'
                      : 'Hands-on practical tutorials for Electrician, Welder, CNC & Solar PV installation in Marathi & Hindi.'}
                  </p>
                  <div className="space-y-1.5 text-xs font-bold text-ink-secondary mb-4">
                    <p>• Global ITI प्रात्यक्षिके</p>
                    <p>• Electrical Dost वायरिंग क्लासेस</p>
                    <p>• Make It Easy ITI सोल्युशन्स</p>
                  </div>
                </div>
                <a
                  href="https://www.youtube.com/results?search_query=ITI+practical+tutorial+hindi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="settle-pill-chip text-xs px-3 py-2 text-center block font-black hover:bg-ink hover:text-white transition"
                >
                  {preferredLocale === 'mr'
                    ? 'YouTube वर व्हिडिओ पहा →'
                    : preferredLocale === 'hi'
                    ? 'YouTube पर वीडियो देखें →'
                    : 'Watch on YouTube →'}
                </a>
              </div>

              {/* Free Books & PDFs */}
              <div className="settle-card p-6 flex flex-col justify-between bg-surface">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-steel-soft text-primary border border-steel flex items-center justify-center mb-3">
                    <IconBookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-base font-black text-ink mb-1">
                    {preferredLocale === 'mr'
                      ? 'NIMI अधिकृत पाठ्यपुस्तके (PDF)'
                      : preferredLocale === 'hi'
                      ? 'NIMI आधिकारिक पाठ्यपुस्तकें (PDF)'
                      : 'NIMI Official Textbooks (PDF)'}
                  </h3>
                  <p className="text-xs text-ink-secondary mb-4 font-medium">
                    {preferredLocale === 'mr'
                      ? 'केंद्र सरकारच्या कौशल्य विकास मंत्रालयाची अधिकृत थिअरी व प्रॅक्टिकल पुस्तके.'
                      : preferredLocale === 'hi'
                      ? 'कौशल विकास मंत्रालय की आधिकारिक ट्रेड थ्योरी व प्रैक्टिकल पुस्तकें।'
                      : 'Official Ministry of Skill Development curriculum trade theory & practical manuals.'}
                  </p>
                  <div className="space-y-1.5 text-xs font-bold text-ink-secondary mb-4">
                    <p>• {preferredLocale === 'mr' ? '१००% मोफत डाऊनलोड' : preferredLocale === 'hi' ? '१००% नि:शुल्क डाउनलोड' : '100% Free Download'}</p>
                    <p>• {preferredLocale === 'mr' ? 'मराठी व हिंदी भाषा पर्याय' : preferredLocale === 'hi' ? 'मराठी व हिंदी भाषा विकल्प' : 'Marathi & Hindi Editions'}</p>
                    <p>• {preferredLocale === 'mr' ? 'अधिकृत अभ्यासक्रम आधारित' : preferredLocale === 'hi' ? 'आधिकारिक पाठ्यक्रम आधारित' : 'CTS/DGT Aligned'}</p>
                  </div>
                </div>
                <a
                  href="https://bharatskills.gov.in/Home/StudyMaterial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="settle-pill-chip text-xs px-3 py-2 text-center block font-black hover:bg-ink hover:text-white transition"
                >
                  {preferredLocale === 'mr'
                    ? 'मोफत पुस्तके डाऊनलोड करा →'
                    : preferredLocale === 'hi'
                    ? 'नि:शुल्क पुस्तकें डाउनलोड करें →'
                    : 'Download Free Manuals →'}
                </a>
              </div>

              {/* Apprenticeship Info Card */}
              <div className="settle-card p-6 flex flex-col justify-between bg-surface">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-verified-bg text-verified border border-verified flex items-center justify-center mb-3">
                    <IconBriefcase className="w-5 h-5 text-verified" />
                  </div>
                  <h3 className="text-base font-black text-ink mb-1">
                    {preferredLocale === 'mr'
                      ? 'MIDC थेट अप्रेंटिसशिप नोंदणी'
                      : preferredLocale === 'hi'
                      ? 'MIDC सीधी अप्रेंटिसशिप पंजीकरण'
                      : 'MIDC Factory Apprenticeship'}
                  </h3>
                  <p className="text-xs text-ink-secondary mb-4 font-medium">
                    {preferredLocale === 'mr'
                      ? 'कारखान्यात काम शिकताना दरमहा ₹८,५०० ते ₹१२,००० शासकीय स्टायपेंड मिळवा.'
                      : preferredLocale === 'hi'
                      ? 'फैक्ट्री में काम सीखने के साथ हर महीने ₹८,५०० से ₹१२,००० का वजीफा पाएं।'
                      : 'Earn while you learn: ₹8,500 - ₹12,000 monthly government stipend directly in bank account.'}
                  </p>
                  <div className="space-y-1.5 text-xs font-bold text-ink-secondary mb-4">
                    <p>• बुटीबोरी व हिंगणा MIDC</p>
                    <p>• नॅशनल अप्रेंटिसशिप सर्टिफिकेट</p>
                    <p>• थेट कारखान्यात कायम नोकरीची संधी</p>
                  </div>
                </div>
                <a
                  href="https://www.apprenticeshipindia.gov.in/candidate-registration"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="settle-pill-chip text-xs px-3 py-2 text-center block font-black hover:bg-ink hover:text-white transition"
                >
                  {preferredLocale === 'mr'
                    ? 'अप्रेंटिसशिप नोंदणी करा →'
                    : preferredLocale === 'hi'
                    ? 'शिक्षुता पंजीकरण करें →'
                    : 'Register on Portal →'}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
