'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { getDictionary } from '@rojgarmitra/i18n';
import { TrainingCenter, VocationalCourse } from '@rojgarmitra/shared';

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
          <span>🏛️ व्यवसाय शिक्षण व प्रशिक्षण संचालनालय (DVET) महाराष्ट्र</span>
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
          className="settle-pill-btn px-6 py-2.5 text-xs inline-block"
        >
          🌐 {dict.upskilling.official_portal} ➔
        </a>
      </div>

      {loading ? (
        <div className="text-center py-16 text-ink-secondary font-bold text-base">
          ⌛ {dict.common.loading}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Section: Accredited ITI Institutes */}
          <div>
            <h2 className="text-xl font-black text-ink mb-4 flex items-center gap-2">
              <span>🏫</span> मान्यताप्राप्त शासकीय ITI संस्था (Nagpur Region)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {centers.map(center => (
                <div
                  key={center.id}
                  className="settle-card-interactive p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-verified-bg text-verified border border-verified">
                        ✓ {center.verifiedStatus === 'official_gov' ? 'शासकीय मान्यताप्राप्त' : 'Verified'}
                      </span>
                      <span className="text-xs font-bold text-ink-secondary">
                        📍 {center.taluka || center.district}
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
                      className="settle-pill-btn px-4 py-1.5 text-xs inline-block bg-ink hover:bg-ink/90"
                    >
                      अधिकृत माहिती पहा ➔
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Courses Mapped to Skills */}
          <div>
            <h2 className="text-xl font-black text-ink mb-4 flex items-center gap-2">
              <span>📚</span> उपलब्ध व्यावसायिक अभ्यासक्रम (Courses)
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
                    className="settle-pill-btn block text-center py-2 px-4 text-xs"
                  >
                    प्रवेश प्रक्रिया पहा ➔
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
