'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  const { preferredLocale, getIdToken } = useAuth();
  const dict = getDictionary(preferredLocale);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('male');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize welcome message when locale changes or on first mount
  useEffect(() => {
    const welcomeTexts: Record<SupportedLocale, string> = {
      mr: 'नमस्कार! मी मित्र — आपला रोजगार सल्लागार. स्थानिक नोकऱ्या, वेतन, किंवा शासकीय ITI कोर्सेसबद्दल बोला किंवा विचारा.',
      hi: 'नमस्ते! मैं मित्र — आपका रोजगार सलाहकार। स्थानीय नौकरियों, वेतन, या सरकारी ITI कोर्सेस के बारे में पूछें या बोलें।',
      en: 'Hello! I am Mitra — your career advisor. Ask or speak to me about local verified jobs, wages, or ITI courses.',
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
  }, [messages, isOpen]);

  // Initialize Speech Recognition cleanly
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.lang =
            preferredLocale === 'mr' ? 'mr-IN' : preferredLocale === 'hi' ? 'hi-IN' : 'en-IN';

          recognition.onresult = (event: any) => {
            const transcript = event.results?.[0]?.[0]?.transcript;
            if (transcript) {
              setInput(transcript);
              handleSend(transcript);
            }
            setIsListening(false);
            setVoiceNotice(null);
          };

          recognition.onerror = (err: any) => {
            console.warn('Speech recognition error event:', err.error);
            setIsListening(false);
            if (err.error === 'not-allowed') {
              setVoiceNotice(
                preferredLocale === 'mr'
                  ? 'मायक्रोफोन परवानगी नाकारली आहे. कृपया परवानगी द्या किंवा टाइप करा.'
                  : 'Microphone permission denied. Please enable mic or type below.'
              );
            }
          };

          recognition.onend = () => {
            setIsListening(false);
          };

          recognitionRef.current = recognition;
        } catch (e) {
          console.warn('Speech recognition setup failed:', e);
        }
      }
    }
  }, [preferredLocale]);

  const toggleListening = () => {
    setVoiceNotice(null);
    if (!recognitionRef.current) {
      setVoiceNotice(
        preferredLocale === 'mr'
          ? 'आपल्या ब्राउझरमध्ये थेट व्हॉइस रेकॉर्डर उपलब्ध नाही. कृपया टाइप करा.'
          : 'Live voice input is not supported in this browser. Please type below.'
      );
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch { }
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang =
          preferredLocale === 'mr' ? 'mr-IN' : preferredLocale === 'hi' ? 'hi-IN' : 'en-IN';
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err: any) {
        console.warn('Speech recognition start error:', err);
        setIsListening(false);
      }
    }
  };

  const handleSend = async (questionText?: string) => {
    const query = (questionText || input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setVoiceNotice(null);

    try {
      const res = await fetch('/api/v1/agents/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          locale: preferredLocale,
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
        setMessages(prev => [...prev, botMsg]);
        // Auto-play speech answer so candidate can listen immediately
        speakText(botMsg.id, json.data.answer);
      } else {
        throw new Error(json.error?.message || 'Failed to fetch answer');
      }
    } catch {
      const errorMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        sender: 'assistant',
        text:
          preferredLocale === 'mr'
            ? 'माफ करा, तांत्रिक अडचणीमुळे उत्तर देता आले नाही. कृपया पुन्हा विचारा.'
            : 'Sorry, I could not process your query at this moment. Please try again.',
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const speakText = async (msgId: string, text: string) => {
    // Stop any ongoing audio immediately
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
        audio.onended = () => {
          setSpeakingId(null);
          audioRef.current = null;
        };
        audio.onerror = () => {
          setSpeakingId(null);
          audioRef.current = null;
        };
        await audio.play();
      } else {
        // Fallback to browser SpeechSynthesis with smart Indian voice fallback
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          const voices = window.speechSynthesis.getVoices();

          const matchVoice = voices.find(v =>
            v.lang.startsWith(preferredLocale === 'mr' ? 'mr' : preferredLocale === 'hi' ? 'hi' : 'en-IN') ||
            v.lang.startsWith('hi') ||
            v.name.toLowerCase().includes('india')
          );
          if (matchVoice) {
            utterance.voice = matchVoice;
          }
          utterance.lang = preferredLocale === 'mr' ? 'hi-IN' : preferredLocale === 'hi' ? 'hi-IN' : 'en-IN';
          utterance.rate = 0.95;
          utterance.onend = () => setSpeakingId(null);
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

  // Plain-language Tier 2/3 queries
  const sampleQuestions: Record<SupportedLocale, string[]> = {
    mr: [
      'बुटीबोरी MIDC मध्ये वेल्डरच्या नोकऱ्या आहेत का?',
      'शासकीय ITI मध्ये मोफत प्रवेश कसा घ्यावा?',
      'कारखान्याशी थेट फोनवर कसे बोलावे?',
    ],
    hi: [
      'बुटीबोरी MIDC में वेल्डर की नौकरियां हैं क्या?',
      'सरकारी ITI में निशुल्क एडमिशन कैसे लें?',
      'फैक्टरी से सीधे फोन पर बात कैसे करें?',
    ],
    en: [
      'Are there welder jobs in Butibori MIDC?',
      'How to apply for free government ITI courses?',
      'How can I call the employer plant directly?',
    ],
  };

  const characterState = isListening ? 'listening' : speakingId ? 'speaking' : 'idle';

  return (
    <>
      {/* Mobile Backdrop Overlay when Assistant is Open */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-ink/20 backdrop-blur-xs z-40 sm:hidden"
          aria-hidden="true"
        />
      )}

      {/* Conversational Text Box (Cleanly docked on mobile and desktop) */}
      {isOpen && (
        <div className="fixed inset-x-3 bottom-16 sm:inset-auto sm:right-22 sm:bottom-6 z-50 w-auto sm:w-[380px] h-[480px] max-h-[80vh] bg-surface rounded-card border-2 border-ink shadow-solid-lg flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Header */}
          <div className="p-3 bg-ink text-white flex items-center justify-between border-b-2 border-ink">
            <div className="flex items-center gap-2.5">
              <MitraCharacter state={characterState} size={32} />
              <div>
                <h3 className="font-extrabold text-xs tracking-tight flex items-center gap-1.5">
                  मित्र — व्हॉइस मार्गदर्शक
                  <span className="text-[9px] bg-verified/20 text-verified-border px-1.5 py-0.5 rounded font-mono font-bold">
                    ONLINE
                  </span>
                </h3>
                <p className="text-[10px] text-steel/80">
                  {preferredLocale === 'mr'
                    ? 'थेट बोला किंवा ऐका'
                    : preferredLocale === 'hi'
                      ? 'सीधे बोलें या सुनें'
                      : 'Speak naturally or listen'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setVoiceGender(voiceGender === 'male' ? 'female' : 'male')}
                className="px-2 py-0.5 rounded-full bg-white/15 hover:bg-white/25 text-[10px] font-bold text-white transition flex items-center gap-1 border border-white/20"
                title="Switch Male/Female Voice"
              >
                <span>{voiceGender === 'male' ? '👨 पुरुष' : '👩 स्त्री'}</span>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition text-xs font-bold"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className="bg-canvas/80 px-2.5 py-1.5 border-b border-steel/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
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

          {/* Voice Notice (Inline Permission/Warning) */}
          {voiceNotice && (
            <div className="bg-alert-bg border-b border-alert-border text-alert px-3 py-1.5 text-[11px] font-bold flex items-center justify-between">
              <span>{voiceNotice}</span>
              <button onClick={() => setVoiceNotice(null)} className="text-alert font-black">✕</button>
            </div>
          )}

          {/* Message List */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-canvas/30 text-xs">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-2.5 border ${msg.sender === 'user'
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
                        className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded transition ${speakingId === msg.id
                          ? 'bg-alert-bg text-alert border border-alert-border'
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
                <span>मित्र माहिती तपासत आहे...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer: Big Tactile Microphone for Accessibility */}
          <div className="p-2.5 bg-white border-t-2 border-ink flex items-center gap-2">
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-full border-2 border-ink transition shadow-solid-sm flex items-center justify-center shrink-0 ${isListening
                ? 'bg-alert text-white animate-pulse'
                : 'bg-primary hover:bg-primary-hover text-white'
                }`}
              title="Speak Question"
              aria-label="Voice Input"
            >
              <IconMic className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
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
            मित्र शी बोला (Speak)
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
