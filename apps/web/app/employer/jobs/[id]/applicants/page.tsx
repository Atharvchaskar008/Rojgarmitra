'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { getDictionary } from '@rojgarmitra/i18n';
import { JobApplication, JobPosting, getSkillName } from '@rojgarmitra/shared';

export default function EmployerJobApplicantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const jobId = resolvedParams.id;

  const { preferredLocale, getIdToken } = useAuth();
  const dict = getDictionary(preferredLocale);

  const [job, setJob] = useState<JobPosting | null>(null);
  const [applicants, setApplicants] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const token = await getIdToken();
        if (!token) {
          setLoading(false);
          return;
        }
        
        // 1. Load job details
        const jRes = await fetch(`/api/v1/jobs/${jobId}`);
        const jData = await jRes.json();
        if (jData.data) setJob(jData.data);

        // 2. Load applicants
        const aRes = await fetch(`/api/v1/employer/jobs/${jobId}/applications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const aData = await aRes.json();
        if (aData.data) setApplicants(aData.data);
      } catch (err) {
        console.error('Error loading applicants:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [jobId]);

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    setUpdatingId(applicationId);
    setActionMsg(null);
    try {
      const token = await getIdToken();
      if (!token) {
        setActionMsg('Please sign in to update application status.');
        setUpdatingId(null);
        return;
      }
      const res = await fetch(`/api/v1/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (res.ok) {
        setApplicants(prev =>
          prev.map(a => (a.id === applicationId ? { ...a, status: newStatus as any } : a))
        );
        setActionMsg(`उमेदवाराची स्थिती बदलली: ${newStatus}`);
      } else {
        alert(json.error?.message || dict.common.error);
      }
    } catch {
      alert(dict.common.error);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <Link
            href="/employer"
            className="text-xs font-bold text-slate-500 hover:text-slate-800 mb-1 inline-block"
          >
            ← {dict.employer.my_jobs}
          </Link>
          <h1 className="text-2xl font-black text-slate-900">
            {job ? job.title : 'भरती अर्जदार'}
          </h1>
          <p className="text-xs text-slate-500">
            📍 {job?.areaOrMidc || job?.taluka} • एकूण अर्जदार: <strong>{applicants.length}</strong>
          </p>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold mb-6">
          ✓ {actionMsg}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-500 font-medium">
          {dict.common.loading}
        </div>
      ) : applicants.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <span className="text-4xl mb-3 inline-block">👥</span>
          <h3 className="text-base font-bold text-slate-800 mb-1">
            अद्याप कोणीही अर्ज केलेला नाही
          </h3>
          <p className="text-sm text-slate-500">
            उमेदवार ही जाहिरात पाहताच आपल्याला त्यांचे अर्ज येथे दिसतील.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applicants.map(applicant => (
            <div
              key={applicant.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {applicant.candidateName || 'उमेदवार'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    व्यवसाय: <strong>{applicant.candidateTrade || 'ITI Wireman'}</strong> • फोन: <strong>{applicant.candidatePhone || '9876543210'}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      applicant.status === 'shortlisted'
                        ? 'bg-emerald-100 text-emerald-800'
                        : applicant.status === 'interview_requested'
                        ? 'bg-purple-100 text-purple-800'
                        : applicant.status === 'rejected'
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    स्थिती: {applicant.status}
                  </span>
                </div>
              </div>

              {/* Skills Chips */}
              {applicant.candidateSkills && applicant.candidateSkills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {applicant.candidateSkills.map(s => (
                    <span
                      key={s}
                      className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
                    >
                      {getSkillName(s, preferredLocale)}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Buttons for Employer */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-xs font-bold">
                <button
                  type="button"
                  disabled={updatingId === applicant.id}
                  onClick={() => handleStatusUpdate(applicant.id, 'shortlisted')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
                >
                  ✓ {dict.employer.action_shortlist}
                </button>

                <button
                  type="button"
                  disabled={updatingId === applicant.id}
                  onClick={() => handleStatusUpdate(applicant.id, 'interview_requested')}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
                >
                  📞 {dict.employer.action_interview}
                </button>

                <button
                  type="button"
                  disabled={updatingId === applicant.id}
                  onClick={() => handleStatusUpdate(applicant.id, 'accepted')}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition"
                >
                  🎉 {dict.employer.action_accept}
                </button>

                <button
                  type="button"
                  disabled={updatingId === applicant.id}
                  onClick={() => handleStatusUpdate(applicant.id, 'rejected')}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition"
                >
                  ✕ {dict.employer.action_reject}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
