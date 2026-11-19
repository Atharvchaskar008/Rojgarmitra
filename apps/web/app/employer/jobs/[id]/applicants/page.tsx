'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { getDictionary } from '@rojgarmitra/i18n';
import { JobApplication, JobPosting, getSkillName } from '@rojgarmitra/shared';
import { 
  IconMapPin, 
  IconBuilding, 
  IconPhone, 
  IconUser, 
  IconUsers, 
  IconCheck, 
  IconCheckCircle, 
  IconArrowLeft, 
  IconArrowRight 
} from '@/components/icons';

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
        const statusMap: Record<string, string> = {
          shortlisted: 'उमेदवार शॉर्टलिस्ट केला आहे',
          interview_requested: 'मुलाखतीची विनंती पाठवली आहे',
          accepted: 'उमेदवाराची निवड निश्चित केली आहे',
          rejected: 'अर्ज नाकारला आहे',
        };
        setActionMsg(statusMap[newStatus] || `Status updated: ${newStatus}`);
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
    <main className="max-w-5xl mx-auto px-4 py-6">
      {/* Top Header Card */}
      <div className="settle-card-hero p-6 sm:p-8 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/employer"
            className="text-xs font-bold text-ink-secondary hover:text-ink mb-2 inline-flex items-center gap-1 transition"
          >
            <IconArrowLeft className="w-3.5 h-3.5" />
            <span>{dict.employer.my_jobs}</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-ink">
            {job ? job.title : 'भरती अर्जदार'}
          </h1>
          <p className="text-xs text-ink-secondary font-bold mt-1 inline-flex items-center gap-1.5">
            <IconMapPin className="w-3.5 h-3.5 text-primary" />
            <span>{job?.areaOrMidc || job?.taluka}</span>
            <span>•</span>
            <span>एकूण अर्जदार: <strong>{applicants.length}</strong></span>
          </p>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3.5 bg-verified-bg border-2 border-verified text-verified rounded-xl text-xs font-bold mb-6 flex items-center gap-2">
          <IconCheckCircle className="w-4 h-4 text-verified" />
          <span>{actionMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-ink-secondary font-bold text-sm">
          {dict.common.loading}
        </div>
      ) : applicants.length === 0 ? (
        <div className="settle-card p-12 text-center bg-white border-2 border-ink shadow-solid">
          <div className="w-12 h-12 rounded-full bg-steel-soft border border-steel flex items-center justify-center mx-auto mb-3">
            <IconUsers className="w-6 h-6 text-ink-secondary" />
          </div>
          <h3 className="text-lg font-black text-ink mb-1">
            अद्याप कोणीही अर्ज केलेला नाही
          </h3>
          <p className="text-xs text-ink-secondary font-medium max-w-md mx-auto">
            उमेदवार ही जाहिरात पाहताच आपल्याला त्यांचे थेट अर्ज, संपर्क नंबर व कौशल्य माहिती येथे दिसेल.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applicants.map(applicant => (
            <div
              key={applicant.id}
              className="settle-card-interactive p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-ink">
                      {applicant.candidateName || 'उमेदवार'}
                    </h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-steel-soft text-steel-deep font-bold border border-steel">
                      {applicant.candidateTrade || 'Technician'}
                    </span>
                  </div>
                  <p className="text-xs text-ink-secondary mt-1 font-semibold">
                    अर्ज दिनांक: {new Date(applicant.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Direct Dial Phone Button for Employer */}
                {applicant.candidatePhone && (
                  <a
                    href={`tel:${applicant.candidatePhone}`}
                    className="settle-pill-btn px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <IconPhone className="w-3.5 h-3.5" />
                    <span>कॉल करा: {applicant.candidatePhone}</span>
                  </a>
                )}
              </div>

              {/* Skills Badges */}
              {applicant.candidateSkills && applicant.candidateSkills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {applicant.candidateSkills.map(s => (
                    <span
                      key={s}
                      className="settle-pill-chip text-xs px-2.5 py-0.5 font-bold"
                    >
                      {getSkillName(s, preferredLocale)}
                    </span>
                  ))}
                </div>
              )}

              {/* Applicant Status Actions */}
              <div className="pt-4 border-t border-steel/40 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <span className="text-ink-secondary">सद्यस्थिती:</span>
                  <span className="px-3 py-0.5 rounded-full border border-ink text-[11px] font-mono font-black uppercase bg-canvas">
                    {applicant.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 text-xs font-bold">
                  <button
                    type="button"
                    disabled={updatingId === applicant.id}
                    onClick={() => handleStatusUpdate(applicant.id, 'shortlisted')}
                    className="settle-pill-chip px-3 py-1.5 hover:bg-verified-bg hover:text-verified hover:border-verified transition"
                  >
                    {dict.employer.action_shortlist}
                  </button>

                  <button
                    type="button"
                    disabled={updatingId === applicant.id}
                    onClick={() => handleStatusUpdate(applicant.id, 'interview_requested')}
                    className="settle-pill-btn px-3 py-1.5 text-xs transition"
                  >
                    {dict.employer.action_interview}
                  </button>

                  <button
                    type="button"
                    disabled={updatingId === applicant.id}
                    onClick={() => handleStatusUpdate(applicant.id, 'accepted')}
                    className="settle-pill-chip px-3 py-1.5 bg-verified-bg text-verified border-verified transition"
                  >
                    {dict.employer.action_accept}
                  </button>

                  <button
                    type="button"
                    disabled={updatingId === applicant.id}
                    onClick={() => handleStatusUpdate(applicant.id, 'rejected')}
                    className="settle-pill-chip px-3 py-1.5 hover:bg-alert-bg hover:text-alert hover:border-alert transition"
                  >
                    {dict.employer.action_reject}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
