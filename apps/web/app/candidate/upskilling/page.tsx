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
  IconBookOpen
} from '@/components/icons';

export default function CandidateUpskillingPage() {
  const { preferredLocale } = useAuth();
  const dict = getDictionary(preferredLocale);

  const [centers, setCenters] = useState<TrainingCenter[]>([]);
  const [courses, setCourses] = useState<VocationalCourse[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

  return (
    <main className="max-w-6xl mx-auto py-4">
      {/* Header Banner - SETTLE Hero Card */}
      <div className="settle-card-hero p-6 sm:p-8 mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-steel-soft border border-steel rounded-full text-xs font-bold text-steel-deep mb-3 shadow-sm">
          <IconGraduationCap className="w-3.5 h-3.5 text-primary" />
          <span>व्यवसाय शिक्षण व प्रशिक्षण संचालनालय (DVET) महाराष्ट्र</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-ink tracking-tight mb-2">
          {dict.upskilling.title}
        </h1>
        <p className="text-ink-secondary text-sm max-w-2xl mb-6 font-medium">
          {dict.upskilling.subtitle}
        </p>
        <a
          href="https://admission.dvet.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="settle-pill-btn px-6 py-2.5 text-xs inline-flex items-center gap-1.5"
        >
          <span>{dict.upskilling.official_portal}</span>
          <IconExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {loading ? (
        <div className="text-center py-16 text-ink-secondary font-bold text-sm">
          {dict.common.loading}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Section: Accredited ITI Institutes */}
          <div>
            <h2 className="text-xl font-black text-ink mb-4 flex items-center gap-2">
              <IconBuilding className="w-5 h-5 text-primary" />
              <span>मान्यताप्राप्त शासकीय ITI संस्था (Nagpur Region)</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {centers.map(center => (
                <div
                  key={center.id}
                  className="settle-card-interactive p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-verified-bg text-verified border border-verified inline-flex items-center gap-1">
                        <IconCheck className="w-3 h-3" />
                        <span>{center.verifiedStatus === 'official_gov' ? 'शासकीय मान्यताप्राप्त' : 'Verified'}</span>
                      </span>
                      <span className="text-xs font-bold text-ink-secondary inline-flex items-center gap-1">
                        <IconMapPin className="w-3 h-3 text-ink-muted" />
                        <span>{center.taluka || center.district}</span>
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-ink mb-2">
                      {preferredLocale === 'mr' && center.nameMr ? center.nameMr : center.name}
                    </h3>
                    <p className="text-xs text-ink-secondary mb-4 leading-relaxed font-medium">
                      {center.address}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {center.supportedTradeIds.map(t => (
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
                      className="settle-pill-btn px-4 py-1.5 text-xs inline-flex items-center gap-1 bg-ink hover:bg-ink/90"
                    >
                      <span>अधिकृत माहिती पहा</span>
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
              <span>उपलब्ध व्यावसायिक अभ्यासक्रम (Courses)</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => (
                <div
                  key={course.id}
                  className="settle-card-interactive p-5 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-steel-soft text-steel-deep border border-steel mb-3 inline-block">
                      {course.fees === 0 ? dict.upskilling.free_subsidized : `₹${course.fees}`}
                    </span>
                    <h4 className="text-base font-black text-ink mb-2 leading-snug">
                      {preferredLocale === 'mr' && course.titleMr ? course.titleMr : course.title}
                    </h4>
                    <p className="text-xs text-ink-secondary mb-4 font-medium">
                      कालावधी: <strong className="text-ink">{course.durationMonths} महिने</strong>
                    </p>
                  </div>

                  <a
                    href={course.officialEnrollUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="settle-pill-btn block text-center py-2 px-4 text-xs font-bold inline-flex items-center justify-center gap-1.5"
                  >
                    <span>प्रवेश प्रक्रिया पहा</span>
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
                  <span>मोफत स्वयं-अध्ययन संसाधने (Free Self-Learning)</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-ink">
                  घरी बसून मोफत शिका (YouTube & Bharat Skills)
                </h2>
                <p className="text-xs text-ink-secondary font-medium mt-1">
                  महाविद्यालय किंवा क्लास न लावता मोबाइलवरून थेट हिंदी आणि मराठी भाषेत कौशल्य वाढवा.
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
                    YouTube मोफत व्हिडिओ लेक्चर्स
                  </h3>
                  <p className="text-xs text-ink-secondary mb-4 font-medium">
                    इलेक्ट्रिशियन, वेल्डर, फिटर व सोलर पॅनल वायरिंगचे हिंदी-मराठी प्रॅक्टिकल व्हिडिओ.
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
                  YouTube वर व्हिडिओ पहा →
                </a>
              </div>

              {/* Free Books & PDFs */}
              <div className="settle-card p-6 flex flex-col justify-between bg-surface">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-steel-soft text-primary border border-steel flex items-center justify-center mb-3">
                    <IconBookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-base font-black text-ink mb-1">
                    NIMI अधिकृत पाठ्यपुस्तके (PDF)
                  </h3>
                  <p className="text-xs text-ink-secondary mb-4 font-medium">
                    केंद्र सरकारच्या कौशल्य विकास मंत्रालयाची मान्यताप्राप्त ट्रेड थिअरी व प्रॅक्टिकल पुस्तके.
                  </p>
                  <div className="space-y-1.5 text-xs font-bold text-ink-secondary mb-4">
                    <p>• १००% मोफत डाऊनलोड</p>
                    <p>• मराठी व हिंदी भाषा पर्याय</p>
                    <p>• अधिकृत अभ्यासक्रम आधारित</p>
                  </div>
                </div>
                <a
                  href="https://bharatskills.gov.in/Home/StudyMaterial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="settle-pill-chip text-xs px-3 py-2 text-center block font-black hover:bg-ink hover:text-white transition"
                >
                  मोफत PDF डाऊनलोड करा →
                </a>
              </div>

              {/* Mock Test & Practice */}
              <div className="settle-card p-6 flex flex-col justify-between bg-surface">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-verified-bg text-verified border border-verified flex items-center justify-center mb-3">
                    <IconCheck className="w-5 h-5 text-verified" />
                  </div>
                  <h3 className="text-base font-black text-ink mb-1">
                    मोफत मॉक टेस्ट व प्रश्नसंच
                  </h3>
                  <p className="text-xs text-ink-secondary mb-4 font-medium">
                    कारखान्यातील मुलाखत आणि अप्रेंटिसशिप परीक्षेच्या तयारीसाठी Bharat Skills मॉक टेस्ट.
                  </p>
                  <div className="space-y-1.5 text-xs font-bold text-ink-secondary mb-4">
                    <p>• Bharat Skills Mock Test</p>
                    <p>• Question Bank & Solution</p>
                    <p>• ट्रेडनिहाय सराव परीक्षा</p>
                  </div>
                </div>
                <a
                  href="https://bharatskills.gov.in/Home/QuestionBank"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="settle-pill-chip text-xs px-3 py-2 text-center block font-black hover:bg-ink hover:text-white transition"
                >
                  सराव प्रश्नसंच सोडवा →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
