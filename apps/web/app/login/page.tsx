'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { getDictionary, SupportedLocale } from '@rojgarmitra/i18n';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, resetPassword, preferredLocale, user } = useAuth();
  const dict = getDictionary(preferredLocale);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Friendly error mapping
  const getFriendlyError = (errCode: string, locale: SupportedLocale): string => {
    if (errCode.includes('user-not-found') || errCode.includes('invalid-credential') || errCode.includes('wrong-password')) {
      return locale === 'mr'
        ? 'ईमेल किंवा पासवर्ड चुकीचा आहे. कृपया पुन्हा तपासा.'
        : locale === 'hi'
        ? 'ईमेल या पासवर्ड गलत है। कृपया दोबारा जाँचें।'
        : 'Invalid email or password. Please verify and try again.';
    }
    if (errCode.includes('invalid-email')) {
      return locale === 'mr'
        ? 'कृपया वैध ईमेल पत्ता टाका.'
        : locale === 'hi'
        ? 'कृपया मान्य ईमेल पता दर्ज करें।'
        : 'Please enter a valid email address.';
    }
    if (errCode.includes('too-many-requests')) {
      return locale === 'mr'
        ? 'अनेक अयशस्वी प्रयत्नांमुळे खाते तात्पुरते ब्लॉक झाले आहे. कृपया थोड्या वेळाने प्रयत्न करा.'
        : locale === 'hi'
        ? 'कई असफल प्रयासों के कारण खाता अस्थायी रूप से लॉक है। कृपया थोड़ी देर बाद प्रयास करें।'
        : 'Too many attempts. Please try again after a few minutes.';
    }
    return locale === 'mr'
      ? 'लॉगिन करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.'
      : locale === 'hi'
      ? 'लॉगिन में त्रुटि हुई। कृपया दोबारा प्रयास करें।'
      : 'Sign in failed. Please try again.';
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      await signIn(email.trim(), password);
      // Determine redirection: default to candidate dashboard
      router.push('/candidate');
    } catch (err: any) {
      console.error('Sign in error:', err);
      setErrorMsg(getFriendlyError(err?.code || '', preferredLocale));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg(
        preferredLocale === 'mr'
          ? 'कृपया आपला ईमेल पत्ता टाका.'
          : 'Please enter your registered email address.'
      );
      return;
    }
    setResetLoading(true);
    setErrorMsg(null);

    try {
      await resetPassword(email.trim());
      setResetSent(true);
    } catch (err: any) {
      setErrorMsg(getFriendlyError(err?.code || '', preferredLocale));
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <main className="min-h-[75vh] flex items-center justify-center py-10 px-4">
      <div className="max-w-md w-full">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-secondary hover:text-ink mb-6 transition"
        >
          ← {dict.common.back} {dict.nav.home}
        </Link>

        {/* Card */}
        <div className="settle-card-hero p-6 sm:p-8">
          <div className="text-center mb-6">
            <span className="text-3xl mb-2 inline-block">🌾</span>
            <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
              {dict.nav.login}
            </h1>
            <p className="text-xs text-ink-secondary mt-1 font-medium">
              {preferredLocale === 'mr'
                ? 'आपल्या रोजगारमित्र खात्यात प्रवेश करा'
                : preferredLocale === 'hi'
                ? 'अपने रोजगारमित्र खाते में प्रवेश करें'
                : 'Sign in to your RojgarMitra account'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-alert-bg border border-alert-border text-alert text-xs font-bold flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {resetSent ? (
            <div className="p-4 rounded-xl bg-verified-bg border border-verified-border text-verified text-xs font-bold text-center space-y-2">
              <p>
                {preferredLocale === 'mr'
                  ? '✓ पासवर्ड रीसेट लिंक आपल्या ईमेलवर पाठवली आहे. कृपया आपला इनबॉक्स तपासा.'
                  : preferredLocale === 'hi'
                  ? '✓ पासवर्ड रीसेट लिंक आपके ईमेल पर भेज दी गई है।'
                  : '✓ Password reset link has been sent to your email.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setResetSent(false);
                  setShowForgot(false);
                }}
                className="text-primary underline text-xs mt-2 block mx-auto"
              >
                {preferredLocale === 'mr' ? 'लॉगिनकडे परत जा' : 'Back to login'}
              </button>
            </div>
          ) : showForgot ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                  नोंदणीकृत ईमेल (Registered Email)
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ramesh@example.com"
                  className="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="flex-1 settle-pill-btn text-xs py-2.5"
                >
                  {resetLoading
                    ? dict.common.loading
                    : preferredLocale === 'mr'
                    ? 'रीसेट लिंक पाठवा'
                    : 'Send Reset Link'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForgot(false)}
                  className="px-4 py-2 text-xs font-bold text-ink-secondary hover:text-ink"
                >
                  {dict.common.cancel}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                  ईमेल पत्ता (Email)
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ramesh@example.com"
                  className="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-ink uppercase tracking-wider">
                    पासवर्ड (Password)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-[11px] font-bold text-primary hover:underline"
                  >
                    {preferredLocale === 'mr'
                      ? 'पासवर्ड विसरलात?'
                      : preferredLocale === 'hi'
                      ? 'पासवर्ड भूल गए?'
                      : 'Forgot Password?'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-xs text-ink-muted hover:text-ink"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full settle-pill-btn text-sm py-3 mt-2 block text-center"
              >
                {loading ? dict.common.loading : `${dict.nav.login} ➔`}
              </button>
            </form>
          )}

          {/* Switch to Signup */}
          <div className="mt-6 pt-5 border-t border-steel/40 text-center">
            <p className="text-xs text-ink-secondary font-medium">
              {preferredLocale === 'mr'
                ? 'अद्याप खाते नाही?'
                : preferredLocale === 'hi'
                ? 'अभी तक खाता नहीं है?'
                : "Don't have an account yet?"}{' '}
              <Link
                href="/signup"
                className="font-bold text-primary hover:underline ml-1"
              >
                {preferredLocale === 'mr'
                  ? 'येथे नवीन नोंदणी करा'
                  : preferredLocale === 'hi'
                  ? 'यहाँ नया खाता बनाएं'
                  : 'Sign up here'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
