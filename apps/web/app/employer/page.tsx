'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { getDictionary } from '@rojgarmitra/i18n';
import { JobPosting } from '@rojgarmitra/shared';

export default function EmployerDashboardPage() {
  const { preferredLocale, getIdToken } = useAuth();
  const dict = getDictionary(preferredLocale);

  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEmployerJobs() {
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
  }, []);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div>
          <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
            🏭 {dict.employer.dashboard_title}
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-2">
            {dict.employer.my_jobs}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {dict.employer.dashboard_sub}
          </p>
        </div>

        <Link
          href="/employer/post"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition text-sm whitespace-nowrap"
        >
          <span>➕</span>
          <span>{dict.employer.post_new_job}</span>
        </Link>
      </div>

      {/* Stats Counter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <span className="text-xs font-bold text-slate-400 block mb-1">सक्रिय जाहिराती (Active Vacancies)</span>
          <span className="text-3xl font-black text-slate-900">{jobs.length}</span>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <span className="text-xs font-bold text-slate-400 block mb-1">एकूण रिक्त जागा (Total Openings)</span>
          <span className="text-3xl font-black text-emerald-600">
            {jobs.reduce((sum, j) => sum + (j.vacancies || 0), 0)}
          </span>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <span className="text-xs font-bold text-slate-400 block mb-1">परिसर (Coverage)</span>
          <span className="text-sm font-bold text-slate-700">नागपूर, बुटीबोरी व हिंगणा एमआयडीसी</span>
        </div>
      </div>

      {/* Job Openings List */}
      <h2 className="text-lg font-bold text-slate-900 mb-4">
        माझ्या भरती जाहिराती (Open Vacancies)
      </h2>

      {loading ? (
        <div className="text-center py-12 text-slate-500 font-medium">
          {dict.common.loading}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <span className="text-4xl mb-3 inline-block">📋</span>
          <h3 className="text-base font-bold text-slate-800 mb-1">
            अद्याप कोणतीही जाहिरात दिलेली नाही
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            आपल्या कारखान्यासाठी किंवा व्यवसायासाठी त्वरित नवीन भरती जाहिरात तयार करा.
          </p>
          <Link
            href="/employer/post"
            className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow hover:bg-emerald-700 transition"
          >
            जाहिरात तयार करा →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map(job => (
            <div
              key={job.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {job.status === 'open' ? 'चालू (Open)' : 'बंद (Closed)'}
                  </span>
                  <span className="text-xs text-slate-500">
                    📍 {job.areaOrMidc || job.taluka || job.district}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-1">{job.title}</h3>
                <p className="text-xs text-slate-500">
                  जागा: <strong>{job.vacancies}</strong> • वेतन:{' '}
                  <strong>
                    {job.salaryMin ? `₹${job.salaryMin.toLocaleString()} - ₹${job.salaryMax?.toLocaleString()}` : 'चर्चेनुसार'}
                  </strong>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/employer/jobs/${job.id}/applicants`}
                  className="px-4 py-2 bg-slate-900 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition shadow-sm whitespace-nowrap"
                >
                  👥 {dict.employer.manage_applicants} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
