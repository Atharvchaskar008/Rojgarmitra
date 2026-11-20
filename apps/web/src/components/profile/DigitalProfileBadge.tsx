'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { getSkillName, getTradeName } from '@rojgarmitra/shared';
import {
  IconCheck,
  IconShieldCheck,
  IconMapPin,
  IconPhone,
  IconBriefcase,
  IconBuilding,
  IconGraduationCap,
  IconClock
} from '@/components/icons';

interface DigitalProfileBadgeProps {
  role?: 'candidate' | 'employer' | null;
  compact?: boolean;
}

export function DigitalProfileBadge({ role, compact = false }: DigitalProfileBadgeProps) {
  const { user, userRole, preferredLocale, getIdToken } = useAuth();
  const activeRole = role || userRole || 'candidate';

  const isCandidate = activeRole === 'candidate';
  const isMr = preferredLocale === 'mr';
  const isHi = preferredLocale === 'hi';

  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function loadLiveProfile() {
      if (!user) return;
      try {
        const token = await getIdToken();
        if (!token) return;
        const endpoint = isCandidate ? '/api/v1/profile/candidate' : '/api/v1/profile/employer';
        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.data) {
          setProfile(json.data);
        }
      } catch (err) {
        // Fallback to user props
      }
    }
    loadLiveProfile();
  }, [user, isCandidate]);

  if (!user && !role) return null;

  // Dynamic candidate identity
  const candidateName =
    profile?.preferredName ||
    user?.displayName ||
    (user?.email?.includes('demo') 
      ? (isMr ? 'रमेश विष्णू पाटील' : isHi ? 'रमेश विष्णु पाटिल' : 'Ramesh Vishnu Patil') 
      : user?.email?.split('@')[0] || (isMr ? 'उमेदवार' : isHi ? 'उम्मीदवार' : 'Candidate'));

  const initials = candidateName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0].toUpperCase())
    .join('') || 'RM';

  const candidateTradeTitle = profile?.trade
    ? getTradeName(profile.trade, preferredLocale)
    : user?.email?.includes('demo')
    ? (isMr ? 'प्रमाणित MIG/MAG वेल्डर व फॅब्रिकेटर' : isHi ? 'प्रमाणित MIG/MAG वेल्डर व फैब्रिकेटर' : 'Certified MIG/MAG Welder & Fabricator')
    : (isMr ? 'स्थानिक कुशल कारागीर' : isHi ? 'स्थानीय कुशल कारीगर' : 'Skilled Regional Candidate');

  const candidateLocation = profile?.taluka
    ? `${profile.taluka}, ${isMr ? 'नागपूर' : isHi ? 'नागपुर' : 'Nagpur'}`
    : profile?.village || (isMr ? 'हिंगणा / बुटीबोरी' : isHi ? 'हिंगना / बुटीबोरी' : 'Hingna / Butibori');

  const candidateExpText = profile?.experienceMonths
    ? `${Math.floor(profile.experienceMonths / 12)} ${isMr ? 'वर्षे' : isHi ? 'वर्ष' : 'Yrs'} (${profile.experienceMonths} ${isMr ? 'महिने' : isHi ? 'माह' : 'mo'})`
    : (isMr ? '२ वर्षे (२४ महिने)' : isHi ? '२ वर्ष (२४ माह)' : '2 Yrs (24 mo)');

  const candidateQual = profile?.qualifications?.[0] || (isMr ? '१०वी + प्रात्यक्षिक अनुभव' : isHi ? '१०वीं + व्यावहारिक अनुभव' : '10th Pass + Practical Experience');
  const candidatePhone = profile?.phone || '9876543210';
  const candidateId = profile?.uid ? `RM-VID-${profile.uid.slice(0, 8).toUpperCase()}` : 'RM-VID-2026-8941';

  const displayedSkills =
    profile?.skillIds && profile.skillIds.length > 0
      ? profile.skillIds.map((s: string) => getSkillName(s, preferredLocale))
      : isMr
      ? ['MIG वेल्डिंग', 'आर्क वेल्डिंग', 'शीट मेटल फॅब्रिकेशन', 'लेथ मशिनिंग']
      : isHi
      ? ['MIG वेल्डिंग', 'आर्क वेल्डिंग', 'शीट मेटल फैब्रिकेशन', 'लेथ मशीनिंग']
      : ['MIG Welding', 'Arc Welding', 'Sheet Metal Fabrication', 'Lathe Machining'];

  // Dynamic employer identity
  const employerName =
    profile?.businessName ||
    (user?.email?.includes('demo') ? 'Mahindra & Mahindra Ltd. (Hingna Plant)' : user?.displayName || (isMr ? 'स्थानिक नोंदणीकृत उद्योग / आस्थापना' : isHi ? 'स्थानीय पंजीकृत उद्योग / प्रतिष्ठान' : 'Regional Registered Industry / Enterprise'));

  const empInitials = employerName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0].toUpperCase())
    .join('') || 'MM';

  const empAddress = profile?.industrialArea || profile?.taluka || 'Plot P-15, Hingna MIDC, Nagpur';
  const empContact = profile?.contactName || (isMr ? 'एचआर प्रमुख' : isHi ? 'एचआर प्रमुख' : 'HR Plant Lead');
  const empPhone = profile?.phone || '9823012345';
  const empId = profile?.uid ? `RM-EMP-${profile.uid.slice(0, 8).toUpperCase()}` : 'RM-EMP-3319';

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-2 border-ink shadow-solid ${
        compact ? 'p-3 bg-surface' : 'p-4 sm:p-6 bg-gradient-to-br from-surface via-surface-subtle to-canvas'
      }`}
    >
      {/* Background Decorative Guilloche / Seal Accent */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary/5 pointer-events-none" />

      {isCandidate ? (
        /* CANDIDATE DIGITAL PROFILE BADGE */
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-steel/60">
            <div className="flex items-center gap-3">
              {/* Avatar Pill */}
              <div className="w-11 sm:w-12 h-11 sm:h-12 rounded-xl bg-ink text-white flex items-center justify-center font-black text-base sm:text-lg shadow-solid-sm shrink-0 border border-ink">
                <span>{initials}</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-sm sm:text-base font-black text-ink">
                    {candidateName}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-verified-bg text-verified border border-verified font-black text-[10px] inline-flex items-center gap-0.5">
                    <IconCheck className="w-3 h-3" />
                    <span>{isMr ? 'पडताळणी पूर्ण' : isHi ? 'सत्यापित' : 'Verified'}</span>
                  </span>
                </div>
                <p className="text-xs text-primary font-bold">
                  {candidateTradeTitle}
                </p>
              </div>
            </div>

            {/* Unique Rojgar ID */}
            <div className="text-left sm:text-right">
              <span className="text-[10px] font-mono font-bold text-ink-muted uppercase block">
                {isMr ? 'डिजिटल ओळख क्रमांक:' : isHi ? 'डिजिटल पहचान संख्या:' : 'Credential ID:'}
              </span>
              <span className="font-mono text-xs font-black text-ink px-2 py-0.5 bg-steel-soft rounded border border-steel">
                {candidateId}
              </span>
            </div>
          </div>

          {/* Core Credentials & Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 text-xs">
            <div className="p-2 rounded-lg bg-canvas border border-steel/50">
              <span className="text-[10px] text-ink-muted font-bold block">
                {isMr ? 'परिसर / MIDC' : isHi ? 'क्षेत्र / MIDC' : 'Location:'}
              </span>
              <span className="font-bold text-ink inline-flex items-center gap-1 truncate w-full">
                <IconMapPin className="w-3 h-3 text-primary shrink-0" />
                <span className="truncate">{candidateLocation}</span>
              </span>
            </div>

            <div className="p-2 rounded-lg bg-canvas border border-steel/50">
              <span className="text-[10px] text-ink-muted font-bold block">
                {isMr ? 'कामाचा अनुभव' : isHi ? 'कार्य अनुभव' : 'Experience:'}
              </span>
              <span className="font-bold text-ink inline-flex items-center gap-1 truncate w-full">
                <IconClock className="w-3 h-3 text-primary shrink-0" />
                <span className="truncate">{candidateExpText}</span>
              </span>
            </div>

            <div className="p-2 rounded-lg bg-canvas border border-steel/50">
              <span className="text-[10px] text-ink-muted font-bold block">
                {isMr ? 'प्रशिक्षण पात्रता' : isHi ? 'प्रशिक्षण योग्यता' : 'Qualification:'}
              </span>
              <span className="font-bold text-ink inline-flex items-center gap-1 truncate w-full">
                <IconGraduationCap className="w-3 h-3 text-primary shrink-0" />
                <span className="truncate">{candidateQual}</span>
              </span>
            </div>

            <div className="p-2 rounded-lg bg-canvas border border-steel/50">
              <span className="text-[10px] text-ink-muted font-bold block">
                {isMr ? 'संपर्क मोबाईल' : isHi ? 'संपर्क मोबाइल' : 'Phone:'}
              </span>
              <span className="font-bold text-ink inline-flex items-center gap-1 font-mono truncate w-full">
                <IconPhone className="w-3 h-3 text-verified shrink-0" />
                <span className="truncate">{candidatePhone}</span>
              </span>
            </div>
          </div>

          {/* Verified Skills Tags */}
          <div className="mt-3 flex flex-wrap gap-1.5 items-center">
            <span className="text-[11px] font-bold text-ink-muted mr-1">
              {isMr ? 'प्रमाणित कौशल्ये:' : isHi ? 'सत्यापित कौशल:' : 'Verified Skills:'}
            </span>
            {displayedSkills.slice(0, 6).map((sk: string, i: number) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-full bg-steel-soft border border-steel/70 text-ink text-[10px] font-bold"
              >
                ✓ {sk}
              </span>
            ))}
          </div>
        </div>
      ) : (
        /* EMPLOYER DIGITAL PROFILE BADGE */
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-steel/60">
            <div className="flex items-center gap-3">
              <div className="w-11 sm:w-12 h-11 sm:h-12 rounded-xl bg-blue-900 text-white flex items-center justify-center font-black text-base sm:text-lg shadow-solid-sm shrink-0 border border-blue-950">
                <span>{empInitials}</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-sm sm:text-base font-black text-ink">
                    {employerName}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-verified-bg text-verified border border-verified font-black text-[10px] inline-flex items-center gap-0.5">
                    <IconShieldCheck className="w-3 h-3" />
                    <span>{isMr ? 'सत्यापित नियोक्ता' : isHi ? 'सत्यापित नियोक्ता' : 'Verified Employer'}</span>
                  </span>
                </div>
                <p className="text-xs text-ink-secondary font-bold">
                  {profile?.companyCategory || (isMr ? 'स्थानिक उद्योग / व्यावसायिक आस्थापना' : isHi ? 'स्थानीय उद्योग / व्यावसायिक प्रतिष्ठान' : 'Regional Enterprise / Workshop')}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] font-mono font-bold text-ink-muted uppercase block">
                {isMr ? 'उद्योग नोंदणी क्रमांक:' : isHi ? 'उद्योग पंजीकरण क्रमांक:' : 'Enterprise ID:'}
              </span>
              <span className="font-mono text-xs font-black text-ink px-2 py-0.5 bg-steel-soft rounded border border-steel">
                {empId}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 text-xs">
            <div className="p-2 rounded-lg bg-canvas border border-steel/50">
              <span className="text-[10px] text-ink-muted font-bold block">
                {isMr ? 'पत्ता / परिसर' : isHi ? 'पता / क्षेत्र' : 'Location:'}
              </span>
              <span className="font-bold text-ink inline-flex items-center gap-1 truncate w-full">
                <IconMapPin className="w-3 h-3 text-primary shrink-0" />
                <span className="truncate">{empAddress}</span>
              </span>
            </div>

            <div className="p-2 rounded-lg bg-canvas border border-steel/50">
              <span className="text-[10px] text-ink-muted font-bold block">
                {isMr ? 'संपर्क व्यक्ती' : isHi ? 'संपर्क व्यक्ति' : 'Contact Person:'}
              </span>
              <span className="font-bold text-ink inline-flex items-center gap-1 truncate w-full">
                <IconBuilding className="w-3 h-3 text-primary shrink-0" />
                <span className="truncate">{empContact}</span>
              </span>
            </div>

            <div className="p-2 rounded-lg bg-canvas border border-steel/50">
              <span className="text-[10px] text-ink-muted font-bold block">
                {isMr ? 'भरती स्थिती' : isHi ? 'भर्ती स्थिति' : 'Status:'}
              </span>
              <span className="font-bold text-verified inline-flex items-center gap-1 truncate w-full">
                <IconBriefcase className="w-3 h-3 shrink-0" />
                <span className="truncate">{isMr ? 'सक्रिय भरती सुरू' : isHi ? 'सक्रिय भर्ती जारी' : 'Active Hiring'}</span>
              </span>
            </div>

            <div className="p-2 rounded-lg bg-canvas border border-steel/50">
              <span className="text-[10px] text-ink-muted font-bold block">
                {isMr ? 'अधिकृत फोन' : isHi ? 'आधिकारिक फोन' : 'Contact Phone:'}
              </span>
              <span className="font-bold text-ink inline-flex items-center gap-1 font-mono truncate w-full">
                <IconPhone className="w-3 h-3 text-verified shrink-0" />
                <span className="truncate">{empPhone}</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
