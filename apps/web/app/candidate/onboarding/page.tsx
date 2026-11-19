'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { getDictionary, SupportedLocale } from '@rojgarmitra/i18n';
import { REGIONAL_TRADES, ALL_SKILL_IDS, getSkillName } from '@rojgarmitra/shared';

export default function CandidateOnboardingPage() {
  const router = useRouter();
  const { preferredLocale, user, getIdToken } = useAuth();
  const dict = getDictionary(preferredLocale);

  // Stepper state: 1 = Conversational Input, 2 = Review & Confirm
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: Natural Language & Voice
  const [conversationalText, setConversationalText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [voiceConsent, setVoiceConsent] = useState(true);
  const [extracting, setExtracting] = useState(false);

  // Step 2: Extracted Structured Fields
  const [preferredName, setPreferredName] = useState('');
  const [district, setDistrict] = useState('Nagpur');
  const [taluka, setTaluka] = useState('Butibori');
  const [village, setVillage] = useState('');
  const [trade, setTrade] = useState('welder');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['mig_welding']);
  const [experienceMonths, setExperienceMonths] = useState(24);
  const [expectedWage, setExpectedWage] = useState(18000);
  const [availability, setAvailability] = useState<'immediate' | 'two_weeks' | 'one_month'>('immediate');
  const [phone, setPhone] = useState('9876543210');

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  // Suggested Prompts
  const samplePrompts: Record<SupportedLocale, string[]> = {
    mr: [
      'मी राहुल देशमुख, बुटीबोरी. मला २ वर्षे MIG वेल्डिंग व फॅब्रिकेशनचा अनुभव आहे. लगेच काम हवे आहे.',
      'मी सचिन वानखेडे, हिंगणा MIDC. ITI वायरमन पूर्ण केले असून घरगुती आणि इंडस्ट्रियल पॅनल वायरिंगचे ज्ञान आहे.',
      'मी अमित कांबळे, नागपूर. CNC आणि लेथ मशीन ऑपरेटर म्हणून १८ महिन्यांचा अनुभव आहे.',
    ],
    hi: [
      'मैं राहुल देशमुख, बुटीबोरी। मुझे २ साल का MIG वेल्डिंग और शीट मेटल का अनुभव है। तुरंत काम चाहिए।',
      'मैं सचिन वानखेड़े, हिंगणा। ITI वायरमैन पास हूँ और घरेलू व पैनल वायरिंग का काम जानता हूँ।',
      'मैं अमित कांबले, नागपुर। CNC और लेथ मशीन ऑपरेटर के रूप में १८ महीने का अनुभव है।',
    ],
    en: [
      'I am Rahul Deshmukh from Butibori. 2 years experience in MIG welding and fabrication. Looking for immediate joining.',
      'I am Sachin Wankhede from Hingna. Certified ITI wireman with house and industrial panel wiring experience.',
      'I am Amit Kamble from Nagpur. CNC lathe operator with 18 months shop floor experience.',
    ],
  };

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang =
          preferredLocale === 'mr' ? 'mr-IN' : preferredLocale === 'hi' ? 'hi-IN' : 'en-IN';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript.trim()) {
            setConversationalText(prev => {
              // Append cleanly
              const base = prev.trim();
              return base ? `${base} ${currentTranscript}` : currentTranscript;
            });
          }
        };

        recognition.onerror = () => {
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [preferredLocale]);

  const toggleRecording = () => {
    if (!voiceConsent) {
      alert(dict.voice.consent_label);
      return;
    }

    if (!recognitionRef.current) {
      alert(
        preferredLocale === 'mr'
          ? 'आपल्या ब्राउझरमध्ये व्हॉइस रेकॉर्डिंग उपलब्ध नाही. कृपया टाइप करा.'
          : 'Voice recording not supported in this browser. Please type directly.'
      );
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.warn('Speech recognition error:', err);
      }
    }
  };

  // Extract structured details from natural language
  const handleExtract = () => {
    const text = conversationalText.trim();
    if (!text) {
      setErrorMsg(
        preferredLocale === 'mr'
          ? 'कृपया आपल्या कौशल्यांविषयी काही ओळी लिहा किंवा बोला.'
          : 'Please describe your skills in words or use the microphone.'
      );
      return;
    }

    setErrorMsg(null);
    setExtracting(true);

    const lower = text.toLowerCase();

    // 1. Trade Detection
    let detectedTrade = 'electrician';
    if (lower.includes('weld') || lower.includes('वेल्ड') || lower.includes('फॅब्रिकेशन')) {
      detectedTrade = 'welder';
    } else if (lower.includes('cnc') || lower.includes('fitter') || lower.includes('फिटर') || lower.includes('lathe') || lower.includes('टर्नर')) {
      detectedTrade = 'fitter_turner';
    } else if (lower.includes('wireman') || lower.includes('वायरमन') || lower.includes('electric') || lower.includes('इलेक्ट्रिशियन') || lower.includes('wiring')) {
      detectedTrade = 'electrician';
    }

    // 2. Taluka / Location Detection
    let detectedTaluka = 'Butibori';
    if (lower.includes('hingna') || lower.includes('हिंगणा')) {
      detectedTaluka = 'Hingna';
    } else if (lower.includes('butibori') || lower.includes('बुटीबोरी')) {
      detectedTaluka = 'Butibori';
    } else if (lower.includes('umred') || lower.includes('उमरेड')) {
      detectedTaluka = 'Umred';
    } else if (lower.includes('kalmeshwar') || lower.includes('कळमेश्वर')) {
      detectedTaluka = 'Kalmeshwar';
    } else if (lower.includes('katol') || lower.includes('काटोल')) {
      detectedTaluka = 'Katol';
    } else if (lower.includes('nagpur') || lower.includes('नागपूर')) {
      detectedTaluka = 'Nagpur City';
    }

    // 3. Name Detection
    let detectedName = '';
    const nameMatch = text.match(/(?:मी|मेरा नाम|I am|My name is)\s+([A-Za-z\u0900-\u097F]+(?:\s+[A-Za-z\u0900-\u097F]+)?)/i);
    if (nameMatch && nameMatch[1]) {
      detectedName = nameMatch[1].replace(/[,.]/g, '').trim();
    }
    if (!detectedName) {
      detectedName = preferredLocale === 'mr' ? 'राहुल देशमुख' : 'Rahul Deshmukh';
    }

    // 4. Skills Extraction
    const detectedSkills: string[] = [];
    if (lower.includes('mig') || lower.includes('मिग')) detectedSkills.push('mig_welding');
    if (lower.includes('arc') || lower.includes('आर्क')) detectedSkills.push('arc_welding');
    if (lower.includes('tig') || lower.includes('टीआयजी')) detectedSkills.push('tig_welding');
    if (lower.includes('wiring') || lower.includes('वायरिंग')) detectedSkills.push('house_wiring');
    if (lower.includes('panel') || lower.includes('पॅनेल')) detectedSkills.push('industrial_panel');
    if (lower.includes('motor') || lower.includes('मोटर')) detectedSkills.push('motor_rewinding');
    if (lower.includes('cnc') || lower.includes('सीएनसी')) detectedSkills.push('cnc_operation');
    if (lower.includes('lathe') || lower.includes('लेथ')) detectedSkills.push('lathe_operation');
    if (lower.includes('solar') || lower.includes('सोलर')) detectedSkills.push('solar_pv_wiring');

    if (detectedSkills.length === 0) {
      if (detectedTrade === 'welder') detectedSkills.push('mig_welding', 'arc_welding');
      else if (detectedTrade === 'fitter_turner') detectedSkills.push('cnc_operation', 'lathe_operation');
      else detectedSkills.push('house_wiring', 'industrial_panel');
    }

    // 5. Experience Detection
    let detectedExp = 24;
    const yearMatch = text.match(/(\d+)\s*(?:वर्षे|साल|years?|yr)/i);
    const monthMatch = text.match(/(\d+)\s*(?:महिने|माह|months?)/i);
    if (yearMatch && yearMatch[1]) {
      detectedExp = parseInt(yearMatch[1], 10) * 12;
    } else if (monthMatch && monthMatch[1]) {
      detectedExp = parseInt(monthMatch[1], 10);
    }

    // Update state & move to step 2
    setPreferredName(detectedName);
    setTrade(detectedTrade);
    setTaluka(detectedTaluka);
    setSelectedSkills(detectedSkills);
    setExperienceMonths(detectedExp);
    setExtracting(false);
    setStep(2);
  };

  const handleSkillToggle = (skillId: string) => {
    setSelectedSkills(prev =>
      prev.includes(skillId) ? prev.filter(s => s !== skillId) : [...prev, skillId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    if (selectedSkills.length === 0) {
      setErrorMsg(
        preferredLocale === 'mr'
          ? 'कृपया किमान एक कौशल्य निवडा.'
          : 'Please select at least one skill.'
      );
      setSaving(false);
      return;
    }

    const payload = {
      preferredName: preferredName.trim() || 'उमेदवार',
      district,
      taluka,
      village: village || undefined,
      trade,
      qualifications: ['10th', `ITI_${trade}`],
      skillIds: selectedSkills,
      experienceMonths: Number(experienceMonths),
      expectedWageRange: { min: expectedWage - 2000, max: expectedWage + 3000 },
      maximumTravelKm: 30,
      availability,
      phone: phone.trim() || '9876543210',
    };

    try {
      const token = await getIdToken();
      if (!token) {
        setErrorMsg(
          preferredLocale === 'mr'
            ? 'कृपया प्रोफाइल सेव्ह करण्यासाठी लॉगिन किंवा नोंदणी करा.'
            : 'Please sign in or register to save your profile.'
        );
        setSaving(false);
        return;
      }

      const res = await fetch('/api/v1/profile/candidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || 'Failed to save profile');
      }

      // Success -> navigate to candidate feed
      router.push('/candidate');
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setErrorMsg(err.message || dict.common.error);
    } finally {
      setSaving(false);
    }
  };

  const currentTradeObj = REGIONAL_TRADES.find(t => t.id === trade) || REGIONAL_TRADES[0];

  return (
    <main className="max-w-3xl mx-auto py-6 px-4">
      {/* Stepper Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/candidate"
          className="text-xs font-bold text-ink-secondary hover:text-ink transition"
        >
          ← {dict.common.back}
        </Link>
        <div className="flex items-center gap-2 text-xs font-bold">
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center border ${
              step === 1
                ? 'bg-ink text-white border-ink shadow-solid-sm'
                : 'bg-verified-bg text-verified border-verified-border'
            }`}
          >
            {step === 2 ? '✓' : '1'}
          </span>
          <span className={step === 1 ? 'text-ink' : 'text-ink-secondary'}>
            {preferredLocale === 'mr' ? 'कौशल्य सांगा' : 'Tell Skills'}
          </span>
          <span className="text-steel">──</span>
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center border ${
              step === 2
                ? 'bg-ink text-white border-ink shadow-solid-sm'
                : 'bg-canvas text-ink-muted border-steel'
            }`}
          >
            2
          </span>
          <span className={step === 2 ? 'text-ink' : 'text-ink-secondary'}>
            {preferredLocale === 'mr' ? 'माहिती तपासा' : 'Review & Save'}
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-5 p-3 rounded-xl bg-alert-bg border border-alert-border text-alert text-xs font-bold flex items-center gap-2">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: CONVERSATIONAL NATURAL LANGUAGE & VOICE */}
      {step === 1 && (
        <div className="settle-card-hero p-6 sm:p-8 space-y-6">
          <div className="text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-steel-soft border border-steel rounded-full text-xs font-bold text-steel-deep mb-3 shadow-sm">
              <span>🎙️ पायरी १: नैसर्गिक संवाद (Conversational Step)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
              {preferredLocale === 'mr'
                ? 'तुमच्या कामाविषयी व कौशल्यांविषयी सांगा'
                : preferredLocale === 'hi'
                ? 'अपने कार्य और कौशल के बारे में बताएं'
                : 'Tell us about your work & skills'}
            </h1>
            <p className="text-xs sm:text-sm text-ink-secondary mt-1 font-medium leading-relaxed">
              {preferredLocale === 'mr'
                ? 'कोणत्याही मोठ्या फॉर्म किंवा इंग्रजी बायोडाटाची गरज नाही. आपण काय काम जाणता, किती अनुभव आहे आणि कुठे काम हवे आहे ते येथे सांगा किंवा बोला.'
                : preferredLocale === 'hi'
                ? 'किसी बड़े फॉर्म या अंग्रेजी रिज्यूमे की आवश्यकता नहीं है। अपना काम, अनुभव और पसंदीदा स्थान यहाँ बोलें या लिखें।'
                : "No lengthy forms or English CV required. Simply describe what you do, your experience, and where you'd like to work."}
            </p>
          </div>

          {/* Voice Textarea Box */}
          <div className="relative">
            <textarea
              rows={5}
              value={conversationalText}
              onChange={e => setConversationalText(e.target.value)}
              placeholder={
                preferredLocale === 'mr'
                  ? 'उदा. मी राहुल देशमुख, बुटीबोरी. मला २ वर्षे MIG वेल्डिंग व शीट मेटल कामाचा अनुभव आहे. मला जवळच्या कारखान्यात काम हवे आहे...'
                  : preferredLocale === 'hi'
                  ? 'उदा. मैं राहुल देशमुख, बुटीबोरी। मुझे २ साल MIG वेल्डिंग का अनुभव है और कारखाने में काम चाहिए...'
                  : 'e.g. I am Rahul Deshmukh from Butibori with 2 years MIG welding experience looking for factory work...'
              }
              className="w-full bg-canvas border-2 border-ink/20 rounded-2xl p-4 text-sm font-semibold text-ink placeholder:text-ink-muted/70 focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink"
            />

            {/* Floating Mic Inside Textarea */}
            <div className="absolute right-3.5 bottom-3.5 flex items-center gap-2">
              <button
                type="button"
                onClick={toggleRecording}
                className={`p-2.5 rounded-full border-2 border-ink transition shadow-solid-sm flex items-center gap-1.5 text-xs font-bold ${
                  isRecording
                    ? 'bg-alert text-white animate-pulse'
                    : 'bg-primary hover:bg-primary-hover text-white'
                }`}
                title="Voice Input"
              >
                <span>🎤</span>
                <span>{isRecording ? 'ऐकत आहे...' : 'बोलून सांगा'}</span>
              </button>
            </div>
          </div>

          {/* Voice Consent Checkbox */}
          <div className="flex items-center gap-2 text-xs text-ink-secondary font-medium">
            <input
              type="checkbox"
              id="voiceConsent"
              checked={voiceConsent}
              onChange={e => setVoiceConsent(e.target.checked)}
              className="w-4 h-4 rounded border-ink/30 text-primary focus:ring-primary"
            />
            <label htmlFor="voiceConsent" className="cursor-pointer">
              {dict.voice.consent_label}
            </label>
          </div>

          {/* Quick Clickable Suggestions */}
          <div className="space-y-2 pt-2">
            <label className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider block">
              {preferredLocale === 'mr'
                ? 'किंवा खालील उदाहरणांवर क्लिक करा (Click sample to try):'
                : 'Or click a sample to try:'}
            </label>
            <div className="flex flex-col gap-2">
              {samplePrompts[preferredLocale].map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setConversationalText(prompt)}
                  className="text-left text-xs bg-canvas hover:bg-steel-soft border border-steel/80 p-2.5 rounded-xl font-medium text-ink transition hover:border-ink shadow-solid-sm"
                >
                  🌾 {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Extract & Proceed Button */}
          <div className="pt-4 border-t border-steel/40 flex items-center justify-between">
            <span className="text-xs text-ink-muted">
              {preferredLocale === 'mr'
                ? 'माहिती स्वयंचलित विश्लेषित केली जाईल'
                : 'Instant automatic extraction'}
            </span>
            <button
              type="button"
              onClick={handleExtract}
              disabled={extracting || !conversationalText.trim()}
              className="settle-pill-btn px-6 py-3 text-sm font-bold disabled:opacity-40"
            >
              {extracting
                ? dict.common.loading
                : preferredLocale === 'mr'
                ? 'माहिती तपासा व खात्री करा ➔'
                : 'Extract & Review Details ➔'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: REVIEW & CONFIRM STRUCTURED DETAILS */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="settle-card-hero p-6 sm:p-8 space-y-6">
          <div className="border-b border-steel/40 pb-4 flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-verified-bg border border-verified-border rounded-full text-xs font-bold text-verified mb-2">
                <span>✓ पायरी २: माहितीची खात्री करा (Review & Confirm)</span>
              </div>
              <h1 className="text-2xl font-black text-ink">
                {preferredLocale === 'mr'
                  ? 'काढलेली माहिती तपासून घ्या'
                  : 'Verify Extracted Information'}
              </h1>
              <p className="text-xs text-ink-secondary mt-1 font-medium">
                {preferredLocale === 'mr'
                  ? 'कोणत्याही माहितीवर क्लिक करून आपण ती बदलू शकता.'
                  : 'Tap on any field if you wish to adjust or refine it.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs font-bold text-primary hover:underline"
            >
              ← पुन्हा लिहा (Re-enter)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Preferred Name */}
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                {dict.candidate.preferred_name}
              </label>
              <input
                type="text"
                required
                value={preferredName}
                onChange={e => setPreferredName(e.target.value)}
                className="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink"
              />
            </div>

            {/* Trade Selection */}
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                {dict.candidate.trade}
              </label>
              <select
                value={trade}
                onChange={e => {
                  const newTrade = e.target.value;
                  setTrade(newTrade);
                  const tObj = REGIONAL_TRADES.find(t => t.id === newTrade);
                  if (tObj && tObj.skills.length > 0) {
                    setSelectedSkills([tObj.skills[0].id]);
                  }
                }}
                className="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink"
              >
                {REGIONAL_TRADES.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.names[preferredLocale]}
                  </option>
                ))}
              </select>
            </div>

            {/* Taluka / Location */}
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                {dict.candidate.taluka}
              </label>
              <select
                value={taluka}
                onChange={e => setTaluka(e.target.value)}
                className="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink"
              >
                <option value="Butibori">बुटीबोरी MIDC (Butibori)</option>
                <option value="Hingna">हिंगणा MIDC (Hingna)</option>
                <option value="Umred">उमरेड (Umred)</option>
                <option value="Kalmeshwar">कळमेश्वर (Kalmeshwar)</option>
                <option value="Katol">काटोल (Katol)</option>
                <option value="Nagpur City">नागपूर शहर (Nagpur City)</option>
              </select>
            </div>

            {/* Experience in Months */}
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                {dict.candidate.experience} ({Math.round(experienceMonths / 12)} वर्षे / {experienceMonths} महिने)
              </label>
              <input
                type="number"
                min={0}
                max={360}
                value={experienceMonths}
                onChange={e => setExperienceMonths(Number(e.target.value))}
                className="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink"
              />
            </div>

            {/* Expected Wage */}
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                {dict.candidate.expected_wage} (₹)
              </label>
              <input
                type="number"
                min={5000}
                step={500}
                value={expectedWage}
                onChange={e => setExpectedWage(Number(e.target.value))}
                className="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                {dict.candidate.phone}
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink"
              />
            </div>
          </div>

          {/* Availability Pills */}
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
              {dict.candidate.availability}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setAvailability('immediate')}
                className={`settle-pill-chip px-4 py-2 text-xs font-bold transition ${
                  availability === 'immediate'
                    ? 'bg-ink text-white shadow-solid-sm'
                    : 'bg-white text-ink-secondary hover:text-ink'
                }`}
              >
                ⚡ {dict.candidate.avail_immediate}
              </button>
              <button
                type="button"
                onClick={() => setAvailability('two_weeks')}
                className={`settle-pill-chip px-4 py-2 text-xs font-bold transition ${
                  availability === 'two_weeks'
                    ? 'bg-ink text-white shadow-solid-sm'
                    : 'bg-white text-ink-secondary hover:text-ink'
                }`}
              >
                📅 {dict.candidate.avail_two_weeks}
              </button>
              <button
                type="button"
                onClick={() => setAvailability('one_month')}
                className={`settle-pill-chip px-4 py-2 text-xs font-bold transition ${
                  availability === 'one_month'
                    ? 'bg-ink text-white shadow-solid-sm'
                    : 'bg-white text-ink-secondary hover:text-ink'
                }`}
              >
                🗓️ {dict.candidate.avail_one_month}
              </button>
            </div>
          </div>

          {/* Trade Specific Skills (Togglable Pills) */}
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
              {dict.candidate.skills} (कौशल्यांवर टॅप करून जोडा/काढा)
            </label>
            <div className="flex flex-wrap gap-2">
              {currentTradeObj.skills.map(s => {
                const isSelected = selectedSkills.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSkillToggle(s.id)}
                    className={`settle-pill-chip px-3.5 py-1.5 text-xs font-bold transition ${
                      isSelected
                        ? 'bg-primary text-white border-primary-hover shadow-solid-sm'
                        : 'bg-canvas text-ink-secondary hover:bg-steel-soft border-steel'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {s.names[preferredLocale]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Profile */}
          <div className="pt-4 border-t border-steel/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-ink-secondary font-medium">
              🌾 प्रोफाईल सेव्ह केल्यानंतर आपल्यासाठी योग्य नोकऱ्या लगेच दिसतील.
            </span>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto settle-pill-btn px-8 py-3 text-sm font-bold shadow-solid"
            >
              {saving ? dict.common.loading : `${dict.candidate.save_profile} ➔`}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
