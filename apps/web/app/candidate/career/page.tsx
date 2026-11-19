'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { getDictionary } from '@rojgarmitra/i18n';
import { CareerPlan } from '@rojgarmitra/shared';

export default function CandidateCareerPlanPage() {
  const { preferredLocale, getIdToken } = useAuth();
  const dict = getDictionary(preferredLocale);

  const [careerPlan, setCareerPlan] = useState<CareerPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlan() {
      setLoading(true);
      try {
        const token = (await getIdToken()) || 'demo_token_candidate_user_1';
        const res = await fetch('/api/v1/agents/career-plan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ locale: preferredLocale }),
        });
        const json = await res.json();
        if (json.data) {
          setCareerPlan(json.data);
        }
      } catch (err) {
        console.error('Failed to load career plan:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPlan();
  }, [preferredLocale]);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <span className="text-xs font-bold px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
          🚀 करिअर मार्गदर्शक (AI Grounded Roadmap)
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
          {dict.nav.career}
        </h1>
        <p className="text-slate-600 text-sm mt-1">
          तुमच्या कौशल्यांवर आधारित पुढील ३ वर्षांचे करिअर नियोजन व वाढीच्या संधी.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 font-medium">
          {dict.common.loading}
        </div>
      ) : !careerPlan ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
          <p className="text-slate-600 font-medium">{dict.common.not_found}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Target Role Card */}
          <div className="bg-gradient-to-r from-purple-700 to-indigo-800 rounded-2xl p-6 text-white shadow-sm">
            <span className="text-xs text-purple-200 font-bold uppercase tracking-wider block mb-1">
              लक्ष्य पद (Target Career Milestone)
            </span>
            <h2 className="text-2xl font-black mb-2">{careerPlan.targetRole}</h2>
            <p className="text-xs text-purple-100">
              सध्याचा व्यवसाय: <span className="font-bold underline">{careerPlan.currentTrade}</span>
            </p>
          </div>

          {/* Milestones Timeline */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              🎯 प्रगतीचे टप्पे (Actionable Milestones)
            </h3>

            {careerPlan.milestones.map((m, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition relative pl-8"
              >
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-emerald-500 rounded-l-2xl" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <h4 className="text-base font-bold text-slate-900">{m.title}</h4>
                  <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
                    ⏱️ अंदाजे {m.estimatedMonths} महिने
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-3">{m.description}</p>

                {m.suggestedCourses && m.suggestedCourses.length > 0 && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-100">
                    <span className="font-bold text-slate-900 block mb-1">
                      💡 शिफारस केलेले अभ्यासक्रम:
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                      {m.suggestedCourses.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Disclaimer Banner */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
            <strong>सूचना:</strong> {careerPlan.disclaimer}
          </div>
        </div>
      )}
    </main>
  );
}
