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
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-emerald-800 rounded-2xl p-6 sm:p-8 text-white mb-8 shadow-sm">
        <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold mb-3">
          🏛️ व्यवसाय शिक्षण व प्रशिक्षण संचालनालय (DVET) महाराष्ट्र
        </span>
        <h1 className="text-2xl sm:text-3xl font-black mb-2">
          {dict.upskilling.title}
        </h1>
        <p className="text-teal-100 text-sm max-w-2xl mb-4">
          {dict.upskilling.subtitle}
        </p>
        <a
          href="https://admission.dvet.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 bg-white text-teal-900 rounded-xl font-bold text-xs shadow hover:bg-teal-50 transition"
        >
          🌐 {dict.upskilling.official_portal} →
        </a>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 font-medium">
          {dict.common.loading}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Section: Accredited ITI Institutes */}
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
              <span>🏫</span> मान्यताप्राप्त शासकीय ITI संस्था (Nagpur Region)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {centers.map(center => (
                <div
                  key={center.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        ✓ {center.verifiedStatus === 'official_gov' ? 'शासकीय मान्यताप्राप्त' : 'Verified'}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        📍 {center.taluka || center.district}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {preferredLocale === 'mr' && center.nameMr ? center.nameMr : center.name}
                    </h3>
                    <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                      {center.address}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {center.supportedTradeIds.map(t => (
                        <span
                          key={t}
                          className="text-xs px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <a
                      href={center.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                    >
                      अधिकृत माहिती पहा →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Courses Mapped to Skills */}
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
              <span>📚</span> उपलब्ध व्यावसायिक अभ्यासक्रम (Courses)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 mb-2 inline-block">
                      {course.fees === 0 ? dict.upskilling.free_subsidized : `₹${course.fees}`}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                      {preferredLocale === 'mr' && course.titleMr ? course.titleMr : course.title}
                    </h4>
                    <p className="text-xs text-slate-500 mb-3">
                      कालावधी: <strong>{course.durationMonths} महिने</strong>
                    </p>
                  </div>

                  <a
                    href={course.officialEnrollUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center py-2 bg-slate-100 hover:bg-emerald-600 hover:text-white rounded-xl text-xs font-bold text-slate-700 transition"
                  >
                    प्रवेश प्रक्रिया पहा →
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
