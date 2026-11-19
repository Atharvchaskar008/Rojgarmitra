'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { getDictionary } from '@rojgarmitra/i18n';
import { JobApplication } from '@rojgarmitra/shared';

export default function CandidateApplicationsPage() {
  const { preferredLocale, user, getIdToken } = useAuth();
  const dict = getDictionary(preferredLocale);

  const [applications, setApplications] = useState<(JobApplication & { jobTitle?: string; employerName?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadApplications() {
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
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'shortlisted':
        return (
          <span className="px-3.5 py-1 bg-verified-bg text-verified rounded-full font-bold text-xs border border-verified">
            ✓ {dict.employer.action_shortlist} (Shortlisted)
          </span>
        );
      case 'interview_requested':
        return (
          <span className="px-3.5 py-1 bg-steel-soft text-primary rounded-full font-bold text-xs border border-steel">
            📞 {dict.employer.action_interview} (Interview Requested)
          </span>
        );
      case 'accepted':
        return (
          <span className="px-3.5 py-1 bg-verified-bg text-verified rounded-full font-bold text-xs border border-verified">
            🎉 {dict.employer.action_accept} (Selected)
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3.5 py-1 bg-alert-bg text-alert rounded-full font-bold text-xs border border-alert">
            ✕ {dict.employer.action_reject}
          </span>
        );
      default:
        return (
          <span className="px-3.5 py-1 bg-steel-soft text-ink rounded-full font-bold text-xs border border-steel/60">
            🕒 {dict.job.applied} (Under Review)
          </span>
        );
    }
  };

  return (
    <main className="max-w-4xl mx-auto py-4">
      {/* Header Banner - SETTLE Hero Card */}
      <div className="settle-card-hero p-6 sm:p-8 mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-ink">
            {dict.nav.applications}
          </h1>
          <p className="text-sm text-ink-secondary mt-1 font-medium">
            आपण पाठवलेल्या नोकरी अर्जांची सद्यस्थिती (Application Status Tracker)
          </p>
        </div>
        <Link
          href="/candidate"
          className="settle-pill-chip text-xs px-3.5 py-1.5 font-bold"
        >
          ← {dict.nav.jobs}
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-16 text-ink-secondary font-bold text-base">
          ⌛ {dict.common.loading}
        </div>
      ) : !user ? (
        <div className="text-center py-12 settle-card p-8">
          <span className="text-4xl mb-3 inline-block">🔑</span>
          <h3 className="text-base font-black text-ink mb-1">
            {preferredLocale === 'mr' ? 'लॉगिन आवश्यक आहे' : 'Login Required'}
          </h3>
          <p className="text-sm text-ink-secondary mb-4 font-medium">
            {preferredLocale === 'mr'
              ? 'आपले पाठवलेले अर्ज व मुलाखतीची स्थिती पाहण्यासाठी कृपया लॉगिन करा.'
              : 'Please sign in to view your applications and interview statuses.'}
          </p>
          <Link
            href="/login"
            className="settle-pill-btn px-6 py-2.5 text-xs inline-block"
          >
            {dict.nav.login} ➔
          </Link>
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-12 settle-card p-8">
          <span className="text-4xl mb-3 inline-block">📄</span>
          <h3 className="text-base font-black text-ink mb-1">
            अद्याप कोणताही अर्ज केलेला नाही
          </h3>
          <p className="text-sm text-ink-secondary mb-4 font-medium">
            आपल्या कौशल्यानुसार नोकऱ्या शोधा आणि थेट एका क्लिकवर अर्ज करा.
          </p>
          <Link
            href="/candidate"
            className="settle-pill-btn px-6 py-2.5 text-xs inline-block"
          >
            नोकऱ्या शोधा ➔
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map(app => (
            <div
              key={app.id}
              className="settle-card-interactive p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <div>
                  <h3 className="text-lg font-black text-ink">
                    {app.jobTitle || 'Industrial Vacancy'}
                  </h3>
                  <p className="text-xs text-ink-secondary font-bold uppercase tracking-wider mt-0.5">
                    🏢 {app.employerName || 'Employer'}
                  </p>
                </div>
                <div>{getStatusBadge(app.status)}</div>
              </div>

              {app.notes && (
                <div className="mt-3 p-3.5 bg-canvas rounded-xl text-xs text-ink border border-steel/50">
                  <span className="font-black text-ink">नियोक्त्यांची टीप:</span> {app.notes}
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-steel/40 flex items-center justify-between text-xs text-ink-secondary font-medium">
                <span>अर्ज दिनांक: {new Date(app.createdAt).toLocaleDateString()}</span>
                <span className="font-mono text-steel-deep">ID: {app.id.slice(0, 8)}...</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
