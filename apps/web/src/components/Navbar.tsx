'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { getDictionary, SupportedLocale } from '@rojgarmitra/i18n';

export function Navbar() {
  const pathname = usePathname();
  const { preferredLocale, setLocale, user, userRole, logOut } = useAuth();
  const dict = getDictionary(preferredLocale);

  const isCandidate = pathname?.startsWith('/candidate');
  const isEmployer = pathname?.startsWith('/employer');

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🌾</span>
              <div>
                <span className="text-xl font-black text-slate-900 tracking-tight">
                  रोजगार<span className="text-emerald-600">मित्र</span>
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                  RojgarMitra
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              href="/candidate"
              className={`hover:text-emerald-600 transition ${
                isCandidate ? 'text-emerald-600 font-bold' : 'text-slate-600'
              }`}
            >
              {dict.nav.candidate}
            </Link>

            <Link
              href="/candidate/applications"
              className="text-slate-600 hover:text-emerald-600 transition"
            >
              {dict.nav.applications}
            </Link>

            <Link
              href="/candidate/upskilling"
              className="text-slate-600 hover:text-emerald-600 transition"
            >
              {dict.nav.upskilling}
            </Link>

            <Link
              href="/candidate/career"
              className="text-slate-600 hover:text-emerald-600 transition"
            >
              {dict.nav.career}
            </Link>

            <span className="text-slate-300">|</span>

            <Link
              href="/employer"
              className={`hover:text-emerald-600 transition ${
                isEmployer ? 'text-emerald-600 font-bold' : 'text-slate-600'
              }`}
            >
              {dict.nav.employer}
            </Link>
          </nav>

          {/* Right Actions: Language Switcher & Auth */}
          <div className="flex items-center gap-3">
            {/* Locale Selector */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1 text-xs font-semibold">
              <button
                onClick={() => setLocale('mr')}
                className={`px-2 py-1 rounded ${
                  preferredLocale === 'mr'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                मराठी
              </button>
              <button
                onClick={() => setLocale('hi')}
                className={`px-2 py-1 rounded ${
                  preferredLocale === 'hi'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => setLocale('en')}
                className={`px-2 py-1 rounded ${
                  preferredLocale === 'en'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                English
              </button>
            </div>

            {user ? (
              <button
                onClick={() => logOut()}
                className="text-xs font-medium text-slate-500 hover:text-red-600 px-2 py-1 rounded border border-slate-200"
              >
                {dict.nav.logout}
              </button>
            ) : (
              <Link
                href="/candidate/onboarding"
                className="text-xs font-bold bg-emerald-600 text-white px-3 py-1.5 rounded-lg shadow-sm hover:bg-emerald-700 transition"
              >
                {dict.nav.register}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
