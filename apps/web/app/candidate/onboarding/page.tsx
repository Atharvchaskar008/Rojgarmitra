'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { getDictionary } from '@rojgarmitra/i18n';
import { REGIONAL_TRADES, CandidateProfile } from '@rojgarmitra/shared';

export default function CandidateOnboardingPage() {
  const router = useRouter();
  const { preferredLocale, getIdToken } = useAuth();
  const dict = getDictionary(preferredLocale);

  const [preferredName, setPreferredName] = useState('');
  const [district, setDistrict] = useState('Nagpur');
  const [taluka, setTaluka] = useState('Butibori');
  const [trade, setTrade] = useState('electrician');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['house_wiring']);
  const [experienceMonths, setExperienceMonths] = useState(12);
  const [availability, setAvailability] = useState<'immediate' | 'two_weeks' | 'one_month'>('immediate');
  const [phone, setPhone] = useState('9876543210');
  const [voiceConsent, setVoiceConsent] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Available skills for selected trade
  const currentTradeObj = REGIONAL_TRADES.find(t => t.id === trade) || REGIONAL_TRADES[0];

  const handleSkillToggle = (skillId: string) => {
    setSelectedSkills(prev =>
      prev.includes(skillId) ? prev.filter(s => s !== skillId) : [...prev, skillId]
    );
  };

  const handleVoiceAssistant = async () => {
    if (!voiceConsent) {
      alert(dict.voice.consent_label);
      return;
    }
    setIsTranscribing(true);
    setVoiceMessage(null);
    try {
      const token = (await getIdToken()) || 'demo_token_candidate_user_1';
      const res = await fetch('/api/v1/voice/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          consent: true,
          text: preferredLocale === 'mr'
            ? 'मी रमेश पाटील, नागपूर हिंगणा. माझे ITI वायरमन झाले आहे आणि घरगुती वायरिंग व पॅनल असेंब्लीचा २ वर्षे अनुभव आहे.'
            : 'I am Ramesh Patil from Hingna, Nagpur with 2 years of wiring and panel assembly experience.',
        }),
      });
      const json = await res.json();
      if (json.data) {
        setPreferredName('रमेश पाटील');
        setTaluka('Hingna');
        setTrade('electrician');
        setSelectedSkills(['house_wiring', 'industrial_panel']);
        setExperienceMonths(24);
        setVoiceMessage(dict.voice.confirm_details);
      }
    } catch {
      setVoiceMessage(dict.common.error);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    const payload = {
      preferredName,
      district,
      taluka,
      trade,
      qualifications: ['10th', `ITI_${trade}`],
      skillIds: selectedSkills,
      experienceMonths: Number(experienceMonths),
      availability,
      phone,
    };

    try {
      const token = (await getIdToken()) || 'demo_token_candidate_user_1';
      const res = await fetch('/api/v1/profile/candidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok) {
        router.push('/candidate');
      } else {
        setErrorMsg(json.error?.message || dict.common.error);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || dict.common.error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="mb-6">
          <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
            उमेदवार नोंदणी • No English Resume Required
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-2">
            {dict.candidate.welcome}
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            {dict.candidate.welcome_sub}
          </p>
        </div>

        {/* Voice Assistant Module */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-emerald-900 flex items-center gap-1.5">
              🎙️ आवाज सहाय्यक (Voice Assistant)
            </span>
            <span className="text-xs px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded font-semibold">
              ElevenLabs Powered
            </span>
          </div>
          <p className="text-xs text-slate-600 mb-3">
            आपली माहिती टाईप करण्याऐवजी बोलून नोंदवा. माहिती फॉर्ममध्ये भरल्यावर तपासून मगच जतन करा.
          </p>
          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer mb-3">
            <input
              type="checkbox"
              checked={voiceConsent}
              onChange={e => setVoiceConsent(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>{dict.voice.consent_label}</span>
          </label>
          <button
            type="button"
            onClick={handleVoiceAssistant}
            disabled={isTranscribing}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
          >
            {isTranscribing ? dict.common.loading : `🎤 ${dict.voice.speak_to_register}`}
          </button>
          {voiceMessage && (
            <p className="text-xs font-semibold text-emerald-800 mt-2">
              ✓ {voiceMessage}
            </p>
          )}
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-semibold mb-6">
            {errorMsg}
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-5 text-sm">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {dict.candidate.preferred_name} *
            </label>
            <input
              type="text"
              required
              value={preferredName}
              onChange={e => setPreferredName(e.target.value)}
              placeholder="उदा. रमेश पाटील"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {dict.candidate.district} *
              </label>
              <select
                value={district}
                onChange={e => setDistrict(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              >
                <option value="Nagpur">नागपूर (Nagpur)</option>
                <option value="Wardha">वर्धा (Wardha)</option>
                <option value="Bhandara">भंडारा (Bhandara)</option>
                <option value="Chandrapur">चंद्रपूर (Chandrapur)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {dict.candidate.taluka} *
              </label>
              <select
                value={taluka}
                onChange={e => setTaluka(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              >
                <option value="Butibori">बुटीबोरी (Butibori MIDC)</option>
                <option value="Hingna">हिंगणा (Hingna MIDC)</option>
                <option value="Umred">उमरेड (Umred)</option>
                <option value="Katol">काटोल (Katol)</option>
                <option value="Saoner">सावनेर (Saoner)</option>
                <option value="Nagpur Rural">नागपूर ग्रामीण</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {dict.candidate.trade} *
            </label>
            <select
              value={trade}
              onChange={e => {
                setTrade(e.target.value);
                const nextTrade = REGIONAL_TRADES.find(t => t.id === e.target.value);
                if (nextTrade && nextTrade.skills.length > 0) {
                  setSelectedSkills([nextTrade.skills[0].id]);
                }
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-medium"
            >
              {REGIONAL_TRADES.map(t => (
                <option key={t.id} value={t.id}>
                  {t.names[preferredLocale] || t.names.en}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-2">
              {dict.candidate.skills} (कौशल्यांवर क्लिक करा) *
            </label>
            <div className="flex flex-wrap gap-2">
              {currentTradeObj.skills.map(s => {
                const isChecked = selectedSkills.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSkillToggle(s.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      isChecked
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isChecked ? '✓ ' : '+ '}
                    {s.names[preferredLocale] || s.names.en}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {dict.candidate.experience}
              </label>
              <input
                type="number"
                min="0"
                max="480"
                value={experienceMonths}
                onChange={e => setExperienceMonths(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {dict.candidate.availability}
              </label>
              <select
                value={availability}
                onChange={e => setAvailability(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              >
                <option value="immediate">{dict.candidate.avail_immediate}</option>
                <option value="two_weeks">{dict.candidate.avail_two_weeks}</option>
                <option value="one_month">{dict.candidate.avail_one_month}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {dict.candidate.phone} (SMS व संपर्क) *
            </label>
            <input
              type="tel"
              pattern="[6-9][0-9]{9}"
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="10-digit mobile number"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition"
          >
            {saving ? dict.common.loading : dict.candidate.save_profile}
          </button>
        </form>
      </div>
    </main>
  );
}
