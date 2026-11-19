'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { getDictionary } from '@rojgarmitra/i18n';
import { JobApplication } from '@rojgarmitra/shared';

export default function CandidateApplicationsPage() {
  const { preferredLocale, getIdToken } = useAuth();
  const dict = getDictionary(preferredLocale);

  const [applications, setApplications] = useState<(JobApplication & { jobTitle?: string; employerName?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadApplications() {
      setLoading(true);
      try {
        const token = await getIdToken();
        if (!token) {
          setLoading(false);
          return;
        }
        const res = await fetch('/api/v1/candidate/applications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.data) {
          setApplications(json.data);
        }
      } catch (err) {
        console.error('Failed to load applications:', err);
      } finally {
        setLoading(false);
      }
    }
    loadApplications();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'shortlisted':
        return (
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-xs">
            ✓ {dict.employer.action_shortlist} (Shortlisted)
          </span>
        );
      case 'interview_requested':
        return (
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-bold text-xs">
            📞 {dict.employer.action_interview} (Interview Requested)
          </span>
        );
      case 'accepted':
        return (
          <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-xs">
            🎉 {dict.employer.action_accept} (Selected)
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full font-bold text-xs">
            ✕ {dict.employer.action_reject}
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-bold text-xs">
            🕒 {dict.job.applied} (Under Review)
          </span>
        );
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            {dict.nav.applications}
          </h1>
          <p className="text-sm text-slate-500">
            आपण पाठवलेल्या नोकरी अर्जांची सद्यस्थिती (Application Status Tracker)
          </p>
        </div>
        <Link
          href="/candidate"
          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200"
        >
          ← {dict.nav.jobs}
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 font-medium">
          {dict.common.loading}
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <span className="text-4xl mb-3 inline-block">📄</span>
          <h3 className="text-base font-bold text-slate-800 mb-1">
            अद्याप कोणताही अर्ज केलेला नाही
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            आपल्या कौशल्यानुसार नोकऱ्या शोधा आणि थेट एका क्लिकवर अर्ज करा.
          </p>
          <Link
            href="/candidate"
            className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow hover:bg-emerald-700 transition"
          >
            नोकऱ्या शोधा →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map(app => (
            <div
              key={app.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {app.jobTitle || 'Industrial Vacancy'}
                  </h3>
                  <p className="text-sm text-slate-600 font-medium">
                    🏢 {app.employerName || 'Employer'}
                  </p>
                </div>
                <div>{getStatusBadge(app.status)}</div>
              </div>

              {app.notes && (
                <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-100">
                  <span className="font-bold text-slate-900">नियोक्त्यांची टीप:</span> {app.notes}
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>अर्ज दिनांक: {new Date(app.createdAt).toLocaleDateString()}</span>
                <span className="font-mono">ID: {app.id.slice(0, 8)}...</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
