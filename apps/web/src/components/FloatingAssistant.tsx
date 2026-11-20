'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { getDictionary, SupportedLocale } from '@rojgarmitra/i18n';
import { MitraCharacter } from './character/MitraCharacter';
import {
  IconMic,
  IconVolume,
  IconArrowRight,
  IconShieldCheck,
  IconClock,
  IconBuilding,
  IconMapPin
} from './icons';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citations?: string[];
  audioUrl?: string;
  isPlaying?: boolean;
}

export function FloatingAssistant() {
  const pathname = usePathname();
  const { preferredLocale, user, userRole, getIdToken } = useAuth();
  const dict = getDictionary(preferredLocale);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('male');
  const [jarvisMode, setJarvisMode] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const jarvisModeRef = useRef<boolean>(false);

  // Keep jarvisModeRef in sync
  useEffect(() => {
    jarvisModeRef.current = jarvisMode;
  }, [jarvisMode]);

  // Clean localized greetings
  useEffect(() => {
    const welcomeTexts: Record<SupportedLocale, string> = {
      mr: 'नमस्कार! मी मित्र — आपला AI व्हॉइस मार्गदर्शक. विदर्भातील थेट नोकऱ्या, एमआयडीसी अप्रेंटिसशिप किंवा शासकीय कोर्सेसबद्दल मोकळेपणाने बोला किंवा विचारा.',
      hi: 'नमस्ते! मैं मित्र — आपका AI वॉयस साथी। विदर्भ की सीधी नौकरियां, MIDC अप्रेंटिसशिप या सरकारी कोर्सेस के बारे में सीधे बोलकर या लिखकर पूछें।',
      en: 'Hello! I am Mitra — your regional AI voice companion. Ask or speak freely about verified Vidarbha jobs, MIDC apprenticeships, or vocational courses.',
    };

    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        text: welcomeTexts[preferredLocale] || welcomeTexts.mr,
      },
    ]);
  }, [preferredLocale]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  // Stop recording or audio when closed
  useEffect(() => {
    if (!isOpen) {
      stopRecording();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setSpeakingId(null);
    }
  }, [isOpen]);

  /**
   * Start native browser audio recording via MediaRecorder for ElevenLabs Scribe STT
   */
  const startRecording = async () => {
    setVoiceNotice(null);
    // Stop any ongoing speech playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setSpeakingId(null);

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
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
        setIsListening(false);

        if (audioChunksRef.current.length === 0) {
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });

        await processAudioWithElevenLabsScribe(audioBlob);
      };

      recorder.start(250); // Slice chunks every 250ms
      setIsListening(true);
      setStatusText(
        preferredLocale === 'mr'
          ? 'मी ऐकत आहे... (ElevenLabs Scribe)'
          : preferredLocale === 'hi'
          ? 'मैं सुन रहा हूँ... (ElevenLabs Scribe)'
          : 'Listening... (ElevenLabs Scribe STT)'
      );
    } catch (err: any) {
      console.warn('Microphone start error:', err);
      setIsListening(false);
      setStatusText(null);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setVoiceNotice(
          preferredLocale === 'mr'
            ? 'मायक्रोफोन परवानगी नाकारली आहे. कृपया ब्राउझरमध्ये परवानगी द्या.'
            : preferredLocale === 'hi'
            ? 'माइक्रोफ़ोन अनुमति अस्वीकृत। कृपया ब्राउज़र सेटिंग्स में अनुमति दें।'
            : 'Microphone permission denied. Please allow microphone in browser.'
        );
      } else {
        setVoiceNotice(
          preferredLocale === 'mr'
            ? 'व्हॉइस रेकॉर्डिंग सुरू होऊ शकले नाही. कृपया टाइप करा.'
            : 'Could not start voice recording. Please type below.'
        );
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn('Error stopping MediaRecorder:', e);
      }
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  /**
   * Sends audio blob directly to /api/v1/voice/transcribe (ElevenLabs Scribe STT)
   */
  const processAudioWithElevenLabsScribe = async (audioBlob: Blob) => {
    setStatusText(
      preferredLocale === 'mr'
        ? 'आवाजाचे रूपांतर होत आहे...'
        : preferredLocale === 'hi'
        ? 'आवाज से टेक्स्ट तैयार हो रहा है...'
        : 'Transcribing speech with ElevenLabs Scribe...'
    );

    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'candidate_voice.webm');
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
        const transcribedText = json.data.rawTranscript.trim();
        setStatusText(null);
        if (transcribedText) {
          setInput(transcribedText);
          await handleSend(transcribedText);
        }
      } else {
        throw new Error(json.error?.message || 'STT transcription returned empty text');
      }
    } catch (err: any) {
      console.warn('[ElevenLabs Scribe STT error]:', err.message);
      setStatusText(null);
      setVoiceNotice(
        preferredLocale === 'mr'
          ? 'आवाज स्पष्ट ऐकू आला नाही. कृपया पुन्हा बोला किंवा टाइप करा.'
          : preferredLocale === 'hi'
          ? 'आवाज स्पष्ट नहीं सुनाई दी। कृपया दोबारा बोलें या टाइप करें।'
          : 'Could not detect clear speech. Please speak clearly or type below.'
      );
    }
  };

  /**
   * Main query submission to /api/v1/agents/ask with full website context
   */
  const handleSend = async (questionText?: string) => {
    const query = (questionText || input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setVoiceNotice(null);
    setStatusText(
      preferredLocale === 'mr'
        ? 'मित्र उत्तर तयार करत आहे...'
        : preferredLocale === 'hi'
        ? 'मित्र उत्तर तैयार कर रहा है...'
        : 'Mitra is thinking with site context...'
    );

    try {
      const token = await getIdToken();
      const res = await fetch('/api/v1/agents/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          question: query,
          locale: preferredLocale,
          currentPath: pathname || '/',
          userRole: userRole || 'candidate',
        }),
      });

      const json = await res.json();
      if (json.data && json.data.answer) {
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: json.data.answer,
          citations: json.data.citations,
        };
        setMessages((prev) => [...prev, botMsg]);
        setStatusText(null);

        // Auto-speak response using ElevenLabs Pro voice
        await speakText(botMsg.id, json.data.answer);
      } else {
        throw new Error(json.error?.message || 'Failed to fetch answer');
      }
    } catch {
      setStatusText(null);
      const errorMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        sender: 'assistant',
        text:
          preferredLocale === 'mr'
            ? 'माफ करा, तांत्रिक अडचणीमुळे संपर्क होऊ शकला नाही. कृपया पुन्हा विचारा.'
            : preferredLocale === 'hi'
            ? 'क्षमा करें, तकनीकी कारण से उत्तर नहीं मिल सका। कृपया दोबारा पूछें।'
            : 'Sorry, I could not process your request at this moment. Please try again.',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Speak text using ElevenLabs Pro Multilingual Voice (/api/v1/voice/speak)
   */
  const speakText = async (msgId: string, text: string) => {
    // Stop ongoing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    if (speakingId === msgId) {
      setSpeakingId(null);
      return;
    }

    try {
      setSpeakingId(msgId);
      const token = await getIdToken();
      const res = await fetch('/api/v1/voice/speak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          text,
          locale: preferredLocale,
          gender: voiceGender,
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('audio')) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;

        const onAudioEnd = () => {
          setSpeakingId(null);
          audioRef.current = null;

          // JARVIS Continuous Voice Mode: automatically listen again for next turn!
          if (jarvisModeRef.current) {
            setTimeout(() => {
              if (jarvisModeRef.current) {
                startRecording();
              }
            }, 600);
          }
        };

        audio.onended = onAudioEnd;
        audio.onerror = () => {
          setSpeakingId(null);
          audioRef.current = null;
        };

        await audio.play();
      } else {
        // Fallback to browser SpeechSynthesis
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          const voices = window.speechSynthesis.getVoices();
          const matchVoice = voices.find(
            (v) =>
              v.lang.startsWith(preferredLocale === 'mr' ? 'mr' : preferredLocale === 'hi' ? 'hi' : 'en-IN') ||
              v.lang.startsWith('hi')
          );
          if (matchVoice) utterance.voice = matchVoice;
          utterance.lang = preferredLocale === 'mr' ? 'hi-IN' : preferredLocale === 'hi' ? 'hi-IN' : 'en-IN';
          utterance.rate = 0.95;

          utterance.onend = () => {
            setSpeakingId(null);
            if (jarvisModeRef.current) {
              setTimeout(() => {
                if (jarvisModeRef.current) startRecording();
              }, 600);
            }
          };
          utterance.onerror = () => setSpeakingId(null);
          window.speechSynthesis.speak(utterance);
        } else {
          setSpeakingId(null);
        }
      }
    } catch {
      setSpeakingId(null);
    }
  };

  const sampleQuestions: Record<SupportedLocale, string[]> = {
    mr: [
      'बुटीबोरी MIDC मध्ये वेल्डरच्या नोकऱ्या कुठे आहेत?',
      'शासकीय ITI व्यतिरिक्त काय पर्याय आहेत?',
      'एमआयडीसी प्रत्यक्ष अप्रेंटिसशिप कशी मिळेल?',
      'माझ्या कौशल्यांचा करिअर प्लॅन कसा पाहावा?',
    ],
    hi: [
      'बुटीबोरी MIDC में वेल्डर की नौकरियां कहाँ हैं?',
      'सरकारी ITI के अलावा अन्य क्या विकल्प हैं?',
      'MIDC ऑन-द-जॉब अप्रेंटिसशिप कैसे मिलेगी?',
      'मेरा स्किल आधारित करियर प्लान कैसे देखें?',
    ],
    en: [
      'Where are the verified jobs in Butibori MIDC?',
      'What upskilling options exist besides ITI?',
      'How to get an MIDC factory apprenticeship?',
      'How does my 3-year career roadmap work?',
    ],
  };

  const characterState = isListening ? 'listening' : speakingId ? 'speaking' : 'idle';

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-ink/20 backdrop-blur-xs z-40 sm:hidden"
          aria-hidden="true"
        />
      )}

      {/* Main Assistant Dialog */}
      {isOpen && (
        <div className="fixed inset-x-2.5 bottom-16 sm:inset-auto sm:right-22 sm:bottom-6 z-50 w-auto sm:w-[410px] h-[520px] max-h-[82vh] bg-surface rounded-card border-2 border-ink shadow-solid-lg flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Header */}
          <div className="p-3 bg-ink text-white flex items-center justify-between border-b-2 border-ink">
            <div className="flex items-center gap-2.5">
              <MitraCharacter state={characterState} size={34} />
              <div>
                <h3 className="font-extrabold text-xs tracking-tight flex items-center gap-1.5">
                  <span>मित्र — AI व्हॉइस साथी</span>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-1.5 py-0.2 rounded font-mono font-bold">
                    PRO LIVE
                  </span>
                </h3>
                <p className="text-[10px] text-steel/80">
                  {preferredLocale === 'mr'
                    ? 'ElevenLabs Pro व्हॉइस + थेट संवाद'
                    : preferredLocale === 'hi'
                    ? 'ElevenLabs Pro वॉयस + सीधा संवाद'
                    : 'ElevenLabs Pro Voice + Full Context'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Voice Gender Switcher */}
              <button
                type="button"
                onClick={() => setVoiceGender(voiceGender === 'male' ? 'female' : 'male')}
                className="px-2 py-0.5 rounded-full bg-white/15 hover:bg-white/25 text-[10px] font-bold text-white transition flex items-center gap-1 border border-white/20"
                title="Switch Male/Female Voice"
              >
                <span>{voiceGender === 'male' ? '👨 पुरुष' : '👩 स्त्री'}</span>
              </button>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition text-xs font-bold"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* JARVIS Hands-Free Voice Mode Banner */}
          <div className="bg-canvas border-b border-steel/60 px-3 py-1.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${jarvisMode ? 'bg-primary animate-ping' : 'bg-steel'}`} />
              <span className="text-[11px] font-bold text-ink">
                {preferredLocale === 'mr'
                  ? 'सतत व्हॉइस संवाद (JARVIS Mode)'
                  : preferredLocale === 'hi'
                  ? 'सतत वॉयस मोड (JARVIS Mode)'
                  : 'Continuous Voice (JARVIS Mode)'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                const nextState = !jarvisMode;
                setJarvisMode(nextState);
                if (nextState && !isListening) {
                  startRecording();
                }
              }}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black transition border ${
                jarvisMode
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white text-ink-secondary border-steel hover:text-ink'
              }`}
            >
              {jarvisMode ? 'ON ✓' : 'OFF'}
            </button>
          </div>

          {/* Quick Prompts Bar */}
          <div className="bg-canvas/60 px-2.5 py-1.5 border-b border-steel/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            {sampleQuestions[preferredLocale].map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="whitespace-nowrap bg-white hover:bg-steel-soft border border-steel/80 text-ink text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-solid-sm transition shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Inline Permission / Warning Notice */}
          {voiceNotice && (
            <div className="bg-alert-bg border-b border-alert-border text-alert px-3 py-1.5 text-[11px] font-bold flex items-center justify-between">
              <span>{voiceNotice}</span>
              <button onClick={() => setVoiceNotice(null)} className="text-alert font-black">
                ✕
              </button>
            </div>
          )}

          {/* Active Status Indicator */}
          {statusText && (
            <div className="bg-steel-soft/80 border-b border-steel px-3 py-1 text-[11px] font-bold text-primary flex items-center gap-2 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span>{statusText}</span>
            </div>
          )}

          {/* Message List */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-canvas/30 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-2.5 border ${
                    msg.sender === 'user'
                      ? 'bg-primary text-white border-primary-hover shadow-solid-sm'
                      : 'bg-white text-ink border-ink/20 shadow-solid-sm'
                  }`}
                >
                  <p className="leading-relaxed font-semibold whitespace-pre-wrap">{msg.text}</p>

                  {/* Audio Listen Button */}
                  {msg.sender === 'assistant' && (
                    <div className="mt-2 pt-1.5 border-t border-steel/30 flex items-center justify-between text-[11px]">
                      <button
                        onClick={() => speakText(msg.id, msg.text)}
                        className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded transition ${
                          speakingId === msg.id
                            ? 'bg-alert-bg text-alert border border-alert-border animate-pulse'
                            : 'text-primary hover:bg-steel-soft'
                        }`}
                      >
                        <IconVolume className="w-3.5 h-3.5" />
                        <span>{speakingId === msg.id ? 'बोलत आहे...' : 'ऐका (Listen)'}</span>
                      </button>

                      {msg.citations && msg.citations.length > 0 && (
                        <span className="text-[10px] text-ink-muted inline-flex items-center gap-1 font-bold">
                          <IconShieldCheck className="w-3 h-3 text-verified" />
                          सत्यापित स्रोत
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-ink-secondary text-xs p-2 font-bold">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                <span>
                  {preferredLocale === 'mr'
                    ? 'मित्र माहिती तपासत आहे...'
                    : preferredLocale === 'hi'
                    ? 'मित्र जानकारी जांच रहा है...'
                    : 'Mitra is verifying information...'}
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-2.5 bg-white border-t-2 border-ink flex items-center gap-2">
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-full border-2 border-ink transition shadow-solid-sm flex items-center justify-center shrink-0 ${
                isListening
                  ? 'bg-alert text-white animate-pulse ring-4 ring-alert/30'
                  : 'bg-primary hover:bg-primary-hover text-white'
              }`}
              title={isListening ? 'Stop Recording' : 'Speak via ElevenLabs Scribe STT'}
              aria-label="Voice Input"
            >
              <IconMic className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={
                preferredLocale === 'mr'
                  ? 'येथे प्रश्न विचारा किंवा बोला...'
                  : preferredLocale === 'hi'
                  ? 'यहाँ प्रश्न पूछें या बोलें...'
                  : 'Ask question or speak here...'
              }
              className="flex-1 bg-canvas border border-ink/20 rounded-full px-3 py-1.5 text-xs font-semibold text-ink focus:outline-none focus:border-ink"
            />

            <button
              type="button"
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="p-2.5 bg-ink hover:bg-ink/90 disabled:opacity-40 text-white rounded-full transition border border-ink shadow-solid-sm shrink-0"
              aria-label="Send"
            >
              <IconArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Human Smiling Character Launcher Button */}
      <div className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-50 flex flex-col items-center gap-1">
        {!isOpen && (
          <div className="hidden sm:block bg-white border-2 border-ink px-2.5 py-0.5 rounded-full text-[10px] font-black text-ink shadow-solid-sm whitespace-nowrap animate-bounce">
            {preferredLocale === 'mr'
              ? 'मित्राशी बोला (Speak)'
              : preferredLocale === 'hi'
              ? 'मित्र से बोलें (Speak)'
              : 'Speak with Mitra'}
          </div>
        )}
        <MitraCharacter
          state={characterState}
          size={48}
          className="sm:w-[58px] sm:h-[58px]"
          onClick={() => setIsOpen(!isOpen)}
        />
      </div>
    </>
  );
}
