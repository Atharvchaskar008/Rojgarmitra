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
                  विदर्भ पायलट
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-bold">
            <Link
              href="/candidate"
              className={`transition rounded-full px-3.5 py-1.5 border inline-flex items-center gap-1.5 ${
                isCandidate && !pathname.includes('applications') && !pathname.includes('upskilling') && !pathname.includes('career')
                  ? 'bg-ink text-white border-ink shadow-solid-sm'
                  : 'text-ink border-transparent hover:bg-steel-soft/60'
              }`}
            >
              <IconBriefcase className="w-3.5 h-3.5" />
              <span>{dict.nav.jobs}</span>
            </Link>

            <Link
              href="/candidate/applications"
              className={`transition rounded-full px-3 py-1.5 border ${
                pathname === '/candidate/applications'
                  ? 'bg-ink text-white border-ink shadow-solid-sm'
                  : 'text-ink-secondary border-transparent hover:text-ink hover:bg-steel-soft/60'
              }`}
            >
              {dict.nav.applications}
            </Link>

            <Link
              href="/candidate/upskilling"
              className={`transition rounded-full px-3 py-1.5 border inline-flex items-center gap-1 ${
                pathname === '/candidate/upskilling'
                  ? 'bg-ink text-white border-ink shadow-solid-sm'
                  : 'text-ink-secondary border-transparent hover:text-ink hover:bg-steel-soft/60'
              }`}
            >
              <IconGraduationCap className="w-3.5 h-3.5" />
              <span>{dict.nav.upskilling}</span>
            </Link>

            <Link
              href="/candidate/career"
              className={`transition rounded-full px-3 py-1.5 border inline-flex items-center gap-1 ${
                pathname === '/candidate/career'
                  ? 'bg-ink text-white border-ink shadow-solid-sm'
                  : 'text-ink-secondary border-transparent hover:text-ink hover:bg-steel-soft/60'
              }`}
            >
              <IconCompass className="w-3.5 h-3.5" />
              <span>{dict.nav.career}</span>
            </Link>

            <span className="text-steel/60 px-1">|</span>

            <Link
              href="/employer"
              className={`transition rounded-full px-3.5 py-1.5 border inline-flex items-center gap-1.5 ${
                isEmployer
                  ? 'bg-ink text-white border-ink shadow-solid-sm'
                  : 'text-ink-secondary border-transparent hover:text-ink hover:bg-steel-soft/60'
              }`}
            >
              <IconBuilding className="w-3.5 h-3.5" />
              <span>{dict.nav.employer}</span>
            </Link>
          </nav>

          {/* Right Actions: Language Switcher & Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Locale Selector */}
            <div className="flex items-center bg-canvas rounded-full p-0.5 border border-ink/20 shadow-sm text-xs font-bold">
              <button
                type="button"
                onClick={() => setLocale('mr')}
                className={`px-2.5 py-1 rounded-full transition ${
                  preferredLocale === 'mr'
                    ? 'bg-ink text-white shadow-solid-sm'
                    : 'text-ink-secondary hover:text-ink'
                }`}
              >
                मराठी
              </button>
              <button
                type="button"
                onClick={() => setLocale('hi')}
                className={`px-2.5 py-1 rounded-full transition ${
                  preferredLocale === 'hi'
                    ? 'bg-ink text-white shadow-solid-sm'
                    : 'text-ink-secondary hover:text-ink'
                }`}
              >
                हिन्दी
              </button>
              <button
                type="button"
                onClick={() => setLocale('en')}
                className={`px-2.5 py-1 rounded-full transition ${
                  preferredLocale === 'en'
                    ? 'bg-ink text-white shadow-solid-sm'
                    : 'text-ink-secondary hover:text-ink'
                }`}
              >
                EN
              </button>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden sm:flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-ink bg-steel-soft px-2.5 py-1 rounded-full border border-steel inline-flex items-center gap-1">
                    {userRole === 'employer' ? <IconBuilding className="w-3 h-3" /> : <IconUser className="w-3 h-3" />}
                    <span>{userRole === 'employer' ? 'नियोक्ता' : 'उमेदवार'}</span>
                  </span>
                  <button
                    onClick={() => logOut()}
                    className="text-xs font-bold text-ink-secondary hover:text-alert px-3 py-1.5 rounded-full border border-ink/20 hover:border-alert transition"
                  >
                    {dict.nav.logout}
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-xs font-bold text-ink hover:text-primary px-3 py-1.5 rounded-full border border-ink/20 hover:border-ink transition"
                  >
                    {dict.nav.login}
                  </Link>
                  <Link
                    href="/signup"
                    className="settle-pill-btn text-xs px-3.5 py-1.5"
                  >
                    {dict.nav.register}
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl border border-ink/20 text-ink hover:bg-steel-soft transition text-xs font-bold"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-2 border-ink bg-surface p-4 space-y-3 shadow-solid animate-in slide-in-from-top-2">
          <nav className="flex flex-col gap-1 text-sm font-bold">
            <Link
              href="/candidate"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl hover:bg-steel-soft text-ink flex items-center justify-between"
            >
              <span className="inline-flex items-center gap-2">
                <IconBriefcase className="w-4 h-4 text-primary" />
                <span>{dict.nav.jobs}</span>
              </span>
              <IconArrowRight className="w-3.5 h-3.5 text-ink-muted" />
            </Link>
            <Link
              href="/candidate/applications"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl hover:bg-steel-soft text-ink flex items-center justify-between"
            >
              <span className="inline-flex items-center gap-2">
                <IconBriefcase className="w-4 h-4 text-primary" />
                <span>{dict.nav.applications}</span>
              </span>
              <IconArrowRight className="w-3.5 h-3.5 text-ink-muted" />
            </Link>
            <Link
              href="/candidate/upskilling"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl hover:bg-steel-soft text-ink flex items-center justify-between"
            >
              <span className="inline-flex items-center gap-2">
                <IconGraduationCap className="w-4 h-4 text-primary" />
                <span>{dict.nav.upskilling}</span>
              </span>
              <IconArrowRight className="w-3.5 h-3.5 text-ink-muted" />
            </Link>
            <Link
              href="/candidate/career"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl hover:bg-steel-soft text-ink flex items-center justify-between"
            >
              <span className="inline-flex items-center gap-2">
                <IconCompass className="w-4 h-4 text-primary" />
                <span>{dict.nav.career}</span>
              </span>
              <IconArrowRight className="w-3.5 h-3.5 text-ink-muted" />
            </Link>
            <Link
              href="/employer"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl hover:bg-steel-soft text-ink flex items-center justify-between border-t border-steel/40 mt-1 pt-2"
            >
              <span className="inline-flex items-center gap-2">
                <IconBuilding className="w-4 h-4 text-primary" />
                <span>{dict.nav.employer}</span>
              </span>
              <IconArrowRight className="w-3.5 h-3.5 text-ink-muted" />
            </Link>
          </nav>

          <div className="pt-3 border-t border-steel/40 flex flex-col gap-2">
            {user ? (
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink">
                  {user.email || user.phoneNumber || 'उपयोगकर्ता'}
                </span>
                <button
                  onClick={() => {
                    logOut();
                    setMobileMenuOpen(false);
                  }}
                  className="settle-pill-btn text-xs py-1.5 px-4 bg-alert border-alert hover:bg-alert/90"
                >
                  {dict.nav.logout}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="settle-pill-btn bg-white text-ink border-ink hover:bg-steel-soft text-xs py-2 text-center"
                >
                  {dict.nav.login}
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="settle-pill-btn text-xs py-2 text-center"
                >
                  {dict.nav.register}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
