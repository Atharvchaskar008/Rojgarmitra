'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { getDictionary } from '@rojgarmitra/i18n';
import { JobPosting } from '@rojgarmitra/shared';
import {
  IconBuilding,
  IconBriefcase,
  IconUsers,
  IconCheck,
  IconArrowRight
} from '@/components/icons';

export default function EmployerDashboardPage() {
  const { preferredLocale, user, getIdToken } = useAuth();
  const dict = getDictionary(preferredLocale);

  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEmployerJobs() {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const token = await getIdToken();
        if (!token) {
          setLoading(false);
          return;
        }
        const res = await fetch('/api/v1/employer/jobs', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.data) {
          setJobs(json.data);
        }
      } catch (err) {
        console.error('Failed to load employer jobs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEmployerJobs();
  }, [user]);

  return (
    <main className="max-w-6xl mx-auto py-4">
      {/* Top Banner - SETTLE Hero Card */}
      <div className="settle-card-hero p-6 sm:p-8 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold px-3 py-1 bg-steel-soft text-steel-deep rounded-full border border-steel inline-flex items-center gap-1.5">
            <IconBuilding className="w-3.5 h-3.5" />
            <span>{dict.employer.dashboard_title}</span>
          </span>
          <h1 className="text-3xl font-black text-ink mt-2">
            {dict.employer.my_jobs}
          </h1>
          <p className="text-ink-secondary text-sm mt-1 font-medium">
            {dict.employer.dashboard_sub}
          </p>
        </div>

        <Link
          href="/employer/post"
          className="settle-pill-btn px-6 py-3 text-sm whitespace-nowrap inline-flex items-center gap-2 font-bold"
        >
          <span>{dict.employer.post_new_job}</span>
          <IconArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Stats Counter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="settle-card p-5">
          <span className="text-xs font-bold text-ink-secondary uppercase tracking-wider block mb-1">सक्रिय जाहिराती (Active Vacancies)</span>
          <span className="text-3xl font-black text-ink">{jobs.length}</span>
        </div>
        <div className="settle-card p-5">
          <span className="text-xs font-bold text-ink-secondary uppercase tracking-wider block mb-1">एकूण रिक्त जागा (Total Openings)</span>
          <span className="text-3xl font-black text-primary">
            {jobs.reduce((sum, j) => sum + (j.vacancies || 0), 0)}
          </span>
        </div>
        <div className="settle-card p-5">
          <span className="text-xs font-bold text-ink-secondary uppercase tracking-wider block mb-1">परिसर (Industrial Region)</span>
          <span className="text-sm font-black text-ink">नागपूर, बुटीबोरी व हिंगणा एमआयडीसी</span>
        </div>
      </div>

      {/* Job Openings List */}
      <h2 className="text-xl font-black text-ink mb-4">
        माझ्या भरती जाहिराती (Open Vacancies)
      </h2>

      {loading ? (
        <div className="text-center py-16 text-ink-secondary font-bold text-sm">
          {dict.common.loading}
        </div>
      ) : !user ? (
        <div className="text-center py-12 settle-card p-8">
          <div className="w-12 h-12 rounded-full bg-steel-soft border border-ink/20 flex items-center justify-center mx-auto mb-3">
            <IconBuilding className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-base font-black text-ink mb-1">
            {preferredLocale === 'mr' ? 'नियोक्ता लॉगिन आवश्यक आहे' : 'Employer Login Required'}
          </h3>
          <p className="text-sm text-ink-secondary mb-4 font-medium">
            {preferredLocale === 'mr'
              ? 'आपल्या कारखान्यातील जागा व्यवस्थापित करण्यासाठी व अर्जदार पाहण्यासाठी लॉगिन करा.'
              : 'Please sign in to manage your factory job postings and review candidate applicants.'}
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/login?role=employer"
              className="settle-pill-btn px-6 py-2.5 text-xs inline-flex items-center gap-1.5 font-bold shadow-solid-sm"
            >
              <span>{preferredLocale === 'mr' ? 'नियोक्ता म्हणून थेट प्रवेश करा' : 'Sign in as Employer'}</span>
              <IconArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12 settle-card p-8">
          <div className="w-12 h-12 rounded-full bg-steel-soft border border-ink/20 flex items-center justify-center mx-auto mb-3">
            <IconBriefcase className="w-5 h-5 text-ink-secondary" />
          </div>
          <h3 className="text-base font-black text-ink mb-1">
            अद्याप कोणतीही जाहिरात दिलेली नाही
          </h3>
          <p className="text-sm text-ink-secondary mb-4 font-medium">
            आपल्या कारखान्यासाठी किंवा व्यवसायासाठी त्वरित नवीन भरती जाहिरात तयार करा.
          </p>
          <Link
            href="/employer/post"
            className="settle-pill-btn px-6 py-2.5 text-xs inline-flex items-center gap-1.5 font-bold"
          >
            <span>जाहिरात तयार करा</span>
            <IconArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map(job => (
            <div
              key={job.id}
              className="settle-card-interactive p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-verified-bg text-verified border border-verified">
                    {job.status === 'open' ? 'चालू (Open)' : 'बंद (Closed)'}
                  </span>
                  <span className="text-xs font-bold text-ink-secondary">
                    📍 {job.areaOrMidc || job.taluka || job.district}
                  </span>
                </div>

                <h3 className="text-lg font-black text-ink mb-1">{job.title}</h3>
                <p className="text-xs text-ink-secondary font-medium">
                  जागा: <strong className="text-ink">{job.vacancies}</strong> • वेतन:{' '}
                  <strong className="text-ink">
                    {job.salaryMin ? `₹${job.salaryMin.toLocaleString()} - ₹${job.salaryMax?.toLocaleString()}` : 'चर्चेनुसार'}
                  </strong>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/employer/jobs/${job.id}/applicants`}
                  className="settle-pill-btn text-xs px-5 py-2.5 whitespace-nowrap inline-flex items-center gap-1.5"
                >
                  👥 {dict.employer.manage_applicants} ➔
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
