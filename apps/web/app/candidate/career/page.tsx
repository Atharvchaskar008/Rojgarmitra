'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { getDictionary } from '@rojgarmitra/i18n';
import { CareerPlan } from '@rojgarmitra/shared';
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
  IconCheck
} from '@/components/icons';

export default function CandidateCareerPlanPage() {
  const { preferredLocale, user, getIdToken } = useAuth();
  const dict = getDictionary(preferredLocale);

  const [careerPlan, setCareerPlan] = useState<CareerPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlan() {
      setLoading(true);
      try {
        const token = await getIdToken();
        if (!token) {
          setLoading(false);
          return;
        }
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
    <main className="max-w-4xl mx-auto py-4">
      {/* Header Banner - SETTLE Hero Card */}
      <div className="settle-card-hero p-6 sm:p-8 mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-steel-soft border border-steel rounded-full text-xs font-bold text-steel-deep mb-3 shadow-sm">
          <IconCompass className="w-3.5 h-3.5 text-primary" />
          <span>करिअर मार्गदर्शक (DVET & Industry Grounded Roadmap)</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-ink tracking-tight mt-1">
          {dict.nav.career}
        </h1>
        <p className="text-ink-secondary text-sm mt-1 font-medium">
          तुमच्या कौशल्यांवर आधारित पुढील ३ वर्षांचे करिअर नियोजन व वाढीच्या प्रत्यक्ष संधी.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-ink-secondary font-bold text-sm">
          {dict.common.loading}
        </div>
      ) : !user ? (
        <div className="text-center py-12 settle-card p-8">
          <div className="w-12 h-12 rounded-full bg-steel-soft border border-ink/20 flex items-center justify-center mx-auto mb-3">
            <IconUser className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-base font-black text-ink mb-1">
            {preferredLocale === 'mr' ? 'लॉगिन आवश्यक आहे' : 'Login Required'}
          </h3>
          <p className="text-sm text-ink-secondary mb-4 font-medium">
            {preferredLocale === 'mr'
              ? 'आपल्या कौशल्यांवर आधारित सानुकूल करिअर मार्गदर्शक पाहण्यासाठी कृपया लॉगिन करा.'
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
              : 'Please complete your skills profile first to generate a career roadmap.'}
          </p>
          <Link
            href="/candidate/onboarding"
            className="settle-pill-btn px-6 py-2.5 text-xs inline-flex items-center gap-1.5 font-bold"
          >
            <span>प्रोफाईल तयार करा</span>
            <IconArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Target Role Card - SETTLE Deep Ink Focus */}
          <div className="bg-ink text-white border-2 border-ink rounded-2xl p-6 shadow-solid">
            <span className="text-xs text-steel font-bold uppercase tracking-wider block mb-1">
              लक्ष्य पद (Target Career Milestone)
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight">{careerPlan.targetRole}</h2>
            <p className="text-xs text-steel-soft font-semibold">
              सध्याचा व्यवसाय: <span className="font-bold underline text-white">{careerPlan.currentTrade}</span>
            </p>
          </div>

          {/* Milestones Timeline */}
          <div className="space-y-4">
            <h3 className="text-xl font-black text-ink mb-2">
              प्रगतीचे टप्पे (Actionable Milestones)
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
                    <span>अंदाजे {m.estimatedMonths} महिने</span>
                  </span>
                </div>
                <p className="text-sm text-ink-secondary mb-4 font-medium leading-relaxed">{m.description}</p>

                {/* Suggested Government Courses */}
                {m.suggestedCourses && m.suggestedCourses.length > 0 && (
                  <div className="mt-3 p-3.5 bg-canvas rounded-xl text-xs text-ink border border-steel/50">
                    <span className="font-black text-ink block mb-1 inline-flex items-center gap-1.5">
                      <IconGraduationCap className="w-3.5 h-3.5 text-primary" />
                      <span>शिफारस केलेले शासकीय अभ्यासक्रम (DVET ITI):</span>
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
                        <span>मोफत व्हिडिओ ट्यूटोरियल्स (YouTube):</span>
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
                                  चॅनेल: {tut.publisherOrChannel}
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
                      <span>अधिकृत मोफत पुस्तके व अभ्यास साहित्य (Bharat Skills):</span>
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
                                  प्रकाशक: {b.publisherOrChannel} • मोफत PDF
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="settle-pill-chip text-[11px] px-2 py-0.5 group-hover:bg-ink group-hover:text-white transition">
                            PDF वाचा
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
                      <span>वर्कशॉप प्रत्यक्ष सराव (Shop-Floor Hands-on Practice):</span>
                    </span>
                    {m.practicalProjects.map((proj, pIdx) => (
                      <div key={pIdx} className="space-y-1.5 text-xs text-ink font-medium">
                        <p className="font-black text-sm text-ink">{proj.title}</p>
                        <p className="text-xs text-ink-secondary mb-2">{proj.description}</p>
                        <div className="bg-canvas p-3 rounded-lg border border-steel/60 space-y-1 text-[11px]">
                          <strong className="block text-ink font-bold mb-1">कृतीचे टप्पे:</strong>
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

          {/* Disclaimer Banner */}
          <div className="p-4 bg-surface rounded-xl border border-steel text-xs text-ink-secondary font-medium shadow-sm">
            <strong className="text-ink">सूचना:</strong> {careerPlan.disclaimer}
          </div>
        </div>
      )}
    </main>
  );
}
