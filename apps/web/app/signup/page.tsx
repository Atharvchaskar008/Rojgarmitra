'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { getDictionary, SupportedLocale } from '@rojgarmitra/i18n';
import { UserRole } from '@rojgarmitra/shared';

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, preferredLocale } = useAuth();
  const dict = getDictionary(preferredLocale);

  const [role, setRole] = useState<UserRole>('candidate');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industrialArea, setIndustrialArea] = useState('Butibori MIDC');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const getFriendlyError = (errCode: string, locale: SupportedLocale): string => {
    if (errCode.includes('email-already-in-use')) {
      return locale === 'mr'
        ? 'हा ईमेल आधीच नोंदणीकृत आहे. कृपया लॉगिन करा.'
        : locale === 'hi'
        ? 'यह ईमेल पहले से पंजीकृत है। कृपया लॉगिन करें।'
        : 'This email is already registered. Please sign in.';
    }
    if (errCode.includes('weak-password')) {
      return locale === 'mr'
        ? 'पासवर्ड किमान ६ अक्षरांचा असावा.'
        : locale === 'hi'
        ? 'पासवर्ड कम से कम ६ अक्षरों का होना चाहिए।'
        : 'Password should be at least 6 characters.';
    }
    if (errCode.includes('invalid-email')) {
      return locale === 'mr'
        ? 'कृपया वैध ईमेल पत्ता टाका.'
        : locale === 'hi'
        ? 'कृपया मान्य ईमेल पता दर्ज करें।'
        : 'Please enter a valid email address.';
    }
    return locale === 'mr'
      ? 'नोंदणी करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.'
      : locale === 'hi'
      ? 'पंजीकरण में त्रुटि हुई। कृपया दोबारा प्रयास करें।'
      : 'Sign up failed. Please try again.';
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg(
        preferredLocale === 'mr'
          ? 'पासवर्ड जुळत नाहीत.'
          : preferredLocale === 'hi'
          ? 'पासवर्ड मेल नहीं खा रहे हैं।'
          : 'Passwords do not match.'
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

      // Route based on registered role
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
    <main className="min-h-[80vh] flex items-center justify-center py-10 px-4">
      <div className="max-w-lg w-full">
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
              {preferredLocale === 'mr'
                ? 'नवीन खाते तयार करा'
                : preferredLocale === 'hi'
                ? 'नया खाता बनाएं'
                : 'Create Your Account'}
            </h1>
            <p className="text-xs text-ink-secondary mt-1 font-medium">
              {preferredLocale === 'mr'
                ? 'विदर्भातील थेट स्थानिक रोजगार व्यासपीठावर आपले स्वागत आहे'
                : preferredLocale === 'hi'
                ? 'विदर्भ के स्थानीय रोजगार मंच पर आपका स्वागत है'
                : 'Join the direct local employment network for Vidarbha'}
            </p>
          </div>

          {/* Role Toggle (Candidate vs Employer) */}
          <div className="mb-6 p-1.5 bg-canvas rounded-full border border-ink/20 flex gap-1">
            <button
              type="button"
              onClick={() => setRole('candidate')}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition ${
                role === 'candidate'
                  ? 'bg-ink text-white shadow-solid-sm'
                  : 'text-ink-secondary hover:text-ink'
              }`}
            >
              👷‍♂️ {preferredLocale === 'mr' ? 'उमेदवार (Jobseeker)' : preferredLocale === 'hi' ? 'उम्मीदवार' : 'Jobseeker'}
            </button>
            <button
              type="button"
              onClick={() => setRole('employer')}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition ${
                role === 'employer'
                  ? 'bg-ink text-white shadow-solid-sm'
                  : 'text-ink-secondary hover:text-ink'
              }`}
            >
              🏭 {preferredLocale === 'mr' ? 'नियोक्ता (Employer)' : preferredLocale === 'hi' ? 'नियोक्ता' : 'Employer'}
            </button>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-alert-bg border border-alert-border text-alert text-xs font-bold flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                {preferredLocale === 'mr'
                  ? 'पूर्ण नाव (Full Name)'
                  : preferredLocale === 'hi'
                  ? 'पूरा नाम'
                  : 'Full Name'}
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder={preferredLocale === 'mr' ? 'उदा. राहुल देशमुख' : 'e.g. Rahul Deshmukh'}
                className="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink"
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
                    className="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                    औद्योगिक परिसर (Industrial Area)
                  </label>
                  <select
                    value={industrialArea}
                    onChange={e => setIndustrialArea(e.target.value)}
                    className="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink"
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
                className="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                  पासवर्ड (Password)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="किमान ६ अक्षरे"
                    className="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-xs text-ink-muted hover:text-ink"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                  पुन्हा टाका (Confirm)
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="पुन्हा पासवर्ड टाका"
                  className="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink"
                />
              </div>
            </div>

            <p className="text-[11px] text-ink-muted">
              {preferredLocale === 'mr'
                ? 'नोंदणी करून आपण रोजगारमित्रच्या पारदर्शक सेवा अटींशी सहमत होता.'
                : 'By registering, you agree to RojgarMitra terms of verified local hiring.'}
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full settle-pill-btn text-sm py-3 mt-2 block text-center"
            >
              {loading
                ? dict.common.loading
                : preferredLocale === 'mr'
                ? 'नोंदणी पूर्ण करा ➔'
                : preferredLocale === 'hi'
                ? 'पंजीकरण पूरा करें ➔'
                : 'Create Account ➔'}
            </button>
          </form>

          {/* Switch to Login */}
          <div className="mt-6 pt-5 border-t border-steel/40 text-center">
            <p className="text-xs text-ink-secondary font-medium">
              {preferredLocale === 'mr'
                ? 'आधीच खाते आहे?'
                : preferredLocale === 'hi'
                ? 'पहले से खाता है?'
                : 'Already have an account?'}{' '}
              <Link
                href="/login"
                className="font-bold text-primary hover:underline ml-1"
              >
                {preferredLocale === 'mr'
                  ? 'येथे लॉगिन करा'
                  : preferredLocale === 'hi'
                  ? 'यहाँ लॉगिन करें'
                  : 'Sign in here'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
