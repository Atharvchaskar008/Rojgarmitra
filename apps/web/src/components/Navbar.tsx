'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { getDictionary } from '@rojgarmitra/i18n';
import {
  IconBriefcase,
  IconBuilding,
  IconGraduationCap,
  IconCompass,
  IconUser,
  IconArrowRight
} from '@/components/icons';

export function Navbar() {
  const pathname = usePathname();
  const { preferredLocale, setLocale, user, userRole, logOut } = useAuth();
  const dict = getDictionary(preferredLocale);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLanding = pathname === '/';
  const isCandidate = pathname?.startsWith('/candidate');
  const isEmployer = pathname?.startsWith('/employer');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-ink shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="font-mono text-xs bg-ink text-white px-2.5 py-1 rounded-md font-black tracking-wider group-hover:bg-primary transition">
                RM
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-ink tracking-tight">
                  रोजगार<span className="text-primary">मित्र</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold px-2.5 py-0.5 bg-steel-soft text-steel-deep rounded-full border border-steel">
                  विदर्भ
                </span>
              </div>
            </Link>
          </div>

          {/* Contextual Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-bold">
            {isLanding ? (
              <>
                <a
                  href="#how"
                  className="transition rounded-full px-3.5 py-1.5 text-ink-secondary border border-transparent hover:text-ink hover:bg-steel-soft/60"
                >
                  {preferredLocale === 'mr' ? 'कसे काम करते' : preferredLocale === 'hi' ? 'कैसे काम करता है' : 'How It Works'}
                </a>
                <a
                  href="#jobseekers"
                  className="transition rounded-full px-3.5 py-1.5 text-ink-secondary border border-transparent hover:text-ink hover:bg-steel-soft/60"
                >
                  {preferredLocale === 'mr' ? 'उमेदवारांसाठी' : preferredLocale === 'hi' ? 'उम्मीदवारों के लिए' : 'For Jobseekers'}
                </a>
                <a
                  href="#employers"
                  className="transition rounded-full px-3.5 py-1.5 text-ink-secondary border border-transparent hover:text-ink hover:bg-steel-soft/60"
                >
                  {preferredLocale === 'mr' ? 'नियोक्त्यांसाठी' : preferredLocale === 'hi' ? 'नियोक्ताओं के लिए' : 'For Employers'}
                </a>
                <a
                  href="#faq"
                  className="transition rounded-full px-3.5 py-1.5 text-ink-secondary border border-transparent hover:text-ink hover:bg-steel-soft/60"
                >
                  {preferredLocale === 'mr' ? 'वारंवार विचारले जाणारे प्रश्न' : preferredLocale === 'hi' ? 'अक्सर पूछे जाने वाले सवाल' : 'FAQ'}
                </a>
              </>
            ) : isCandidate ? (
              <>
                <Link
                  href="/candidate"
                  className={`transition rounded-full px-3.5 py-1.5 border inline-flex items-center gap-1.5 ${pathname === '/candidate'
                    ? 'bg-ink text-white border-ink shadow-solid-sm'
                    : 'text-ink border-transparent hover:bg-steel-soft/60'
                    }`}
                >
                  <IconBriefcase className="w-3.5 h-3.5" />
                  <span>{dict.nav.jobs}</span>
                </Link>

                <Link
                  href="/candidate/applications"
                  className={`transition rounded-full px-3 py-1.5 border ${pathname === '/candidate/applications'
                    ? 'bg-ink text-white border-ink shadow-solid-sm'
                    : 'text-ink-secondary border-transparent hover:text-ink hover:bg-steel-soft/60'
                    }`}
                >
                  {dict.nav.applications}
                </Link>

                <Link
                  href="/candidate/upskilling"
                  className={`transition rounded-full px-3 py-1.5 border inline-flex items-center gap-1 ${pathname === '/candidate/upskilling'
                    ? 'bg-ink text-white border-ink shadow-solid-sm'
                    : 'text-ink-secondary border-transparent hover:text-ink hover:bg-steel-soft/60'
                    }`}
                >
                  <IconGraduationCap className="w-3.5 h-3.5" />
                  <span>{dict.nav.upskilling}</span>
                </Link>

                <Link
                  href="/candidate/career"
                  className={`transition rounded-full px-3 py-1.5 border inline-flex items-center gap-1 ${pathname === '/candidate/career'
                    ? 'bg-ink text-white border-ink shadow-solid-sm'
                    : 'text-ink-secondary border-transparent hover:text-ink hover:bg-steel-soft/60'
                    }`}
                >
                  <IconCompass className="w-3.5 h-3.5" />
                  <span>{dict.nav.career}</span>
                </Link>
              </>
            ) : isEmployer ? (
              <>
                <Link
                  href="/employer"
                  className={`transition rounded-full px-3.5 py-1.5 border inline-flex items-center gap-1.5 ${pathname === '/employer'
                    ? 'bg-ink text-white border-ink shadow-solid-sm'
                    : 'text-ink border-transparent hover:bg-steel-soft/60'
                    }`}
                >
                  <IconBuilding className="w-3.5 h-3.5" />
                  <span>{dict.nav.employer} Dashboard</span>
                </Link>

                <Link
                  href="/employer/post"
                  className={`transition rounded-full px-3.5 py-1.5 border inline-flex items-center gap-1.5 ${pathname === '/employer/post'
                    ? 'bg-ink text-white border-ink shadow-solid-sm'
                    : 'text-ink-secondary border-transparent hover:text-ink hover:bg-steel-soft/60'
                    }`}
                >
                  <span>+ {dict.employer.post_new_job}</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/candidate"
                  className="transition rounded-full px-3.5 py-1.5 text-ink-secondary hover:text-ink hover:bg-steel-soft/60"
                >
                  {dict.nav.jobs}
                </Link>
                <Link
                  href="/employer"
                  className="transition rounded-full px-3.5 py-1.5 text-ink-secondary hover:text-ink hover:bg-steel-soft/60"
                >
                  {dict.nav.employer}
                </Link>
              </>
            )}
          </nav>

          {/* Right Actions: Language Switcher & Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Locale Selector */}
            <div className="flex items-center bg-canvas rounded-full p-0.5 border border-ink/20 shadow-sm text-xs font-bold">
              <button
                type="button"
                onClick={() => setLocale('mr')}
                className={`px-2 sm:px-2.5 py-1 rounded-full transition text-[11px] sm:text-xs ${preferredLocale === 'mr'
                  ? 'bg-ink text-white shadow-solid-sm'
                  : 'text-ink-secondary hover:text-ink'
                  }`}
              >
                मराठी
              </button>
              <button
                type="button"
                onClick={() => setLocale('hi')}
                className={`px-2 sm:px-2.5 py-1 rounded-full transition text-[11px] sm:text-xs ${preferredLocale === 'hi'
                  ? 'bg-ink text-white shadow-solid-sm'
                  : 'text-ink-secondary hover:text-ink'
                  }`}
              >
                हिंदी
              </button>
              <button
                type="button"
                onClick={() => setLocale('en')}
                className={`px-2 sm:px-2.5 py-1 rounded-full transition text-[11px] sm:text-xs ${preferredLocale === 'en'
                  ? 'bg-ink text-white shadow-solid-sm'
                  : 'text-ink-secondary hover:text-ink'
                  }`}
              >
                EN
              </button>
            </div>

            {/* User Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-2">
                {/* User Role Tag */}
                <span className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-steel-soft text-ink border border-steel">
                  <IconUser className="w-3.5 h-3.5" />
                  <span className="capitalize">{userRole || 'Candidate'}</span>
                </span>

                {/* Dashboard Shortcut if on landing page */}
                {isLanding && (
                  <Link
                    href={userRole === 'employer' ? '/employer' : '/candidate'}
                    className="settle-pill-btn text-xs px-3.5 py-1.5 inline-flex items-center gap-1 font-bold"
                  >
                    <span>{userRole === 'employer' ? 'Employer Portal' : 'Candidate Portal'}</span>
                    <IconArrowRight className="w-3 h-3" />
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => logOut()}
                  className="settle-pill-chip text-xs px-3 py-1 font-bold hover:bg-alert-bg hover:text-alert hover:border-alert transition"
                >
                  {dict.nav.logout}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  href="/login"
                  className="settle-pill-btn text-xs px-2.5 sm:px-4 py-1.5 font-bold inline-flex items-center gap-1 sm:gap-1.5 shadow-solid-sm"
                >
                  <IconUser className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {preferredLocale === 'mr'
                      ? 'प्रवेश / नोंदणी'
                      : preferredLocale === 'hi'
                      ? 'प्रवेश / पंजीकरण'
                      : 'Sign In / Register'}
                  </span>
                  <span className="sm:hidden">
                    {preferredLocale === 'mr'
                      ? 'प्रवेश'
                      : preferredLocale === 'hi'
                      ? 'प्रवेश'
                      : 'Sign In'}
                  </span>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg border border-ink/20 text-ink hover:bg-steel-soft transition"
              aria-label="Toggle navigation menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Role Mismatch Banner (If Employer visits Candidate or Vice-Versa) */}
      {user && userRole === 'employer' && isCandidate && (
        <div className="bg-steel-soft border-t border-b border-steel px-4 py-2 text-center text-xs font-semibold text-ink flex items-center justify-center gap-2">
          <span>आपण नियोक्ता (Employer) म्हणून लॉगिन आहात.</span>
          <Link href="/employer" className="text-primary font-bold underline hover:text-primary-hover inline-flex items-center gap-0.5">
            <span>नियोक्ता डॅशबोर्डवर जा</span>
            <IconArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}
      {user && userRole === 'candidate' && isEmployer && (
        <div className="bg-steel-soft border-t border-b border-steel px-4 py-2 text-center text-xs font-semibold text-ink flex items-center justify-center gap-2">
          <span>हा विभाग केवळ नियोक्त्यांसाठी (Employers) आहे.</span>
          <Link href="/candidate" className="text-primary font-bold underline hover:text-primary-hover inline-flex items-center gap-0.5">
            <span>उमेदवार पोर्टलवर जा</span>
            <IconArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-2 border-ink bg-white px-4 pt-3 pb-5 space-y-2 animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col gap-1 text-sm font-bold">
            {isLanding ? (
              <>
                <a
                  href="#how"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-ink hover:bg-steel-soft"
                >
                  {preferredLocale === 'mr' ? 'कसे काम करते' : 'How It Works'}
                </a>
                <a
                  href="#jobseekers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-ink hover:bg-steel-soft"
                >
                  {preferredLocale === 'mr' ? 'उमेदवारांसाठी' : 'For Jobseekers'}
                </a>
                <a
                  href="#employers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-ink hover:bg-steel-soft"
                >
                  {preferredLocale === 'mr' ? 'नियोक्त्यांसाठी' : 'For Employers'}
                </a>
                <a
                  href="#faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-ink hover:bg-steel-soft"
                >
                  {preferredLocale === 'mr' ? 'वारंवार विचारले जाणारे प्रश्न' : 'FAQ'}
                </a>
              </>
            ) : (
              <>
                <Link
                  href="/candidate"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-ink hover:bg-steel-soft inline-flex items-center gap-2"
                >
                  <IconBriefcase className="w-4 h-4" />
                  <span>{dict.nav.jobs}</span>
                </Link>
                <Link
                  href="/candidate/applications"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-ink hover:bg-steel-soft"
                >
                  {dict.nav.applications}
                </Link>
                <Link
                  href="/candidate/upskilling"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-ink hover:bg-steel-soft inline-flex items-center gap-2"
                >
                  <IconGraduationCap className="w-4 h-4" />
                  <span>{dict.nav.upskilling}</span>
                </Link>
                <Link
                  href="/candidate/career"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-ink hover:bg-steel-soft inline-flex items-center gap-2"
                >
                  <IconCompass className="w-4 h-4" />
                  <span>{dict.nav.career}</span>
                </Link>
                <div className="pt-2 border-t border-steel/40">
                  <Link
                    href="/employer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-ink hover:bg-steel-soft inline-flex items-center gap-2"
                  >
                    <IconBuilding className="w-4 h-4" />
                    <span>{dict.nav.employer}</span>
                  </Link>
                </div>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
