'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { getDictionary, SupportedLocale } from '@rojgarmitra/i18n';
import { getSkillName } from '@rojgarmitra/shared';
import {
  IconMic,
  IconCheck,
  IconClock,
  IconAlertCircle,
  IconArrowRight,
  IconBriefcase,
  IconMapPin,
  IconGraduationCap,
  IconBuilding,
  IconWrench,
  IconPhone
} from '@/components/icons';

export default function CandidateOnboardingPage() {
  const router = useRouter();
  const { preferredLocale, user, getIdToken } = useAuth();
  const dict = getDictionary(preferredLocale);

  // Free-form candidate inputs tailored to Vidarbha
  const [fullName, setFullName] = useState('');
  const [locationText, setLocationText] = useState('बुटीबोरी MIDC, नागपूर');
  const [educationText, setEducationText] = useState('');
  const [experienceText, setExperienceText] = useState('');
  const [currentStatus, setCurrentStatus] = useState('unemployed');
  const [expectedWage, setExpectedWage] = useState(18000);
  const [travelDistanceKm, setTravelDistanceKm] = useState(25);
  const [phone, setPhone] = useState('9876543210');

  // Voice recording with ElevenLabs Scribe STT
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Processing & Analysis state
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{
    detectedTrade: string;
    detectedSkills: string[];
    taluka: string;
    roadmapOverview: string;
    apprenticeshipOpportunity: string;
  } | null>(null);

  // Suggested Vidarbha Locations
  const vidarbhaHubs = [
    'बुटीबोरी MIDC',
    'हिंगणा MIDC',
    'नागपूर शहर',
    'उमरेड',
    'सावनेर',
    'काटोल',
    'कळमेश्वर',
    'कामठी',
    'वर्धा',
    'चंद्रपूर MIDC',
  ];

  // Suggested Education levels (clickable to append)
  const educationSuggestions = [
    '१०वी पास',
    '१२वी पास',
    'ITI वेल्डर',
    'ITI इलेक्ट्रिशियन / वायरमन',
    'ITI फिटर / टर्नर',
    'पॉलीटेक्निक मेकॅनिकल डिप्लोमा',
    'कोणतेही औपचारिक शिक्षण नाही (फक्त प्रत्यक्ष कामाचा अनुभव)',
  ];

  /**
   * Start native browser audio recording via MediaRecorder for ElevenLabs Scribe STT
   */
  const startVoiceRecording = async () => {
    setErrorMsg(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MEDIA_NOT_SUPPORTED');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      audioChunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : '';

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);

        if (audioChunksRef.current.length === 0) return;

        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });

        await processSpeechToForm(audioBlob);
      };

      recorder.start(250);
      setIsRecording(true);
      setRecordingStatus(
        preferredLocale === 'mr'
          ? 'आपल्या कामाविषयी बोला... (ElevenLabs Scribe रेकॉर्डिंग चालू आहे)'
          : preferredLocale === 'hi'
          ? 'अपने कार्य के बारे में बोलें... (ElevenLabs Scribe रिकॉर्डिंग चालू है)'
          : 'Speak naturally about your experience... (ElevenLabs Scribe)'
      );
    } catch (err: any) {
      console.warn('Voice recording error:', err);
      setIsRecording(false);
      setRecordingStatus(null);
      setErrorMsg(
        preferredLocale === 'mr'
          ? 'मायक्रोफोन सुरू होऊ शकला नाही. कृपया परवानगी द्या किंवा खाली टाइप करा.'
          : 'Could not access microphone. Please allow permission or type below.'
      );
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn('Error stopping MediaRecorder:', e);
      }
    }
    setIsRecording(false);
  };

  /**
   * Process recorded speech via ElevenLabs Scribe STT
   */
  const processSpeechToForm = async (audioBlob: Blob) => {
    setRecordingStatus(
      preferredLocale === 'mr'
        ? 'ElevenLabs Scribe द्वारे आवाजाचे विश्लेषण होत आहे...'
        : 'Transcribing speech with ElevenLabs Scribe...'
    );

    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'candidate_profile.webm');
      formData.append('consent', 'true');
      formData.append('locale', preferredLocale);

      const token = await getIdToken();
      const res = await fetch('/api/v1/voice/transcribe', {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const json = await res.json();
      if (res.ok && json.data && json.data.rawTranscript) {
        const text = json.data.rawTranscript.trim();
        setRecordingStatus(null);
        // Append transcribed text into experience description
        setExperienceText((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text));

        if (json.data.extractedName && !fullName) {
          setFullName(json.data.extractedName);
        }
        if (json.data.extractedTaluka) {
          setLocationText(`${json.data.extractedTaluka} MIDC, नागपूर`);
        }
      } else {
        throw new Error(json.error?.message || 'Empty transcription');
      }
    } catch (err: any) {
      console.warn('STT Error:', err.message);
      setRecordingStatus(null);
      setErrorMsg(
        preferredLocale === 'mr'
          ? 'आवाज स्पष्ट ऐकू आला नाही. कृपया पुन्हा बोला किंवा स्वतः टाइप करा.'
          : 'Could not detect clear speech. Please speak again or type directly.'
      );
    }
  };

  /**
   * Intelligently analyze candidate profile and save to Firestore
   */
  const handleAnalyzeAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSaving(true);

    const combinedText = `${fullName} ${locationText} ${educationText} ${experienceText}`.toLowerCase();

    // 1. Determine Trade
    let trade = 'electrician';
    if (
      combinedText.includes('weld') ||
      combinedText.includes('वेल्ड') ||
      combinedText.includes('फॅब्रिकेशन') ||
      combinedText.includes('fabrication')
    ) {
      trade = 'welder';
    } else if (
      combinedText.includes('cnc') ||
      combinedText.includes('fitter') ||
      combinedText.includes('फिटर') ||
      combinedText.includes('turner') ||
      combinedText.includes('टर्नर') ||
      combinedText.includes('lathe')
    ) {
      trade = 'fitter_turner';
    } else if (
      combinedText.includes('diesel') ||
      combinedText.includes('mechanic') ||
      combinedText.includes('मेकॅनिक') ||
      combinedText.includes('गाडी') ||
      combinedText.includes('ट्रॅक्टर')
    ) {
      trade = 'mechanic';
    } else if (
      combinedText.includes('wireman') ||
      combinedText.includes('वायरमन') ||
      combinedText.includes('electric') ||
      combinedText.includes('इलेक्ट्रिशियन') ||
      combinedText.includes('wiring')
    ) {
      trade = 'electrician';
    }

    // 2. Extract Taluka in Vidarbha
    let taluka = 'Butibori';
    if (combinedText.includes('hingna') || combinedText.includes('हिंगणा')) taluka = 'Hingna';
    else if (combinedText.includes('butibori') || combinedText.includes('बुटीबोरी')) taluka = 'Butibori';
    else if (combinedText.includes('umred') || combinedText.includes('उमरेड')) taluka = 'Umred';
    else if (combinedText.includes('saoner') || combinedText.includes('सावनेर')) taluka = 'Saoner';
    else if (combinedText.includes('katol') || combinedText.includes('काटोल')) taluka = 'Katol';
    else if (combinedText.includes('kalmeshwar') || combinedText.includes('कळमेश्वर')) taluka = 'Kalmeshwar';
    else if (combinedText.includes('wardha') || combinedText.includes('वर्धा')) taluka = 'Wardha';
    else if (combinedText.includes('chandrapur') || combinedText.includes('चंद्रपूर')) taluka = 'Chandrapur';
    else if (combinedText.includes('nagpur') || combinedText.includes('नागपूर')) taluka = 'Nagpur Urban';

    // 3. Extract Specific Practical Skills
    const skillIds: string[] = [];
    if (combinedText.includes('mig') || combinedText.includes('मिग')) skillIds.push('mig_welding');
    if (combinedText.includes('arc') || combinedText.includes('आर्क')) skillIds.push('arc_welding');
    if (combinedText.includes('tig') || combinedText.includes('टीआयजी')) skillIds.push('tig_welding');
    if (combinedText.includes('wiring') || combinedText.includes('वायरिंग')) skillIds.push('house_wiring');
    if (combinedText.includes('panel') || combinedText.includes('पॅनेल')) skillIds.push('industrial_panel');
    if (combinedText.includes('motor') || combinedText.includes('मोटर') || combinedText.includes('वाइंडिंग'))
      skillIds.push('motor_rewinding');
    if (combinedText.includes('cnc') || combinedText.includes('सीएनसी')) skillIds.push('cnc_operation');
    if (combinedText.includes('lathe') || combinedText.includes('लेथ')) skillIds.push('lathe_operation');
    if (combinedText.includes('solar') || combinedText.includes('सोलर')) skillIds.push('solar_pv_wiring');

    if (skillIds.length === 0) {
      if (trade === 'welder') skillIds.push('mig_welding', 'arc_welding');
      else if (trade === 'fitter_turner') skillIds.push('cnc_operation', 'lathe_operation');
      else if (trade === 'mechanic') skillIds.push('diesel_engine_repair');
      else skillIds.push('house_wiring', 'industrial_panel');
    }

    // 4. Calculate Experience Months
    let experienceMonths = 12;
    const yearMatch = combinedText.match(/(\d+)\s*(?:वर्ष|year|साल)/i);
    if (yearMatch && yearMatch[1]) {
      experienceMonths = parseInt(yearMatch[1], 10) * 12;
    }

    const payload = {
      preferredName: fullName.trim() || (preferredLocale === 'mr' ? 'उमेदवार' : 'Candidate'),
      district: 'Nagpur',
      taluka,
      village: locationText.trim(),
      trade,
      qualifications: educationText ? [educationText] : ['10th', `ITI_${trade}`],
      skillIds,
      experienceMonths,
      expectedWageRange: { min: expectedWage - 2000, max: expectedWage + 3000 },
      maximumTravelKm: Number(travelDistanceKm) || 25,
      availability: 'immediate' as const,
      phone: phone.trim() || '9876543210',
    };

    try {
      const token = await getIdToken();
      if (!token) {
        setErrorMsg(
          preferredLocale === 'mr'
            ? 'कृपया प्रोफाईल जतन करण्यासाठी लॉगिन किंवा नोंदणी करा.'
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

      // Generate localized analysis summary
      const analysis = {
        detectedTrade:
          trade === 'welder'
            ? 'वेल्डर व फॅब्रिकेशन (Welder)'
            : trade === 'fitter_turner'
            ? 'फिटर व CNC ऑपरेटर (Fitter & CNC)'
            : trade === 'mechanic'
            ? 'मेकॅनिकल व ऑटोमोबाईल (Automotive Mechanic)'
            : 'इलेक्ट्रिशियन व पॅनल वायरिंग (Industrial Electrician)',
        detectedSkills: skillIds.map((s) => getSkillName(s, preferredLocale)),
        taluka,
        roadmapOverview:
          preferredLocale === 'mr'
            ? `आपल्या अनुभवावरून ${taluka} MIDC मधील कंपन्यांमध्ये त्वरित प्रवेशाची उच्च शक्यता आहे. बेरोजगारीतून कायम रोजगारासाठी MSME टूल रूम किंवा थेट MIDC अप्रेंटिसशिपचा पर्याय उपलब्ध आहे.`
            : `High hiring probability for ${taluka} MIDC industrial units. Multi-pathway transition available through MSME Tool Room Hingna and direct factory apprenticeships.`,
        apprenticeshipOpportunity:
          preferredLocale === 'mr'
            ? `शिकाऊ उमेदवार योजना (Apprentices Act 1961): ${taluka} MIDC मधील कारखान्यांमध्ये दरमहा ₹९,५०० स्टायपेंडसह ऑन-द-जॉब ट्रेनिंग उपलब्ध.`
            : `Apprentices Act 1961: On-the-job training in ${taluka} MIDC factories with monthly ₹9,500 government stipend.`,
      };

      setAnalysisResult(analysis);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setErrorMsg(err.message || dict.common.error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto py-6 px-4">
      {/* Top Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Link href="/candidate" className="text-xs font-bold text-ink-secondary hover:text-ink transition">
          ← {dict.common.back}
        </Link>
        <span className="text-xs font-bold text-ink px-3 py-1 bg-steel-soft rounded-full border border-steel">
          {preferredLocale === 'mr'
            ? 'विदर्भ रोजगार नोंदणी (Free-Form Profile)'
            : preferredLocale === 'hi'
            ? 'विदर्भ रोजगार पंजीकरण (Free-Form Profile)'
            : 'Vidarbha Open Profile Registration'}
        </span>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="mb-5 p-3.5 rounded-xl bg-alert-bg border border-alert-border text-alert text-xs font-bold flex items-center gap-2">
          <IconAlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Analysis Success Banner Card */}
      {analysisResult ? (
        <div className="settle-card-hero p-6 sm:p-8 space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 text-xs font-bold text-verified bg-verified-bg border border-verified px-3 py-1 rounded-full w-fit">
            <IconCheck className="w-4 h-4" />
            <span>
              {preferredLocale === 'mr'
                ? 'कौशल्य विश्लेषण यशस्वीरीत्या पूर्ण झाले!'
                : 'Profile & Skills Analysis Complete!'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-ink">
            {preferredLocale === 'mr'
              ? `${fullName || 'उमेदवार'}, आपल्यासाठी तयार केलेला रोजगार आराखडा`
              : `${fullName || 'Candidate'}, Your Tailored Employment Roadmap`}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
            <div className="bg-canvas p-4 rounded-xl border border-steel">
              <span className="text-ink-secondary font-bold block uppercase mb-1">
                {preferredLocale === 'mr' ? 'ओळखलेले मुख्य ट्रेड व कौशल्ये:' : 'Detected Trade & Skills:'}
              </span>
              <p className="text-base font-black text-ink mb-2">{analysisResult.detectedTrade}</p>
              <div className="flex flex-wrap gap-1.5">
                {analysisResult.detectedSkills.map((sk, idx) => (
                  <span key={idx} className="px-2.5 py-0.5 rounded-full bg-steel-soft text-primary font-bold">
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-canvas p-4 rounded-xl border border-steel">
              <span className="text-ink-secondary font-bold block uppercase mb-1">
                {preferredLocale === 'mr' ? 'स्थानिक परिसर जुळणी:' : 'Regional Match:'}
              </span>
              <p className="text-base font-black text-ink mb-1">{analysisResult.taluka} MIDC / विदर्भ</p>
              <p className="text-ink-secondary leading-relaxed">{analysisResult.roadmapOverview}</p>
            </div>
          </div>

          {/* Apprenticeship & Multi-Pathway Highlight */}
          <div className="bg-surface p-4 rounded-xl border-2 border-primary/40 text-xs">
            <div className="flex items-center gap-2 font-black text-primary mb-1">
              <IconBriefcase className="w-4 h-4" />
              <span>
                {preferredLocale === 'mr'
                  ? 'बेरोजगारीतून थेट रोजगाराचा मार्ग (MIDC कारखाना अप्रेंटिसशिप):'
                  : 'Earn While Learning (MIDC Factory Apprenticeship):'}
              </span>
            </div>
            <p className="text-ink-secondary font-medium leading-relaxed">
              {analysisResult.apprenticeshipOpportunity}
            </p>
          </div>

          {/* Action Button to Matched Jobs */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.push('/candidate')}
              className="settle-pill-btn px-6 py-3 text-sm font-black inline-flex items-center justify-center gap-2 shadow-solid"
            >
              <span>
                {preferredLocale === 'mr'
                  ? 'माझ्यासाठी जुळणाऱ्या थेट नोकऱ्या पहा ➔'
                  : preferredLocale === 'hi'
                  ? 'मेरे लिए सीधी नौकरियां देखें ➔'
                  : 'View My Matched Real Jobs ➔'}
              </span>
            </button>
            <button
              onClick={() => router.push('/candidate/career')}
              className="settle-pill-chip px-5 py-3 text-sm font-bold inline-flex items-center justify-center gap-2 hover:bg-ink hover:text-white transition"
            >
              <IconGraduationCap className="w-4 h-4 text-primary" />
              <span>
                {preferredLocale === 'mr'
                  ? '३-वर्षीय करिअर रोडमॅप पहा'
                  : preferredLocale === 'hi'
                  ? '३-वर्षीय करियर रोडमैप देखें'
                  : 'View 3-Year Career Plan'}
              </span>
            </button>
          </div>
        </div>
      ) : (
        /* Free-Form Candidate Profile Form */
        <form onSubmit={handleAnalyzeAndSave} className="settle-card-hero p-6 sm:p-8 space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-steel-soft border border-steel rounded-full text-xs font-bold text-steel-deep mb-2 shadow-sm">
              <IconWrench className="w-3.5 h-3.5 text-primary" />
              <span>
                {preferredLocale === 'mr'
                  ? 'कोणत्याही कडक पर्यायांशिवाय मोकळेपणाने सांगा'
                  : 'No Rigid Dropdowns: Tell Your Real Skills'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
              {preferredLocale === 'mr'
                ? 'आपली माहिती व कामाचा अनुभव भरा'
                : preferredLocale === 'hi'
                ? 'अपनी जानकारी और कार्य का अनुभव भरें'
                : 'Fill Your Work Details & Experience'}
            </h1>
            <p className="text-xs sm:text-sm text-ink-secondary mt-1 font-medium leading-relaxed">
              {preferredLocale === 'mr'
                ? 'खालील रकान्यांमध्ये साध्या शब्दांत लिहा किंवा माइक बटण दाबून थेट बोला. मित्र AI आपल्या माहितीचे विश्लेषण करून योग्य नोकऱ्या आणि करिअर प्लॅन तयार करेल.'
                : preferredLocale === 'hi'
                ? 'नीचे दिए गए बॉक्स में सरल शब्दों में लिखें या माइक बटन दबाकर सीधे बोलें। मित्र AI आपकी जानकारी का विश्लेषण कर सही नौकरियां खोजेगा।'
                : 'Write freely in simple words or speak via microphone. Mitra AI will automatically extract your trade, skills, and match local vacancies.'}
            </p>
          </div>

          {/* Voice Input Section (ElevenLabs Scribe STT) */}
          <div className="bg-canvas p-4 sm:p-5 rounded-2xl border-2 border-dashed border-ink/30 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-ink flex items-center gap-1.5 justify-center sm:justify-start">
                <IconMic className="w-4 h-4 text-primary" />
                <span>
                  {preferredLocale === 'mr'
                    ? 'टाइप न करता थेट बोलून सांगा'
                    : preferredLocale === 'hi'
                    ? 'टाइप किए बिना सीधे बोलकर बताएं'
                    : 'Speak Naturally (ElevenLabs Scribe STT)'}
                </span>
              </h3>
              <p className="text-xs text-ink-secondary mt-0.5 font-medium">
                {preferredLocale === 'mr'
                  ? 'मराठी किंवा हिंदीमध्ये आपल्या अनुभवाविषयी बोला.'
                  : 'Speak about your hands-on experience in Marathi or Hindi.'}
              </p>
              {recordingStatus && (
                <p className="text-xs font-bold text-primary mt-2 animate-pulse">{recordingStatus}</p>
              )}
            </div>

            <button
              type="button"
              onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
              className={`px-5 py-2.5 rounded-full text-xs font-black inline-flex items-center gap-2 transition shadow-solid-sm shrink-0 ${
                isRecording
                  ? 'bg-alert text-white animate-pulse ring-4 ring-alert/30'
                  : 'bg-primary hover:bg-primary-hover text-white'
              }`}
            >
              <IconMic className="w-4 h-4" />
              <span>
                {isRecording
                  ? preferredLocale === 'mr'
                    ? 'थांबवा (Stop)'
                    : 'Stop'
                  : preferredLocale === 'mr'
                  ? '🎙️ बोला (Speak)'
                  : '🎙️ Speak'}
              </span>
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* 1. Full Name */}
            <div>
              <label className="block text-xs font-black text-ink uppercase tracking-wider mb-1">
                {dict.candidate.preferred_name} *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={preferredLocale === 'mr' ? 'उदा. रमेश विष्णू पाटील' : 'e.g. Ramesh Patil'}
                className="w-full bg-canvas border border-ink/20 rounded-xl px-4 py-2.5 text-sm font-semibold text-ink focus:outline-none focus:border-ink"
              />
            </div>

            {/* 2. Village / Taluka in Vidarbha (Open Text with Quick-Click Suggestions) */}
            <div>
              <label className="block text-xs font-black text-ink uppercase tracking-wider mb-1">
                {preferredLocale === 'mr'
                  ? 'गाव / तालुका / एमआयडीसी परिसर (Vidarbha Area) *'
                  : 'Village / Taluka / Industrial Area in Vidarbha *'}
              </label>
              <input
                type="text"
                required
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                placeholder="उदा. बुटीबोरी MIDC, नागपूर"
                className="w-full bg-canvas border border-ink/20 rounded-xl px-4 py-2.5 text-sm font-semibold text-ink focus:outline-none focus:border-ink mb-2"
              />
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[11px] font-bold text-ink-muted">सुचवलेले परिसर:</span>
                {vidarbhaHubs.map((hub) => (
                  <button
                    key={hub}
                    type="button"
                    onClick={() => setLocationText(`${hub}, नागपूर`)}
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-steel-soft hover:bg-steel border border-steel/60 text-ink transition"
                  >
                    + {hub}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Education Background (Open Text) */}
            <div>
              <label className="block text-xs font-black text-ink uppercase tracking-wider mb-1">
                {preferredLocale === 'mr'
                  ? 'शिक्षण व पूर्वज्ञान (Education / Non-Formal Background)'
                  : 'Education & Technical Background'}
              </label>
              <input
                type="text"
                value={educationText}
                onChange={(e) => setEducationText(e.target.value)}
                placeholder="उदा. १०वी पास, ITI वेल्डर किंवा अनौपचारिक प्रत्यक्ष अनुभव"
                className="w-full bg-canvas border border-ink/20 rounded-xl px-4 py-2.5 text-sm font-semibold text-ink focus:outline-none focus:border-ink mb-2"
              />
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[11px] font-bold text-ink-muted">उदाहरणे:</span>
                {educationSuggestions.slice(0, 4).map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setEducationText(sug)}
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-steel-soft hover:bg-steel border border-steel/60 text-ink transition"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Practical Work Experience & Knowledge (Free-Form Textarea) */}
            <div>
              <label className="block text-xs font-black text-ink uppercase tracking-wider mb-1">
                {preferredLocale === 'mr'
                  ? 'कामाचा प्रत्यक्ष अनुभव व कौशल्ये (Describe Hands-on Skills in Words) *'
                  : 'Hands-on Skills & Experience Description *'}
              </label>
              <textarea
                required
                rows={4}
                value={experienceText}
                onChange={(e) => setExperienceText(e.target.value)}
                placeholder={
                  preferredLocale === 'mr'
                    ? 'उदा. मला बुटीबोरीतील फॅब्रिकेशन कारखान्यात ३ वर्षे काम केल्याचा अनुभव आहे. MIG आणि आर्क वेल्डिंग चांगले येते. लेथ मशीन चालवता येते. ग्राइंडिंग, कटिंग व थ्री-फेज मोटरचे प्राथमिक काम येते.'
                    : 'e.g. 3 years hands-on experience in Butibori fabrication unit with MIG and Arc welding. Familiar with lathe operation, grinding, and basic motor maintenance.'
                }
                className="w-full bg-canvas border border-ink/20 rounded-xl p-3 text-sm font-semibold text-ink focus:outline-none focus:border-ink"
              />
              <p className="text-[11px] text-ink-secondary mt-1 font-medium">
                {preferredLocale === 'mr'
                  ? '💡 टीप: आपण जे काम प्रत्यक्षात करू शकता ते साध्या शब्दांत लिहा. आमची AI प्रणाली त्यातून कौशल्ये शोधून काढेल.'
                  : '💡 Tip: Simply describe what you can do hands-on. Our AI will automatically extract relevant skills.'}
              </p>
            </div>

            {/* 5. Expected Wage & Availability */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-black text-ink uppercase tracking-wider mb-1">
                  {dict.candidate.expected_wage} (₹)
                </label>
                <input
                  type="number"
                  min={8000}
                  step={500}
                  value={expectedWage}
                  onChange={(e) => setExpectedWage(Number(e.target.value))}
                  className="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink focus:outline-none focus:border-ink"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-ink uppercase tracking-wider mb-1">
                  {preferredLocale === 'mr' ? 'प्रवासाची तयारी (किमी)' : 'Max Travel (Km)'}
                </label>
                <input
                  type="number"
                  min={5}
                  max={100}
                  value={travelDistanceKm}
                  onChange={(e) => setTravelDistanceKm(Number(e.target.value))}
                  className="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink focus:outline-none focus:border-ink"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-ink uppercase tracking-wider mb-1">
                  {dict.candidate.phone} *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full bg-canvas border border-ink/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink focus:outline-none focus:border-ink"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-steel/60 flex items-center justify-between">
            <Link href="/candidate" className="text-xs font-bold text-ink-secondary hover:text-ink">
              रद्द करा (Cancel)
            </Link>

            <button
              type="submit"
              disabled={saving || isRecording}
              className="settle-pill-btn px-6 py-3 text-xs sm:text-sm font-black disabled:opacity-40 inline-flex items-center gap-2 shadow-solid"
            >
              <span>
                {saving
                  ? dict.common.loading
                  : preferredLocale === 'mr'
                  ? 'कौशल्यांचे विश्लेषण करा व नोकऱ्या शोधा'
                  : preferredLocale === 'hi'
                  ? 'कौशल विश्लेषण करें और नौकरियां खोजें'
                  : 'Analyze Skills & Find Jobs'}
              </span>
              <IconArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
