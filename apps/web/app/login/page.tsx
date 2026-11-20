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
  IconCheckCircle,
  IconUser,
  IconBuilding
} from '@/components/icons';
import type { ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';

export default function LoginPage() {
  const router = useRouter();
  const {
    signIn,
    signUp,
    signInWithGoogle,
    setupRecaptcha,
    sendPhoneOtp,
    confirmPhoneOtp,
    resetPassword,
    preferredLocale
  } = useAuth();
  const dict = getDictionary(preferredLocale);

  // Selected User Role for Onboarding / Login: 'candidate' | 'employer'
  const [selectedRole, setSelectedRole] = useState<'candidate' | 'employer'>('candidate');

  // Auth Method Mode: 'quick' (Google / Phone) | 'email'
  const [authMode, setAuthMode] = useState<'quick' | 'email'>('quick');

  // Email form state
  const [emailAction, setEmailAction] = useState<'signin' | 'register'>('signin');
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

  // Parse query parameters on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roleParam = params.get('role');
      if (roleParam === 'employer' || roleParam === 'candidate') {
        setSelectedRole(roleParam);
      }
      const modeParam = params.get('mode');
      if (modeParam === 'register') {
        setEmailAction('register');
        setAuthMode('email');
      }
    }
  }, []);

  // Friendly error mapping with comprehensive error code and network inspection
  const getFriendlyError = (errInput: any, locale: SupportedLocale): string => {
    const errCode = (errInput?.code || errInput?.message || String(errInput || '')).toLowerCase();

    if (errCode.includes('email-already-in-use')) {
      return locale === 'mr'
        ? 'हा ईमेल आधीच नोंदणीकृत आहे. कृपया वरील "प्रवेश करा (Sign In)" टॅब निवडून लॉगिन करा.'
        : locale === 'hi'
        ? 'यह ईमेल पहले से पंजीकृत है। कृपया ऊपर "प्रवेश करें (Sign In)" चुनकर लॉग इन करें।'
        : 'This email is already registered. Please switch to Sign In.';
    }
    if (errCode.includes('user-not-found') || errCode.includes('invalid-credential') || errCode.includes('wrong-password')) {
      return locale === 'mr'
        ? 'ईमेल किंवा पासवर्ड चुकीचा आहे. जर आपण नवीन असाल तर कृपया "नवीन खाते (Register)" निवडून नोंदणी करा.'
        : locale === 'hi'
        ? 'ईमेल या पासवर्ड गलत है। यदि आप नए उपयोगकर्ता हैं, तो कृपया "नया खाता (Register)" चुनकर पंजीकरण करें।'
        : 'Invalid credentials. If you are a new user, please switch to "Register" to create an account.';
    }
    if (errCode.includes('invalid-verification-code') || errCode.includes('code-expired')) {
      return locale === 'mr'
        ? 'ओटीपी (OTP) चुकीचा किंवा कालबाह्य झाला आहे. कृपया पुन्हा प्रयत्न करा.'
        : locale === 'hi'
        ? 'दर्ज किया गया OTP गलत या समाप्त हो चुका है। कृपया दोबारा प्रयास करें।'
        : 'Invalid or expired OTP code. Please try again.';
    }
    if (errCode.includes('popup-closed-by-user')) {
      return locale === 'mr'
        ? 'Google लॉगिन विंडो बंद केली गेली.'
        : locale === 'hi'
        ? 'Google साइन-इन विंडो बंद कर दी गई।'
        : 'Google sign-in popup was closed.';
    }
    if (errCode.includes('unauthorized-domain')) {
      return locale === 'mr'
        ? 'हे डोमेन प्रमाणीकरणासाठी अधिकृत केले जात आहे. कृपया १ सेकंदात पुन्हा प्रयत्न करा.'
        : locale === 'hi'
        ? 'यह डोमेन प्रमाणीकरण के लिए अधिकृत किया जा रहा है। कृपया १ सेकंड में पुनः प्रयास करें।'
        : 'Domain authorization updated. Please retry in a moment.';
    }
    if (errCode.includes('too-many-requests') || errCode.includes('quota-exceeded')) {
      return locale === 'mr'
        ? 'खूप जास्त प्रयत्न झाले आहेत. कृपया १ मिनिट थांबून पुन्हा प्रयत्न करा.'
        : locale === 'hi'
        ? 'बहुत अधिक प्रयास किए गए हैं। कृपया १ मिनट प्रतीक्षा करें।'
        : 'Too many requests. Please wait a minute before retrying.';
    }
    if (errCode.includes('network-request-failed')) {
      return locale === 'mr'
        ? 'इंटरनेट कनेक्शन समस्या. कृपया आपले नेटवर्क तपासा.'
        : locale === 'hi'
        ? 'नेटवर्क समस्या। कृपया अपना इंटरनेट कनेक्शन जाँचें।'
        : 'Network connection failed. Please check your internet connection.';
    }
    return locale === 'mr'
      ? 'प्रमाणीकरण त्रुटी. कृपया ईमेल/पासवर्ड तपासून पुन्हा प्रयत्न करा.'
      : locale === 'hi'
      ? 'प्रमाणीकरण में त्रुटि। कृपया ईमेल/पासवर्ड जांचकर पुनः प्रयास करें।'
      : 'Authentication failed. Please verify credentials and try again.';
  };

  // 1. Google Sign-In / Sign-Up Handler
  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await signInWithGoogle(selectedRole);
      window.location.href = selectedRole === 'employer' ? '/employer' : '/candidate';
    } catch (err: any) {
      console.error('Google auth error:', err);
      setErrorMsg(getFriendlyError(err, preferredLocale));
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
          : preferredLocale === 'hi'
          ? 'कृपया वैध १०-अंकीय मोबाइल नंबर दर्ज करें।'
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
      setErrorMsg(getFriendlyError(err, preferredLocale));
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
      await confirmPhoneOtp(confirmationResult, otpCode.trim(), selectedRole);
      window.location.href = selectedRole === 'employer' ? '/employer' : '/candidate';
    } catch (err: any) {
      console.error('OTP confirmation error:', err);
      setErrorMsg(getFriendlyError(err, preferredLocale));
      setLoading(false);
    }
  };

  // 4. Email/Password Sign-In & Registration Unified
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (emailAction === 'register') {
        if (password.length < 6) {
          setErrorMsg(
            preferredLocale === 'mr' 
              ? 'पासवर्ड किमान ६ अक्षरांचा असावा.' 
              : preferredLocale === 'hi' 
              ? 'पासवर्ड कम से कम ६ अक्षरों का होना चाहिए।' 
              : 'Password must be at least 6 characters.'
          );
          setLoading(false);
          return;
        }
        await signUp(email.trim(), password, selectedRole, preferredLocale);
      } else {
        await signIn(email.trim(), password);
      }
      window.location.href = selectedRole === 'employer' ? '/employer' : '/candidate';
    } catch (err: any) {
      console.error('Email auth error:', err);
      setErrorMsg(getFriendlyError(err, preferredLocale));
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
          : preferredLocale === 'hi'
          ? 'कृपया अपना पंजीकृत ईमेल दर्ज करें।'
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
      setErrorMsg(getFriendlyError(err, preferredLocale));
    } finally {
      setLoading(false);
    }
  };

  // 6. Instant 1-Click Demo Evaluation Sign-In
  const handleDemoSignIn = async (role: 'candidate' | 'employer') => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const demoEmail = role === 'candidate' ? 'candidate.demo@rojgarmitra.in' : 'employer.demo@rojgarmitra.in';
      setEmail(demoEmail);
      setPassword('DemoPassword@123');
      await signIn(demoEmail, 'DemoPassword@123');
      window.location.href = role === 'candidate' ? '/candidate' : '/employer';
    } catch (err: any) {
      console.error('Demo sign-in error:', err);
      setErrorMsg(getFriendlyError(err, preferredLocale));
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
                <span>
                  {preferredLocale === 'mr'
                    ? 'विदर्भ व ग्रामीण महाराष्ट्रासाठी थेट मंच'
                    : preferredLocale === 'hi'
                      ? 'विदर्भ और ग्रामीण क्षेत्र के लिए सीधा मंच'
                      : 'Direct Employment Platform for Vidarbha'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
                {preferredLocale === 'mr' ? 'प्रवेश व थेट नोंदणी' : preferredLocale === 'hi' ? 'प्रवेश एवं सीधी भर्ती' : 'Sign In & Onboarding'}
              </h1>
              <p className="text-xs text-ink-secondary mt-1 font-medium">
                {preferredLocale === 'mr'
                  ? 'आपल्या खात्यात १-क्लिक प्रवेश करा — फोन, गुगल किंवा ईमेलने'
                  : preferredLocale === 'hi'
                    ? 'अपने खाते में १-क्लिक प्रवेश करें — फोन, गूगल या ईमेल से'
                    : '1-Click access to RojgarMitra — Phone, Google, or Email'}
              </p>
            </div>

            {/* Unified Role Selector */}
            <div className="mb-5">
              <label className="block text-[11px] font-black uppercase tracking-wider text-ink-secondary mb-1.5">
                {preferredLocale === 'mr' ? 'मी कोण आहे? (आपली भूमिका निवडा)' : preferredLocale === 'hi' ? 'मैं कौन हूँ? (अपनी भूमिका चुनें)' : 'Select Your Role'}
              </label>
              <div className="p-1 bg-canvas rounded-xl border border-ink/20 grid grid-cols-2 gap-1.5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setSelectedRole('candidate')}
                  className={`py-2 px-3 rounded-lg transition flex items-center justify-center gap-1.5 ${selectedRole === 'candidate'
                    ? 'bg-ink text-white shadow-solid-sm'
                    : 'text-ink-secondary hover:text-ink'
                    }`}
                >
                  <IconUser className="w-3.5 h-3.5" />
                  <span>{preferredLocale === 'mr' ? 'उमेदवार (Jobseeker)' : preferredLocale === 'hi' ? 'उम्मीदवार (Jobseeker)' : 'Candidate'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('employer')}
                  className={`py-2 px-3 rounded-lg transition flex items-center justify-center gap-1.5 ${selectedRole === 'employer'
                    ? 'bg-ink text-white shadow-solid-sm'
                    : 'text-ink-secondary hover:text-ink'
                    }`}
                >
                  <IconBuilding className="w-3.5 h-3.5" />
                  <span>{preferredLocale === 'mr' ? 'नियोक्ता (Employer)' : preferredLocale === 'hi' ? 'नियोक्ता (Employer)' : 'Employer'}</span>
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-5 p-3 rounded-xl bg-alert-bg border border-alert-border text-alert text-xs font-bold flex items-center gap-2">
                <IconAlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Instant Demo Evaluation for Hackathon Judges & Evaluators */}
            <div className="mb-6 p-3.5 rounded-2xl bg-amber-50/80 border-2 border-amber-300 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {preferredLocale === 'mr'
                    ? '⚡ परीक्षक व डेमो मूल्यांकन (1-Click Evaluation)'
                    : preferredLocale === 'hi'
                      ? '⚡ परीक्षक व डेमो मूल्यांकन (1-Click Evaluation)'
                      : '⚡ 1-Click Evaluation Demo Sign-In'}
                </span>
                <span className="text-[10px] bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full font-bold">
                  No OTP Needed
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoSignIn('candidate')}
                  disabled={loading}
                  className="py-2.5 px-3 rounded-xl bg-white hover:bg-emerald-50 text-emerald-950 border-2 border-emerald-600 font-black text-[11px] sm:text-xs text-left shadow-sm hover:shadow transition flex flex-col gap-0.5 active:scale-[0.98]"
                >
                  <span className="text-emerald-700 font-semibold text-[10px]">
                    {preferredLocale === 'mr' ? 'उमेदवार १-क्लिक लॉगिन' : preferredLocale === 'hi' ? 'उम्मीदवार १-क्लिक लॉगिन' : 'Candidate 1-Click Demo'}
                  </span>
                  <span className="truncate font-black">👤 रमेश पाटील (ITI)</span>
                  <span className="text-[9px] text-emerald-800/80 font-mono font-medium">candidate.demo@rojgarmitra.in</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoSignIn('employer')}
                  disabled={loading}
                  className="py-2.5 px-3 rounded-xl bg-white hover:bg-blue-50 text-blue-950 border-2 border-blue-600 font-black text-[11px] sm:text-xs text-left shadow-sm hover:shadow transition flex flex-col gap-0.5 active:scale-[0.98]"
                >
                  <span className="text-blue-700 font-semibold text-[10px]">
                    {preferredLocale === 'mr' ? 'नियोक्ता १-क्लिक लॉगिन' : preferredLocale === 'hi' ? 'नियोक्ता १-क्लिक लॉगिन' : 'Employer 1-Click Demo'}
                  </span>
                  <span className="truncate font-black">🏢 महिंद्रा MIDC HR</span>
                  <span className="text-[9px] text-blue-800/80 font-mono font-medium">employer.demo@rojgarmitra.in</span>
                </button>
              </div>
            </div>

            {/* Auth Mode Toggle Tabs (Phone/Google vs Email) */}
            <div className="flex p-1 bg-canvas rounded-full border border-ink/20 mb-6 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('quick');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-1.5 rounded-full transition ${authMode === 'quick'
                  ? 'bg-ink text-white shadow-solid-sm'
                  : 'text-ink-secondary hover:text-ink'
                  }`}
              >
                {preferredLocale === 'mr' ? 'Google / फोन OTP' : preferredLocale === 'hi' ? 'Google / फोन OTP' : 'Google / Phone OTP'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('email');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-1.5 rounded-full transition ${authMode === 'email'
                  ? 'bg-ink text-white shadow-solid-sm'
                  : 'text-ink-secondary hover:text-ink'
                  }`}
              >
                {preferredLocale === 'mr' ? 'ईमेल व पासवर्ड' : preferredLocale === 'hi' ? 'ईमेल व पासवर्ड' : 'Email & Password'}
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
                  <span>
                    {preferredLocale === 'mr' 
                      ? 'Google ने साइन इन करा (Continue with Google)' 
                      : preferredLocale === 'hi' 
                      ? 'Google से साइन इन करें (Continue with Google)' 
                      : 'Continue with Google'}
                  </span>
                </button>

                <div className="flex items-center gap-3 my-3">
                  <div className="flex-1 h-px bg-steel/60" />
                  <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
                    {preferredLocale === 'mr' ? 'किंवा मोबाईल फोन नंबर' : preferredLocale === 'hi' ? 'या मोबाइल फोन नंबर' : 'Or Mobile Phone Number'}
                  </span>
                  <div className="flex-1 h-px bg-steel/60" />
                </div>

                {/* Phone Number Form */}
                {!confirmationResult ? (
                  <form onSubmit={handleSendOtp} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                        {preferredLocale === 'mr' 
                          ? 'मोबाईल नंबर (10-Digit Mobile Number)' 
                          : preferredLocale === 'hi' 
                          ? 'मोबाइल नंबर (10-अंकीय मोबाइल नंबर)' 
                          : 'Mobile Number (10-Digit)'}
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
                      <div className="flex items-center justify-between text-[11px] text-ink-muted mt-1 px-1">
                        <span>{preferredLocale === 'mr' ? 'चाचणी क्रमांक:' : preferredLocale === 'hi' ? 'परीक्षण नंबर:' : 'Test Phone:'}</span>
                        <button
                          type="button"
                          onClick={() => setPhoneNumber('9876543210')}
                          className="font-mono font-bold text-primary hover:underline"
                        >
                          9876543210 (OTP: 123456)
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || phoneNumber.length < 10}
                      className="w-full settle-pill-btn text-xs sm:text-sm py-2.5 block text-center font-bold"
                    >
                      {loading 
                        ? dict.common.loading 
                        : preferredLocale === 'mr' 
                        ? 'OTP पाठवा (Send OTP) ➔' 
                        : preferredLocale === 'hi' 
                        ? 'OTP भेजें (Send OTP) ➔' 
                        : 'Send OTP ➔'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-ink uppercase tracking-wider">
                          {preferredLocale === 'mr' 
                            ? '६-अंकी OTP टाका (Enter 6-digit OTP)' 
                            : preferredLocale === 'hi' 
                            ? '६-अंकीय OTP दर्ज करें (Enter 6-digit OTP)' 
                            : 'Enter 6-digit OTP'}
                        </label>
                        <button
                          type="button"
                          onClick={() => setConfirmationResult(null)}
                          className="text-[11px] font-bold text-primary hover:underline"
                        >
                          {preferredLocale === 'mr' ? 'नंबर बदला' : preferredLocale === 'hi' ? 'नंबर बदलें' : 'Change Number'}
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
                      <div className="flex items-center justify-between text-[11px] text-ink-muted mt-1 px-1">
                        <span>{preferredLocale === 'mr' ? 'चाचणी कोड:' : preferredLocale === 'hi' ? 'परीक्षण कोड:' : 'Test OTP:'}</span>
                        <button
                          type="button"
                          onClick={() => setOtpCode('123456')}
                          className="font-mono font-bold text-primary hover:underline"
                        >
                          123456
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || otpCode.length < 6}
                      className="w-full settle-pill-btn text-xs sm:text-sm py-2.5 block text-center font-bold"
                    >
                      {loading 
                        ? dict.common.loading 
                        : preferredLocale === 'mr' 
                        ? 'ओटीपी पडताळा व लॉगिन करा ➔' 
                        : preferredLocale === 'hi' 
                        ? 'OTP सत्यापित करें व प्रवेश करें ➔' 
                        : 'Verify OTP & Continue ➔'}
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
                        : preferredLocale === 'hi'
                        ? 'पासवर्ड रीसेट लिंक आपके ईमेल पर भेज दी गई है। कृपया इनबॉक्स जांचें।'
                        : 'Password reset link sent to your email. Please check your inbox.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setResetSent(false);
                        setShowForgot(false);
                      }}
                      className="text-primary underline text-xs mt-2 block mx-auto font-bold"
                    >
                      {preferredLocale === 'mr' ? 'लॉगिनकडे परत जा' : preferredLocale === 'hi' ? 'लॉग इन पर वापस जाएं' : 'Back to Sign In'}
                    </button>
                  </div>
                ) : showForgot ? (
                  <form onSubmit={handleResetPassword} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                        {preferredLocale === 'mr' ? 'नोंदणीकृत ईमेल (Registered Email)' : preferredLocale === 'hi' ? 'पंजीकृत ईमेल (Registered Email)' : 'Registered Email'}
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
                        {loading ? dict.common.loading : (preferredLocale === 'mr' ? 'रीसेट लिंक पाठवा' : preferredLocale === 'hi' ? 'रीसेट लिंक भेजें' : 'Send Reset Link')}
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
                  <form onSubmit={handleEmailAuth} className="space-y-3">
                    {/* Action Switcher: Sign In vs Register */}
                    <div className="flex items-center justify-between p-1 bg-canvas rounded-xl border border-ink/15 mb-2 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setEmailAction('signin')}
                        className={`flex-1 py-1.5 rounded-lg transition ${emailAction === 'signin'
                          ? 'bg-ink text-white shadow-solid-sm'
                          : 'text-ink-secondary hover:text-ink'
                          }`}
                      >
                        {preferredLocale === 'mr' ? 'प्रवेश करा (Sign In)' : preferredLocale === 'hi' ? 'प्रवेश करें (Sign In)' : 'Sign In'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEmailAction('register')}
                        className={`flex-1 py-1.5 rounded-lg transition ${emailAction === 'register'
                          ? 'bg-ink text-white shadow-solid-sm'
                          : 'text-ink-secondary hover:text-ink'
                          }`}
                      >
                        {preferredLocale === 'mr' ? 'नवीन खाते (Register)' : preferredLocale === 'hi' ? 'नया खाता (Register)' : 'Register'}
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                        {preferredLocale === 'mr' ? 'ईमेल पत्ता (Email)' : preferredLocale === 'hi' ? 'ईमेल पता (Email)' : 'Email Address'}
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder={selectedRole === 'employer' ? "hr@company.com" : "ramesh@example.com"}
                        className="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink focus:outline-none focus:border-ink"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-ink uppercase tracking-wider">
                          {preferredLocale === 'mr' ? 'पासवर्ड (Password)' : preferredLocale === 'hi' ? 'पासवर्ड (Password)' : 'Password'}
                        </label>
                        {emailAction === 'signin' && (
                          <button
                            type="button"
                            onClick={() => setShowForgot(true)}
                            className="text-[11px] font-bold text-primary hover:underline"
                          >
                            {preferredLocale === 'mr' ? 'पासवर्ड विसरलात?' : preferredLocale === 'hi' ? 'पासवर्ड भूल गए?' : 'Forgot Password?'}
                          </button>
                        )}
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
                      className="w-full settle-pill-btn text-sm py-2.5 mt-2 block text-center font-bold shadow-solid-sm"
                    >
                      {loading
                        ? dict.common.loading
                        : emailAction === 'register'
                          ? (preferredLocale === 'mr' ? 'खाते तयार करा व पुढे जा ➔' : preferredLocale === 'hi' ? 'खाता बनाएं और आगे बढ़ें ➔' : 'Create Account ➔')
                          : `${dict.nav.login} ➔`}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>

          {/* Friction-Free Assurance */}
          <div className="mt-6 pt-4 border-t border-steel/40 text-center">
            <p className="text-xs text-ink-secondary font-medium">
              {preferredLocale === 'mr'
                ? 'कोणतीही मध्यस्थी किंवा शुल्क नाही — १००% थेट आणि मोफत'
                : preferredLocale === 'hi'
                ? 'कोई बिचौलिया या शुल्क नहीं — १००% सीधा और निःशुल्क'
                : '100% Free platform with direct employer connections and zero brokerage.'}
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
