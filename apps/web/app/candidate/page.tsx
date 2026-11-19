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
      const token = (await getIdToken()) || 'demo_token_candidate_user_1';
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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 sm:p-8 text-white mb-8 shadow-sm">
        <div className="max-w-3xl">
          <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold mb-3">
            📍 {dict.app.pilot_region}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mb-2">
            {dict.nav.jobs} (Job Opportunities)
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base mb-4">
            {dict.app.tagline}
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              href="/candidate/onboarding"
              className="bg-white text-emerald-800 font-bold px-4 py-2 rounded-xl shadow-sm hover:bg-emerald-50 transition"
            >
              ✏️ {dict.candidate.preferred_name ? 'माझे प्रोफाईल भरा / अपडेट करा' : 'Update Profile'}
            </Link>
            <Link
              href="/candidate/upskilling"
              className="bg-emerald-800/60 text-white font-medium px-4 py-2 rounded-xl hover:bg-emerald-800 transition"
            >
              🎓 {dict.nav.upskilling}
            </Link>
            <Link
              href="/candidate/career"
              className="bg-emerald-800/60 text-white font-medium px-4 py-2 rounded-xl hover:bg-emerald-800 transition"
            >
              🚀 {dict.nav.career}
            </Link>
          </div>
        </div>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`p-4 rounded-xl mb-6 text-sm font-medium ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 text-xs sm:text-sm">
        <span className="font-bold text-slate-700 whitespace-nowrap mr-2">
          परिसर / Area:
        </span>
        {['all', 'Butibori', 'Hingna', 'Umred'].map(taluka => (
          <button
            key={taluka}
            onClick={() => setSelectedTaluka(taluka)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
              selectedTaluka === taluka
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {taluka === 'all' ? 'सर्व परिसर (All Areas)' : taluka}
          </button>
        ))}
      </div>

      {/* Job Cards Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 font-medium">
          {dict.common.loading}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
          <span className="text-4xl mb-2 inline-block">🔍</span>
          <p className="text-slate-600 font-medium">{dict.common.not_found}</p>
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
                className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      📍 {job.taluka || job.district}
                    </span>

                    {/* Source Attribution Badge */}
                    {job.sourceType === 'internal_employer' ? (
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ✓ {dict.job.source_verified}
                      </span>
                    ) : job.sourceType === 'external_public' ? (
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        🌐 {job.sourceDomain || 'Public Portal'}
                      </span>
                    ) : (
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                        ℹ️ {dict.common.demo_badge}
                      </span>
                    )}
                  </div>

                  {/* Job Title & Employer */}
                  <h3 className="text-lg font-bold text-slate-900 leading-snug mb-1">
                    {job.title}
                  </h3>
                  <p className="text-sm text-slate-600 font-medium mb-3">
                    🏢 {job.employerName}
                  </p>

                  {/* Compatibility Match Score Badge (if computed) */}
                  {match && (
                    <div className="mb-4 p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-800 mb-1">
                        <span>{dict.match.match_score}</span>
                        <span>{match.matchScore}%</span>
                      </div>
                      <div className="w-full bg-emerald-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-1.5 rounded-full"
                          style={{ width: `${match.matchScore}%` }}
                        />
                      </div>
                      {match.missingSkills.length > 0 && (
                        <p className="text-xs text-slate-500 mt-1.5">
                          {dict.match.missing_skills}:{' '}
                          {match.missingSkills.map(s => getSkillName(s, preferredLocale)).join(', ')}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Salary & Openings */}
                  <div className="flex items-center gap-4 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl">
                    <div>
                      <span className="text-slate-400 block">{dict.job.salary}:</span>
                      <span className="font-bold text-slate-800">
                        {job.salaryMin && job.salaryMax
                          ? `₹${job.salaryMin.toLocaleString()} - ₹${job.salaryMax.toLocaleString()}`
                          : dict.job.salary_not_disclosed}
                      </span>
                    </div>
                    <div className="border-l border-slate-200 pl-4">
                      <span className="text-slate-400 block">{dict.job.vacancies}:</span>
                      <span className="font-bold text-slate-800">{job.vacancies} जागा</span>
                    </div>
                  </div>

                  {/* Required Skills Chips */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {job.requiredSkillIds.map(skillId => (
                      <span
                        key={skillId}
                        className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
                      >
                        {getSkillName(skillId, preferredLocale)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-4 border-t border-slate-100">
                  {isExternal ? (
                    <a
                      href={job.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full block text-center py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition"
                    >
                      🔗 {dict.job.view_original} →
                    </a>
                  ) : isApplied ? (
                    <button
                      disabled
                      className="w-full py-2.5 px-4 bg-slate-100 text-slate-400 font-bold rounded-xl text-sm cursor-not-allowed"
                    >
                      ✓ {dict.job.applied}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApply(job.id)}
                      disabled={applyingId === job.id}
                      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition shadow-sm"
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
