'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { getDictionary, SupportedLocale } from '@rojgarmitra/i18n';
import { UserRole } from '@rojgarmitra/shared';
import { ArtisanWorkshopArt } from '@/components/illustrations/ArtisanWorkshopArt';
import { 
  IconGoogle, 
  IconPhone, 
  IconUser, 
  IconBuilding, 
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

export default function SignUpPage() {
  const router = useRouter();
  const { 
    signUp, 
    signInWithGoogle, 
    setupRecaptcha, 
    sendPhoneOtp, 
    confirmPhoneOtp, 
    preferredLocale 
  } = useAuth();
  const dict = getDictionary(preferredLocale);

  const [role, setRole] = useState<UserRole>('candidate');
  const [authMode, setAuthMode] = useState<'quick' | 'email'>('quick');

  // Email form
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industrialArea, setIndustrialArea] = useState('Butibori MIDC');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Phone form
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  // Status
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const getFriendlyError = (errCode: string, locale: SupportedLocale): string => {
    if (errCode.includes('email-already-in-use')) {
      return locale === 'mr'
        ? 'हा ईमेल आधीच नोंदणीकृत आहे. कृपया लॉगिन करा.'
        : 'This email is already registered. Please sign in.';
    }
    if (errCode.includes('weak-password')) {
      return locale === 'mr'
        ? 'पासवर्ड किमान ६ अक्षरांचा असावा.'
        : 'Password must be at least 6 characters.';
    }
    if (errCode.includes('popup-closed-by-user')) {
      return locale === 'mr'
        ? 'Google नोंदणी रद्द केली गेली.'
        : 'Google sign-up canceled.';
    }
    return locale === 'mr'
      ? 'नोंदणी करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.'
      : 'Sign up failed. Please try again.';
  };

  // Google Sign-Up
  const handleGoogleSignUp = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await signInWithGoogle(role);
      if (role === 'employer') {
        router.push('/employer');
      } else {
        router.push('/candidate/onboarding');
      }
    } catch (err: any) {
      console.error('Google sign-up error:', err);
      setErrorMsg(getFriendlyError(err?.code || '', preferredLocale));
    } finally {
      setLoading(false);
    }
  };

  // Phone OTP: Send Code
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
        verifier = setupRecaptcha('recaptcha-signup-box');
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

  // Phone OTP: Confirm Code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult || !otpCode.trim()) return;

    setErrorMsg(null);
    setLoading(true);
    try {
      await confirmPhoneOtp(confirmationResult, otpCode.trim(), role);
      if (role === 'employer') {
        router.push('/employer');
      } else {
        router.push('/candidate/onboarding');
      }
    } catch (err: any) {
      console.error('OTP confirmation error:', err);
      setErrorMsg(getFriendlyError(err?.code || '', preferredLocale));
    } finally {
      setLoading(false);
    }
  };

  // Email Sign-Up
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg(
        preferredLocale === 'mr' ? 'पासवर्ड जुळत नाहीत.' : 'Passwords do not match.'
      );
      return;
    }

    if (password.length < 6) {
      setErrorMsg(
        preferredLocale === 'mr'
          ? 'पासवर्ड किमान ६ अक्षरांचा असावा.'
          : 'Password must be at least 6 characters.'
      );
      return;
    }

    setLoading(true);

    try {
      await signUp(email.trim(), password, role, preferredLocale);

      if (role === 'employer') {
        router.push('/employer');
      } else {
        router.push('/candidate/onboarding');
      }
    } catch (err: any) {
      console.error('Sign up error:', err);
      setErrorMsg(getFriendlyError(err?.code || '', preferredLocale));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[85vh] flex items-center justify-center py-8 px-4">
      {/* Invisible reCAPTCHA container for Phone Auth */}
      <div id="recaptcha-signup-box" />

      <div className="max-w-4xl w-full bg-surface rounded-card border-2 border-ink shadow-solid-lg grid grid-cols-1 md:grid-cols-12 overflow-hidden">
        {/* Left Column: Sign-Up Form (7 Cols) */}
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
                <span>सर्व प्रकारच्या रोजगारासाठी खुले (Open For All)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
                {dict.nav.register}
              </h1>
              <p className="text-xs text-ink-secondary mt-1 font-medium">
                {preferredLocale === 'mr'
                  ? 'आपले नवीन खाते तयार करा — उमेदवार किंवा कारखाना/कंपनी मालक म्हणून'
                  : 'Create your account as a Jobseeker or Factory / Employer'}
              </p>
            </div>

            {/* Role Toggle (Candidate vs Employer) */}
            <div className="mb-5 p-1 bg-canvas rounded-full border border-ink/20 flex gap-1">
              <button
                type="button"
                onClick={() => setRole('candidate')}
                className={`flex-1 py-2 text-xs font-bold rounded-full transition flex items-center justify-center gap-1.5 ${
                  role === 'candidate'
                    ? 'bg-ink text-white shadow-solid-sm'
                    : 'text-ink-secondary hover:text-ink'
                }`}
              >
                <IconUser className="w-3.5 h-3.5" />
                <span>उमेदवार (Jobseeker)</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('employer')}
                className={`flex-1 py-2 text-xs font-bold rounded-full transition flex items-center justify-center gap-1.5 ${
                  role === 'employer'
                    ? 'bg-ink text-white shadow-solid-sm'
                    : 'text-ink-secondary hover:text-ink'
                }`}
              >
                <IconBuilding className="w-3.5 h-3.5" />
                <span>नियोक्ता (Employer)</span>
              </button>
            </div>

            {errorMsg && (
              <div className="mb-5 p-3 rounded-xl bg-alert-bg border border-alert-border text-alert text-xs font-bold flex items-center gap-2">
                <IconAlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Auth Mode Toggle Tabs (Phone/Google vs Email) */}
            <div className="flex p-1 bg-canvas rounded-full border border-ink/20 mb-5 text-xs font-bold">
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

            {/* METHOD 1: QUICK AUTH (Google + Phone OTP) */}
            {authMode === 'quick' && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleGoogleSignUp}
                  disabled={loading}
                  className="w-full bg-white hover:bg-steel-soft text-ink font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl border-2 border-ink shadow-solid-sm transition flex items-center justify-center gap-2.5 active:translate-x-0.5 active:translate-y-0.5"
                >
                  <IconGoogle className="w-4 h-4" />
                  <span>Google ने १-क्लिक नोंदणी करा</span>
                </button>

                <div className="flex items-center gap-3 my-3">
                  <div className="flex-1 h-px bg-steel/60" />
                  <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
                    किंवा मोबाईल फोन नंबर
                  </span>
                  <div className="flex-1 h-px bg-steel/60" />
                </div>

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
                          ६-अंकी OTP टाका
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
                      {loading ? dict.common.loading : 'नोंदणी पूर्ण करा ➔'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* METHOD 2: EMAIL FORM */}
            {authMode === 'email' && (
              <form onSubmit={handleEmailSignUp} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                    पूर्ण नाव (Full Name)
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="उदा. राहुल देशमुख"
                    className="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink focus:outline-none focus:border-ink"
                  />
                </div>

                {role === 'employer' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                        कंपनी / कारखान्याचे नाव (Company Name)
                      </label>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={e => setCompanyName(e.target.value)}
                        placeholder="उदा. BraMHanee Industries Pvt Ltd"
                        className="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink focus:outline-none focus:border-ink"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                        औद्योगिक परिसर (Industrial Area)
                      </label>
                      <select
                        value={industrialArea}
                        onChange={e => setIndustrialArea(e.target.value)}
                        className="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink focus:outline-none focus:border-ink"
                      >
                        <option value="Butibori MIDC">बुटीबोरी MIDC (Butibori)</option>
                        <option value="Hingna MIDC">हिंगणा MIDC (Hingna)</option>
                        <option value="Umred Industrial Area">उमरेड (Umred)</option>
                        <option value="Kalmeshwar MIDC">कळमेश्वर MIDC (Kalmeshwar)</option>
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                    ईमेल पत्ता (Email)
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="rahul@example.com"
                    className="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink focus:outline-none focus:border-ink"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                      पासवर्ड
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="किमान ६ अक्षरे"
                        className="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink focus:outline-none focus:border-ink pr-9"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2.5 text-ink-muted hover:text-ink"
                      >
                        {showPassword ? <IconEyeOff className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                      पुन्हा टाका
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="पुन्हा पासवर्ड टाका"
                      className="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink focus:outline-none focus:border-ink"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full settle-pill-btn text-sm py-2.5 mt-2 block text-center font-bold"
                >
                  {loading ? dict.common.loading : 'नोंदणी पूर्ण करा ➔'}
                </button>
              </form>
            )}
          </div>

          {/* Switch to Login */}
          <div className="mt-6 pt-4 border-t border-steel/40 text-center">
            <p className="text-xs text-ink-secondary font-medium">
              {preferredLocale === 'mr' ? 'आधीच खाते आहे?' : 'Already have an account?'}{' '}
              <Link
                href="/login"
                className="font-bold text-primary hover:underline ml-1 inline-flex items-center gap-1"
              >
                <span>येथे लॉगिन करा</span>
                <IconArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </div>
        </div>

        {/* Right Column: Authentic Human Artwork (5 Cols, Desktop Only) */}
        <div className="hidden md:block md:col-span-5">
          <ArtisanWorkshopArt />
        </div>
      </div>
    </main>
  );
}
