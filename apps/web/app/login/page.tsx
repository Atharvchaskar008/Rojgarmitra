'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { getDictionary, SupportedLocale } from '@rojgarmitra/i18n';
import { ArtisanWorkshopArt } from '@/components/illustrations/ArtisanWorkshopArt';
import { 
  IconGoogle, 
  IconPhone, 
  IconMail, 
  IconLock, 
  IconArrowLeft, 
  IconArrowRight, 
  IconEye, 
  IconEyeOff, 
  IconAlertCircle, 
  IconCheckCircle 
} from '@/components/icons';
import type { ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';

export default function LoginPage() {
  const router = useRouter();
  const { 
    signIn, 
    signInWithGoogle, 
    setupRecaptcha, 
    sendPhoneOtp, 
    confirmPhoneOtp, 
    resetPassword, 
    preferredLocale 
  } = useAuth();
  const dict = getDictionary(preferredLocale);

  // Auth Method Mode: 'google_phone' | 'email'
  const [authMode, setAuthMode] = useState<'quick' | 'email'>('quick');

  // Email form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Phone form state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  // Global status
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Forgot password
  const [showForgot, setShowForgot] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Friendly error mapping
  const getFriendlyError = (errCode: string, locale: SupportedLocale): string => {
    if (errCode.includes('user-not-found') || errCode.includes('invalid-credential') || errCode.includes('wrong-password')) {
      return locale === 'mr'
        ? 'ईमेल किंवा पासवर्ड चुकीचा आहे. कृपया पुन्हा तपासा.'
        : locale === 'hi'
        ? 'ईमेल या पासवर्ड गलत है। कृपया दोबारा जाँचें।'
        : 'Invalid credentials. Please verify and try again.';
    }
    if (errCode.includes('invalid-verification-code') || errCode.includes('code-expired')) {
      return locale === 'mr'
        ? 'ओटीपी (OTP) चुकीचा किंवा कालबाह्य झाला आहे.'
        : locale === 'hi'
        ? 'दर्ज किया गया OTP गलत या समाप्त हो चुका है।'
        : 'Invalid or expired OTP code.';
    }
    if (errCode.includes('popup-closed-by-user')) {
      return locale === 'mr'
        ? 'Google लॉगिन रद्द केले गेले.'
        : 'Google sign-in was canceled.';
    }
    return locale === 'mr'
      ? 'लॉगिन करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.'
      : locale === 'hi'
      ? 'लॉगिन में त्रुटि हुई। कृपया दोबारा प्रयास करें।'
      : 'Sign in failed. Please try again.';
  };

  // 1. Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await signInWithGoogle('candidate');
      router.push('/candidate');
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setErrorMsg(getFriendlyError(err?.code || '', preferredLocale));
    } finally {
      setLoading(false);
    }
  };

  // 2. Phone OTP: Send Code
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMsg(
        preferredLocale === 'mr'
          ? 'कृपया वैध १०-अंकी मोबाईल नंबर टाका.'
          : 'Please enter a valid 10-digit mobile number.'
      );
      return;
    }

    setLoading(true);
    try {
      let verifier = recaptchaVerifier;
      if (!verifier) {
        verifier = setupRecaptcha('recaptcha-verifier-box');
        setRecaptchaVerifier(verifier);
      }

      const formatted = `+91${cleanPhone}`;
      const result = await sendPhoneOtp(formatted, verifier);
      setConfirmationResult(result);
    } catch (err: any) {
      console.error('Send OTP error:', err);
      setErrorMsg(getFriendlyError(err?.code || '', preferredLocale));
    } finally {
      setLoading(false);
    }
  };

  // 3. Phone OTP: Confirm Code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult || !otpCode.trim()) return;

    setErrorMsg(null);
    setLoading(true);
    try {
      await confirmPhoneOtp(confirmationResult, otpCode.trim(), 'candidate');
      router.push('/candidate');
    } catch (err: any) {
      console.error('OTP confirmation error:', err);
      setErrorMsg(getFriendlyError(err?.code || '', preferredLocale));
    } finally {
      setLoading(false);
    }
  };

  // 4. Email/Password Sign-In
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      await signIn(email.trim(), password);
      router.push('/candidate');
    } catch (err: any) {
      console.error('Email sign in error:', err);
      setErrorMsg(getFriendlyError(err?.code || '', preferredLocale));
    } finally {
      setLoading(false);
    }
  };

  // 5. Password Reset
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
    setLoading(true);
    setErrorMsg(null);
    try {
      await resetPassword(email.trim());
      setResetSent(true);
    } catch (err: any) {
      setErrorMsg(getFriendlyError(err?.code || '', preferredLocale));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[85vh] flex items-center justify-center py-8 px-4">
      {/* Invisible reCAPTCHA container for Phone Auth */}
      <div id="recaptcha-verifier-box" />

      <div className="max-w-4xl w-full bg-surface rounded-card border-2 border-ink shadow-solid-lg grid grid-cols-1 md:grid-cols-12 overflow-hidden">
        {/* Left Column: Authentic Sign-In Form (7 Cols) */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Top Back Link */}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-secondary hover:text-ink mb-6 transition"
            >
              <IconArrowLeft className="w-3.5 h-3.5" />
              <span>{dict.common.back} {dict.nav.home}</span>
            </Link>

            {/* Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-steel-soft border border-steel text-steel-deep text-[11px] font-bold mb-2">
                <span>सर्व उमेदवारांसाठी व नियोक्त्यांसाठी मुक्त</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
                {dict.nav.login}
              </h1>
              <p className="text-xs text-ink-secondary mt-1 font-medium">
                {preferredLocale === 'mr'
                  ? 'आपल्या रोजगारमित्र खात्यात प्रवेश करा — फोन, गुगल किंवा ईमेलद्वारे'
                  : preferredLocale === 'hi'
                  ? 'अपने रोजगारमित्र खाते में प्रवेश करें — फोन, गूगल या ईमेल से'
                  : 'Access your RojgarMitra account via Phone, Google or Email'}
              </p>
            </div>

            {errorMsg && (
              <div className="mb-5 p-3 rounded-xl bg-alert-bg border border-alert-border text-alert text-xs font-bold flex items-center gap-2">
                <IconAlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Auth Mode Toggle Tabs (Phone/Google vs Email) */}
            <div className="flex p-1 bg-canvas rounded-full border border-ink/20 mb-6 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('quick');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-1.5 rounded-full transition ${
                  authMode === 'quick'
                    ? 'bg-ink text-white shadow-solid-sm'
                    : 'text-ink-secondary hover:text-ink'
                }`}
              >
                Google / फोन OTP
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('email');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-1.5 rounded-full transition ${
                  authMode === 'email'
                    ? 'bg-ink text-white shadow-solid-sm'
                    : 'text-ink-secondary hover:text-ink'
                }`}
              >
                ईमेल व पासवर्ड
              </button>
            </div>

            {/* METHOD 1: QUICK AUTH (Google + Phone Number OTP) */}
            {authMode === 'quick' && (
              <div className="space-y-4">
                {/* Google Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full bg-white hover:bg-steel-soft text-ink font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl border-2 border-ink shadow-solid-sm transition flex items-center justify-center gap-2.5 active:translate-x-0.5 active:translate-y-0.5"
                >
                  <IconGoogle className="w-4 h-4" />
                  <span>Google ने साइन इन करा (Continue with Google)</span>
                </button>

                <div className="flex items-center gap-3 my-3">
                  <div className="flex-1 h-px bg-steel/60" />
                  <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
                    किंवा मोबाईल फोन नंबर
                  </span>
                  <div className="flex-1 h-px bg-steel/60" />
                </div>

                {/* Phone Number Form */}
                {!confirmationResult ? (
                  <form onSubmit={handleSendOtp} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                        मोबाईल नंबर (10-Digit Mobile Number)
                      </label>
                      <div className="flex gap-2">
                        <span className="inline-flex items-center px-3 rounded-xl bg-canvas border border-ink/20 text-xs font-bold text-ink">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={phoneNumber}
                          onChange={e => setPhoneNumber(e.target.value)}
                          placeholder="98765 43210"
                          className="flex-1 bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink focus:outline-none focus:border-ink"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || phoneNumber.length < 10}
                      className="w-full settle-pill-btn text-xs sm:text-sm py-2.5 block text-center font-bold"
                    >
                      {loading ? dict.common.loading : 'OTP पाठवा (Send OTP) ➔'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-ink uppercase tracking-wider">
                          ६-अंकी OTP टाका (Enter 6-digit OTP)
                        </label>
                        <button
                          type="button"
                          onClick={() => setConfirmationResult(null)}
                          className="text-[11px] font-bold text-primary hover:underline"
                        >
                          नंबर बदला
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otpCode}
                        onChange={e => setOtpCode(e.target.value)}
                        placeholder="123456"
                        className="w-full tracking-widest text-center text-lg font-mono font-bold bg-canvas border border-ink/20 rounded-xl px-3.5 py-2 text-ink focus:outline-none focus:border-ink"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || otpCode.length < 6}
                      className="w-full settle-pill-btn text-xs sm:text-sm py-2.5 block text-center font-bold"
                    >
                      {loading ? dict.common.loading : 'ओटीपी पडताळा व लॉगिन करा ➔'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* METHOD 2: EMAIL & PASSWORD */}
            {authMode === 'email' && (
              <>
                {resetSent ? (
                  <div className="p-4 rounded-xl bg-verified-bg border border-verified-border text-verified text-xs font-bold text-center space-y-2">
                    <IconCheckCircle className="w-5 h-5 mx-auto text-verified" />
                    <p>
                      {preferredLocale === 'mr'
                        ? 'पासवर्ड रीसेट लिंक आपल्या ईमेलवर पाठवली आहे. कृपया इनबॉक्स तपासा.'
                        : 'Password reset link sent to your email.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setResetSent(false);
                        setShowForgot(false);
                      }}
                      className="text-primary underline text-xs mt-2 block mx-auto font-bold"
                    >
                      लॉगिनकडे परत जा
                    </button>
                  </div>
                ) : showForgot ? (
                  <form onSubmit={handleResetPassword} className="space-y-3">
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
                        className="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink focus:outline-none focus:border-ink"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 settle-pill-btn text-xs py-2.5 font-bold"
                      >
                        {loading ? dict.common.loading : 'रीसेट लिंक पाठवा'}
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
                  <form onSubmit={handleEmailSignIn} className="space-y-3">
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
                        className="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink focus:outline-none focus:border-ink"
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
                          {preferredLocale === 'mr' ? 'पासवर्ड विसरलात?' : 'Forgot Password?'}
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink focus:outline-none focus:border-ink pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-ink-muted hover:text-ink"
                        >
                          {showPassword ? <IconEyeOff className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full settle-pill-btn text-sm py-2.5 mt-2 block text-center font-bold"
                    >
                      {loading ? dict.common.loading : `${dict.nav.login} ➔`}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>

          {/* Switch to Signup */}
          <div className="mt-6 pt-4 border-t border-steel/40 text-center">
            <p className="text-xs text-ink-secondary font-medium">
              {preferredLocale === 'mr'
                ? 'अद्याप खाते नाही?'
                : "Don't have an account yet?"}{' '}
              <Link
                href="/signup"
                className="font-bold text-primary hover:underline ml-1 inline-flex items-center gap-1"
              >
                <span>नवीन नोंदणी करा (Sign up)</span>
                <IconArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </div>
        </div>

        {/* Right Column: Grounded Human Artwork (5 Cols, Desktop Only) */}
        <div className="hidden md:block md:col-span-5">
          <ArtisanWorkshopArt />
        </div>
      </div>
    </main>
  );
}
