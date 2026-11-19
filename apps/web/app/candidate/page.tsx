'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { getDictionary } from '@rojgarmitra/i18n';
import { JobPosting, MatchExplanation, getSkillName } from '@rojgarmitra/shared';

export default function CandidateJobsFeedPage() {
  const { preferredLocale, user, getIdToken } = useAuth();
  const dict = getDictionary(preferredLocale);

  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [recommendations, setRecommendations] = useState<Record<string, MatchExplanation>>({});
  const [selectedTaluka, setSelectedTaluka] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Fetch open jobs feed
        const res = await fetch('/api/v1/jobs');
        const json = await res.json();
        if (json.data) {
          setJobs(json.data);
        }

        // If user is authenticated, try fetching personalized recommendations
        const token = await getIdToken();
        if (token) {
          const recRes = await fetch('/api/v1/jobs/recommendations', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const recJson = await recRes.json();
          if (recJson.data) {
            const map: Record<string, MatchExplanation> = {};
            recJson.data.forEach((item: { job: JobPosting; match: MatchExplanation }) => {
              map[item.job.id] = item.match;
            });
            setRecommendations(map);
          }

          // Fetch already applied jobs
          const appRes = await fetch('/api/v1/candidate/applications', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const appJson = await appRes.json();
          if (appJson.data) {
            const set = new Set<string>(appJson.data.map((a: any) => a.jobId));
            setAppliedJobs(set);
          }
        }
      } catch (err) {
        console.error('Error loading jobs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleApply = async (jobId: string) => {
    setApplyingId(jobId);
    setMessage(null);
    try {
      const token = await getIdToken();
      if (!token) {
        setMessage({
          text: preferredLocale === 'mr' ? 'कृपया अर्ज करण्यासाठी प्रथम लॉगिन करा.' : 'Please sign in to submit your application.',
          type: 'error',
        });
        setApplyingId(null);
        return;
      }
      const res = await fetch(`/api/v1/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setAppliedJobs(prev => new Set(prev).add(jobId));
        setMessage({
          text: preferredLocale === 'mr' ? 'आपला अर्ज यशस्वीरित्या पाठवला आहे!' : 'Application submitted successfully!',
          type: 'success',
        });
      } else {
        setMessage({
          text: data.error?.message || dict.common.error,
          type: 'error',
        });
      }
    } catch {
      setMessage({ text: dict.common.error, type: 'error' });
    } finally {
      setApplyingId(null);
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (selectedTaluka === 'all') return true;
    return job.taluka?.toLowerCase().includes(selectedTaluka.toLowerCase());
  });

  return (
    <main className="max-w-7xl mx-auto py-4">
      {/* Header Banner - SETTLE Hero Card */}
      <div className="settle-card-hero p-6 sm:p-8 mb-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-steel-soft border border-steel rounded-full text-xs font-bold text-steel-deep mb-3 shadow-sm">
            <span>📍 {dict.app.pilot_region}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-ink tracking-tight mb-2">
            {dict.nav.jobs} <span className="text-ink-secondary text-xl font-bold font-sans">(Opportunities)</span>
          </h1>
          <p className="text-ink-secondary text-sm sm:text-base mb-6 font-medium">
            {dict.app.tagline}
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              href="/candidate/onboarding"
              className="settle-pill-btn px-4 py-2 text-xs"
            >
              🎙️ आवाज प्रोफाईल अपडेट करा ➔
            </Link>
            <Link
              href="/candidate/upskilling"
              className="settle-pill-chip px-4 py-2 text-xs font-bold"
            >
              🎓 {dict.nav.upskilling}
            </Link>
            <Link
              href="/candidate/career"
              className="settle-pill-chip px-4 py-2 text-xs font-bold"
            >
              🚀 {dict.nav.career}
            </Link>
          </div>
        </div>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`p-4 rounded-xl mb-6 text-sm font-bold border-2 flex items-center justify-between gap-3 ${
            message.type === 'success'
              ? 'bg-verified-bg text-verified border-verified'
              : 'bg-alert-bg text-alert border-alert'
          }`}
        >
          <span>{message.text}</span>
          {!user && (
            <Link
              href="/login"
              className="settle-pill-btn text-xs px-4 py-1.5 whitespace-nowrap"
            >
              {dict.nav.login} ➔
            </Link>
          )}
        </div>
      )}

      {/* Filter Tabs - SETTLE Pill Group */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 text-xs sm:text-sm">
        <span className="font-bold text-ink whitespace-nowrap mr-2 uppercase tracking-wider text-xs">
          परिसर / Area:
        </span>
        {['all', 'Butibori', 'Hingna', 'Umred'].map(taluka => (
          <button
            key={taluka}
            onClick={() => setSelectedTaluka(taluka)}
            className={`px-4 py-1.5 rounded-full font-bold whitespace-nowrap transition ${
              selectedTaluka === taluka
                ? 'settle-pill-chip-active text-xs'
                : 'settle-pill-chip text-xs'
            }`}
          >
            {taluka === 'all' ? 'सर्व परिसर (All Areas)' : taluka}
          </button>
        ))}
      </div>

      {/* Job Cards Grid */}
      {loading ? (
        <div className="text-center py-16 text-ink-secondary font-bold text-base">
          ⌛ {dict.common.loading}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-12 settle-card p-8">
          <span className="text-4xl mb-2 inline-block">🔍</span>
          <p className="text-ink font-bold">{dict.common.not_found}</p>
          <p className="text-xs text-ink-secondary mt-1">निवडलेल्या परिसरात सध्या कोणतीही रिक्त जागा उपलब्ध नाही.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map(job => {
            const match = recommendations[job.id];
            const isApplied = appliedJobs.has(job.id);
            const isExternal = job.sourceType === 'external_public';

            return (
              <div
                key={job.id}
                className={isExternal ? 'settle-card p-6 flex flex-col justify-between' : 'settle-card-interactive p-6 flex flex-col justify-between'}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-steel-soft text-steel-deep border border-steel/60">
                      📍 {job.taluka || job.district}
                    </span>

                    {/* Source Attribution Badge */}
                    {job.sourceType === 'internal_employer' ? (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-verified-bg text-verified border border-verified">
                        ✓ {dict.job.source_verified}
                      </span>
                    ) : job.sourceType === 'external_public' ? (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-steel-soft text-primary border border-steel">
                        🌐 {job.sourceDomain || 'Public Lead'}
                      </span>
                    ) : (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-alert-bg text-alert border border-alert">
                        ℹ️ {dict.common.demo_badge}
                      </span>
                    )}
                  </div>

                  {/* Job Title & Employer */}
                  <h3 className="text-lg font-black text-ink leading-snug mb-1">
                    {job.title}
                  </h3>
                  <p className="text-xs text-ink-secondary font-bold mb-4 uppercase tracking-wider">
                    🏢 {job.employerName}
                  </p>

                  {/* Compatibility Match Score Badge (if computed) */}
                  {match && (
                    <div className="mb-4 p-3 bg-surface-subtle border border-steel/80 rounded-xl">
                      <div className="flex items-center justify-between text-xs font-black text-primary mb-1.5">
                        <span>{dict.match.match_score}</span>
                        <span>{match.matchScore}%</span>
                      </div>
                      <div className="w-full bg-steel/40 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${match.matchScore}%` }}
                        />
                      </div>
                      {match.missingSkills.length > 0 && (
                        <p className="text-xs text-ink-secondary font-medium mt-2">
                          {dict.match.missing_skills}:{' '}
                          {match.missingSkills.map(s => getSkillName(s, preferredLocale)).join(', ')}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Salary & Openings - WorkIndia Pattern */}
                  <div className="flex items-center gap-4 text-xs text-ink mb-4 bg-canvas p-3 rounded-xl border border-steel/50">
                    <div>
                      <span className="text-ink-secondary text-[11px] font-bold block uppercase">{dict.job.salary}:</span>
                      <span className="font-black text-ink text-sm">
                        {job.salaryMin && job.salaryMax
                          ? `₹${job.salaryMin.toLocaleString()} - ₹${job.salaryMax.toLocaleString()}`
                          : dict.job.salary_not_disclosed}
                      </span>
                    </div>
                    <div className="border-l border-steel/60 pl-4">
                      <span className="text-ink-secondary text-[11px] font-bold block uppercase">{dict.job.vacancies}:</span>
                      <span className="font-black text-ink text-sm">
                        {(job.vacancies && job.vacancies > 0) ? `${job.vacancies} जागा` : 'उपलब्ध (नक्की करा)'}
                      </span>
                    </div>
                  </div>

                  {/* Required Skills Chips */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {job.requiredSkillIds.map(skillId => (
                      <span
                        key={skillId}
                        className="text-xs px-2.5 py-1 rounded-full bg-steel-soft text-steel-deep font-semibold"
                      >
                        {getSkillName(skillId, preferredLocale)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-4 border-t border-steel/40">
                  {isExternal ? (
                    <a
                      href={job.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full block text-center py-2.5 px-4 settle-pill-btn text-xs bg-ink hover:bg-ink/90"
                    >
                      🔗 {dict.job.view_original} ➔
                    </a>
                  ) : isApplied ? (
                    <button
                      disabled
                      className="w-full py-2.5 px-4 bg-steel-soft text-ink-muted font-bold rounded-full text-xs cursor-not-allowed border border-steel"
                    >
                      ✓ {dict.job.applied}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApply(job.id)}
                      disabled={applyingId === job.id}
                      className="w-full py-2.5 px-4 settle-pill-btn text-xs"
                    >
                      {applyingId === job.id ? dict.common.loading : dict.job.apply_now}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
