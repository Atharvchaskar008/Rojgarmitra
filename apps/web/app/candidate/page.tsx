'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { getDictionary } from '@rojgarmitra/i18n';
import { JobPosting, MatchExplanation, getSkillName } from '@rojgarmitra/shared';
import {
  IconMapPin,
  IconBuilding,
  IconBriefcase,
  IconShieldCheck,
  IconMic,
  IconGraduationCap,
  IconCompass,
  IconExternalLink,
  IconArrowRight,
  IconCheck,
  IconNavigation,
  IconFactory
} from '@/components/icons';
import { DigitalProfileBadge } from '@/components/profile/DigitalProfileBadge';

export default function CandidateJobsFeedPage() {
  const { preferredLocale, user, getIdToken } = useAuth();
  const dict = getDictionary(preferredLocale);

  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [nearbyHubs, setNearbyHubs] = useState<any[]>([]);
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
        if (json.nearbyHubs) {
          setNearbyHubs(json.nearbyHubs);
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
  }, [user, preferredLocale]);

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
            <IconMapPin className="w-3.5 h-3.5 text-primary" />
            <span>{dict.app.pilot_region}</span>
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
              className="settle-pill-btn px-4 py-2 text-xs inline-flex items-center gap-1.5"
            >
              <IconMic className="w-3.5 h-3.5" />
              <span>
                {preferredLocale === 'mr'
                  ? 'आवाज / प्रोफाइल नोंदवा'
                  : preferredLocale === 'hi'
                  ? 'वॉयस / प्रोफाइल भरें'
                  : 'Update Skills Profile'}
              </span>
              <IconArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/candidate/upskilling"
              className="settle-pill-chip px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5"
            >
              <IconGraduationCap className="w-3.5 h-3.5 text-primary" />
              <span>{dict.nav.upskilling}</span>
            </Link>
            <Link
              href="/candidate/career"
              className="settle-pill-chip px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5"
            >
              <IconCompass className="w-3.5 h-3.5 text-primary" />
              <span>{dict.nav.career}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Candidate Digital Identity Profile Badge */}
      {user && (
        <div className="mb-8">
          <DigitalProfileBadge role="candidate" />
        </div>
      )}

      {/* Message Banner */}
      {message && (
        <div
          className={`p-4 rounded-xl mb-6 text-sm font-bold border-2 flex items-center justify-between gap-3 ${message.type === 'success'
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
          {preferredLocale === 'mr' ? 'परिसर / Area:' : preferredLocale === 'hi' ? 'परिसर / Area:' : 'Location / Area:'}
        </span>
        {['all', 'Butibori', 'Hingna', 'Umred'].map(taluka => (
          <button
            key={taluka}
            onClick={() => setSelectedTaluka(taluka)}
            className={`px-4 py-1.5 rounded-full font-bold whitespace-nowrap transition ${selectedTaluka === taluka
              ? 'settle-pill-chip-active text-xs'
              : 'settle-pill-chip text-xs'
              }`}
          >
            {taluka === 'all'
              ? (preferredLocale === 'mr' ? 'सर्व परिसर (All Areas)' : preferredLocale === 'hi' ? 'सभी क्षेत्र (All Areas)' : 'All Areas')
              : taluka}
          </button>
        ))}
      </div>

      {/* Nearby Industrial Plants / Employers via Google Maps */}
      {nearbyHubs.length > 0 && (
        <div className="settle-card-hero p-5 sm:p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-steel-soft border border-steel rounded-full text-xs font-bold text-steel-deep mb-1">
                <IconNavigation className="w-3.5 h-3.5 text-primary" />
                <span>
                  {preferredLocale === 'mr'
                    ? 'Google Maps स्थानिक औद्योगिक शोध'
                    : preferredLocale === 'hi'
                    ? 'Google Maps स्थानीय औद्योगिक खोज'
                    : 'Google Maps Local Industrial Search'}
                </span>
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-ink">
                {preferredLocale === 'mr'
                  ? 'जवळचे थेट कारखाने व वर्कशॉप्स (Nearby Industrial Hubs)'
                  : preferredLocale === 'hi'
                  ? 'आसपास के कारखाने और वर्कशॉप्स (Nearby Industrial Hubs)'
                  : 'Nearby Industrial Hubs & Plants'}
              </h2>
              <p className="text-xs text-ink-secondary font-medium">
                {preferredLocale === 'mr'
                  ? 'थेट भेट देण्यासाठी किंवा संपर्कासाठी Google Maps वर सत्यापित स्थानिक कंपन्या.'
                  : preferredLocale === 'hi'
                  ? 'सीधे मिलने या संपर्क के लिए Google Maps पर सत्यापित स्थानीय कंपनियां।'
                  : 'Verified local industrial units and workshops on Google Maps for direct contact.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {nearbyHubs.map((hub, hIdx) => (
              <div
                key={hub.placeId || hIdx}
                className="settle-card p-4 flex flex-col justify-between bg-surface hover:border-ink transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-steel-soft text-primary border border-steel">
                      {hub.industryCategory || (preferredLocale === 'mr' ? 'औद्योगिक युनिट' : preferredLocale === 'hi' ? 'औद्योगिक इकाई' : 'Industrial Unit')}
                    </span>
                    {hub.rating && (
                      <span className="text-[11px] font-bold text-ink inline-flex items-center gap-0.5">
                        ★ {hub.rating}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-black text-ink leading-snug mb-1 line-clamp-2">
                    {hub.name}
                  </h4>
                  <p className="text-[11px] text-ink-secondary font-medium line-clamp-2 mb-3">
                    {hub.formattedAddress}
                  </p>
                </div>

                <a
                  href={hub.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="settle-pill-chip text-xs px-3 py-1.5 text-center font-black inline-flex items-center justify-center gap-1.5 hover:bg-ink hover:text-white transition w-full"
                >
                  <IconNavigation className="w-3.5 h-3.5 text-primary" />
                  <span>
                    {preferredLocale === 'mr'
                      ? 'रस्ता पहा (Map)'
                      : preferredLocale === 'hi'
                      ? 'रास्ता देखें (Map)'
                      : 'View Route'}
                  </span>
                  <IconExternalLink className="w-3 h-3 text-ink-muted" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Job Cards Grid */}
      {loading ? (
        <div className="text-center py-16 text-ink-secondary font-bold text-base">
          ⌛ {dict.common.loading}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-12 settle-card p-8">
          <span className="text-4xl mb-2 inline-block">🔍</span>
          <p className="text-ink font-bold">{dict.common.not_found}</p>
          <p className="text-xs text-ink-secondary mt-1">
            {preferredLocale === 'mr'
              ? 'निवडलेल्या परिसरात सध्या कोणतीही रिक्त जागा उपलब्ध नाही.'
              : preferredLocale === 'hi'
              ? 'चयनित क्षेत्र में इस समय कोई रिक्ति उपलब्ध नहीं है।'
              : 'No vacancies found in the selected area currently.'}
          </p>
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
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-steel-soft text-steel-deep border border-steel/60 inline-flex items-center gap-1">
                      <IconMapPin className="w-3 h-3 text-steel-deep" />
                      <span>{job.taluka || job.district}</span>
                    </span>

                    {/* Source Attribution Badge */}
                    {job.sourceType === 'internal_employer' ? (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-verified-bg text-verified border border-verified inline-flex items-center gap-1">
                        <IconCheck className="w-3 h-3" />
                        <span>{dict.job.source_verified}</span>
                      </span>
                    ) : job.sourceType === 'external_public' ? (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-steel-soft text-primary border border-steel inline-flex items-center gap-1">
                        <IconExternalLink className="w-3 h-3" />
                        <span>{job.sourceDomain || 'Public Lead'}</span>
                      </span>
                    ) : (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-alert-bg text-alert border border-alert">
                        <span>{dict.common.demo_badge}</span>
                      </span>
                    )}
                  </div>

                  {/* Job Title & Employer */}
                  <h3 className="text-lg font-black text-ink leading-snug mb-1">
                    {job.title}
                  </h3>
                  <p className="text-xs text-ink-secondary font-bold mb-2 uppercase tracking-wider inline-flex items-center gap-1">
                    <IconBuilding className="w-3.5 h-3.5" />
                    <span>{job.employerName}</span>
                  </p>

                  {/* Google Maps Route / Location Pill */}
                  {job.googleMapsUrl && (
                    <a
                      href={job.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-steel-deep hover:text-ink mb-3 p-1.5 bg-canvas rounded-lg border border-steel/50 group transition w-full"
                    >
                      <IconNavigation className="w-3 h-3 text-primary group-hover:scale-110 transition shrink-0" />
                      <span className="truncate flex-1 text-left">
                        {job.formattedAddress ||
                          (preferredLocale === 'mr'
                            ? 'Google Maps वर रस्ता पहा'
                            : preferredLocale === 'hi'
                            ? 'Google Maps पर रास्ता देखें'
                            : 'View on Google Maps')}
                      </span>
                      <IconExternalLink className="w-3 h-3 text-ink-muted shrink-0" />
                    </a>
                  )}

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

                  {/* Salary & Openings */}
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
                        {job.vacancies && job.vacancies > 0
                          ? `${job.vacancies} ${
                              preferredLocale === 'mr' ? 'जागा' : preferredLocale === 'hi' ? 'पद' : 'Openings'
                            }`
                          : preferredLocale === 'mr'
                          ? 'उपलब्ध (नक्की करा)'
                          : preferredLocale === 'hi'
                          ? 'उपलब्ध (पुष्टि करें)'
                          : 'Available'}
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
                      className="w-full text-center py-2.5 px-4 settle-pill-btn text-xs bg-ink hover:bg-ink/90 inline-flex items-center justify-center gap-1.5"
                    >
                      <span>{dict.job.view_original}</span>
                      <IconExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : isApplied ? (
                    <button
                      disabled
                      className="w-full py-2.5 px-4 bg-steel-soft text-ink-muted font-bold rounded-full text-xs cursor-not-allowed border border-steel inline-flex items-center justify-center gap-1"
                    >
                      <IconCheck className="w-3.5 h-3.5" />
                      <span>{dict.job.applied}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApply(job.id)}
                      disabled={applyingId === job.id}
                      className="w-full py-2.5 px-4 settle-pill-btn text-xs font-bold inline-flex items-center justify-center gap-1.5"
                    >
                      <span>{applyingId === job.id ? dict.common.loading : dict.job.apply_now}</span>
                      <IconArrowRight className="w-3.5 h-3.5" />
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
