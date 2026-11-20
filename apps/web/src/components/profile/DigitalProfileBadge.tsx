'use client';

import React from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
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
  const { user, userRole, preferredLocale } = useAuth();
  const activeRole = role || userRole || 'candidate';

  const isCandidate = activeRole === 'candidate';
  const isMr = preferredLocale === 'mr';
  const isHi = preferredLocale === 'hi';

  if (!user && !role) return null;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-2 border-ink shadow-solid ${
        compact ? 'p-3 bg-surface' : 'p-5 sm:p-6 bg-gradient-to-br from-surface via-surface-subtle to-canvas'
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
              <div className="w-12 h-12 rounded-xl bg-ink text-white flex items-center justify-center font-black text-lg shadow-solid-sm shrink-0 border border-ink">
                <span>RP</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-base font-black text-ink">
                    {user?.displayName || 'रमेश विष्णू पाटील (Ramesh Patil)'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-verified-bg text-verified border border-verified font-black text-[10px] inline-flex items-center gap-0.5">
                    <IconCheck className="w-3 h-3" />
                    <span>{isMr ? 'पडताळणी पूर्ण' : isHi ? 'सत्यापित' : 'Verified'}</span>
                  </span>
                </div>
                <p className="text-xs text-primary font-bold">
                  {isMr
                    ? 'प्रमाणित MIG/MAG वेल्डर व फॅब्रिकेटर'
                    : isHi
                    ? 'प्रमाणित MIG/MAG वेल्डर व फैब्रिकेटर'
                    : 'Certified MIG/MAG Welder & Fabricator'}
                </p>
              </div>
            </div>

            {/* Unique Rojgar ID */}
            <div className="text-left sm:text-right">
              <span className="text-[10px] font-mono font-bold text-ink-muted uppercase block">
                {isMr ? 'डिजिटल ओळख क्रमांक:' : 'Credential ID:'}
              </span>
              <span className="font-mono text-xs font-black text-ink px-2 py-0.5 bg-steel-soft rounded border border-steel">
                RM-VID-2026-8941
              </span>
            </div>
          </div>

          {/* Core Credentials & Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 text-xs">
            <div className="p-2 rounded-lg bg-canvas border border-steel/50">
              <span className="text-[10px] text-ink-muted font-bold block">
                {isMr ? 'परिसर / MIDC' : 'Location:'}
              </span>
              <span className="font-bold text-ink inline-flex items-center gap-1">
                <IconMapPin className="w-3 h-3 text-primary shrink-0" />
                <span className="truncate">हिंगणा / बुटीबोरी</span>
              </span>
            </div>

            <div className="p-2 rounded-lg bg-canvas border border-steel/50">
              <span className="text-[10px] text-ink-muted font-bold block">
                {isMr ? 'कामाचा अनुभव' : 'Experience:'}
              </span>
              <span className="font-bold text-ink inline-flex items-center gap-1">
                <IconClock className="w-3 h-3 text-primary shrink-0" />
                <span>२४ महिने (2 Yrs)</span>
              </span>
            </div>

            <div className="p-2 rounded-lg bg-canvas border border-steel/50">
              <span className="text-[10px] text-ink-muted font-bold block">
                {isMr ? 'प्रशिक्षण पात्रता' : 'Qualification:'}
              </span>
              <span className="font-bold text-ink inline-flex items-center gap-1">
                <IconGraduationCap className="w-3 h-3 text-primary shrink-0" />
                <span className="truncate">१०वी + ITI Welder</span>
              </span>
            </div>

            <div className="p-2 rounded-lg bg-canvas border border-steel/50">
              <span className="text-[10px] text-ink-muted font-bold block">
                {isMr ? 'संपर्क मोबाईल' : 'Phone:'}
              </span>
              <span className="font-bold text-ink inline-flex items-center gap-1 font-mono">
                <IconPhone className="w-3 h-3 text-verified shrink-0" />
                <span>9876543210</span>
              </span>
            </div>
          </div>

          {/* Verified Skills Tags */}
          <div className="mt-3 flex flex-wrap gap-1.5 items-center">
            <span className="text-[11px] font-bold text-ink-muted mr-1">
              {isMr ? 'प्रमाणित कौशल्ये:' : 'Verified Skills:'}
            </span>
            {['MIG वेल्डिंग (MIG/MAG)', 'आर्क वेल्डिंग (Arc)', 'शीट मेटल फॅब्रिकेशन', 'लेथ मशिनिंग'].map(
              (sk, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-full bg-steel-soft border border-steel/70 text-ink text-[10px] font-bold"
                >
                  ✓ {sk}
                </span>
              )
            )}
          </div>
        </div>
      ) : (
        /* EMPLOYER DIGITAL PROFILE BADGE */
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-steel/60">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-900 text-white flex items-center justify-center font-black text-lg shadow-solid-sm shrink-0 border border-blue-950">
                <span>MM</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-base font-black text-ink">
                    Mahindra & Mahindra Ltd. (Hingna Plant)
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-verified-bg text-verified border border-verified font-black text-[10px] inline-flex items-center gap-0.5">
                    <IconShieldCheck className="w-3 h-3" />
                    <span>{isMr ? 'MIDC नोंदणीकृत' : 'MIDC Verified'}</span>
                  </span>
                </div>
                <p className="text-xs text-ink-secondary font-bold">
                  {isMr
                    ? 'वाहन व कृषी अवजड यंत्रसामग्री उत्पादन प्रकल्प (Automotive & Manufacturing)'
                    : 'Farm Equipment Sector & Heavy Machinery Plant'}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] font-mono font-bold text-ink-muted uppercase block">
                Enterprise ID:
              </span>
              <span className="font-mono text-xs font-black text-ink px-2 py-0.5 bg-steel-soft rounded border border-steel">
                RM-EMP-3319
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 text-xs">
            <div className="p-2 rounded-lg bg-canvas border border-steel/50">
              <span className="text-[10px] text-ink-muted font-bold block">
                {isMr ? 'कारखाना पत्ता' : 'Plant Address:'}
              </span>
              <span className="font-bold text-ink inline-flex items-center gap-1">
                <IconMapPin className="w-3 h-3 text-primary shrink-0" />
                <span className="truncate">Plot P-15, Hingna MIDC</span>
              </span>
            </div>

            <div className="p-2 rounded-lg bg-canvas border border-steel/50">
              <span className="text-[10px] text-ink-muted font-bold block">
                {isMr ? 'एचआर संपर्क' : 'HR Lead:'}
              </span>
              <span className="font-bold text-ink inline-flex items-center gap-1">
                <IconBuilding className="w-3 h-3 text-primary shrink-0" />
                <span className="truncate">विवेक शर्मा (HR Head)</span>
              </span>
            </div>

            <div className="p-2 rounded-lg bg-canvas border border-steel/50">
              <span className="text-[10px] text-ink-muted font-bold block">
                {isMr ? 'सक्रिय भरती' : 'Active Openings:'}
              </span>
              <span className="font-bold text-verified inline-flex items-center gap-1">
                <IconBriefcase className="w-3 h-3 shrink-0" />
                <span>३ पदे • २५ जागा</span>
              </span>
            </div>

            <div className="p-2 rounded-lg bg-canvas border border-steel/50">
              <span className="text-[10px] text-ink-muted font-bold block">
                {isMr ? 'अधिकृत फोन' : 'Contact Phone:'}
              </span>
              <span className="font-bold text-ink inline-flex items-center gap-1 font-mono">
                <IconPhone className="w-3 h-3 text-verified shrink-0" />
                <span>9823012345</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
