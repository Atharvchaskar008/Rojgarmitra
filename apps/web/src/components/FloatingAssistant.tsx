'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { getDictionary, SupportedLocale } from '@rojgarmitra/i18n';

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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize welcome message when locale changes or on first open
  useEffect(() => {
    const welcomeTexts: Record<SupportedLocale, string> = {
      mr: 'नमस्कार! मी आपला रोजगारमित्र सहाय्यक आहे. विदर्भातील स्थानिक कारखान्यांतील नोकऱ्या, शासकीय ITI कोर्सेस किंवा थेट संपर्काबद्दल मला काहीही विचारा.',
      hi: 'नमस्ते! मैं आपका रोजगारमित्र सहायक हूँ। विदर्भ की स्थानीय फैक्टरियों में नौकरियों, सरकारी ITI कोर्सेस या सीधे संपर्क के बारे में मुझसे पूछें।',
      en: 'Hello! I am your RojgarMitra Assistant. Ask me anything about local factory jobs in Vidarbha, ITI courses, or direct employer contacts.',
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

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang =
          preferredLocale === 'mr' ? 'mr-IN' : preferredLocale === 'hi' ? 'hi-IN' : 'en-IN';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInput(transcript);
          }
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [preferredLocale]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert(
        preferredLocale === 'mr'
          ? 'आपल्या ब्राउझरमध्ये व्हॉइस इनपुट उपलब्ध नाही.'
          : 'Voice input is not supported in this browser.'
      );
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Speech recognition error:', err);
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
    if (speakingId === msgId) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
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
        }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => {
          setSpeakingId(null);
          audioRef.current = null;
        };
        audio.play();
      } else {
        // Fallback to browser SpeechSynthesis
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang =
            preferredLocale === 'mr' ? 'mr-IN' : preferredLocale === 'hi' ? 'hi-IN' : 'en-IN';
          utterance.onend = () => setSpeakingId(null);
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
      'बुटीबोरी MIDC मध्ये वेल्डरच्या नोकऱ्या?',
      'शासकीय ITI मध्ये मोफत कोर्सेस?',
      'कंपनीशी थेट संपर्क कसा करावा?',
    ],
    hi: [
      'बुटीबोरी MIDC में वेल्डर की नौकरियां?',
      'सरकारी ITI में मुफ्त कोर्सेस कौन से हैं?',
      'कंपनी से सीधा संपर्क कैसे करें?',
    ],
    en: [
      'Welder jobs in Butibori MIDC?',
      'Free government ITI courses?',
      'How do I contact employers directly?',
    ],
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open Mitra Assistant"
          className="relative w-14 h-14 rounded-full bg-primary hover:bg-primary-hover text-white flex items-center justify-center border-2 border-ink shadow-solid hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 transition duration-150 group"
        >
          <span className="text-2xl transform group-hover:scale-110 transition-transform">🌾</span>
          {/* Subtle live indicator dot */}
          <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-verified rounded-full border-2 border-white animate-pulse" />
        </button>
      </div>

      {/* Collapsible Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[380px] h-[520px] max-h-[80vh] bg-surface rounded-card border-2 border-ink shadow-solid-lg flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="p-3.5 bg-ink text-white flex items-center justify-between border-b-2 border-ink">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-steel-soft text-ink flex items-center justify-center font-bold text-sm border border-steel">
                🌾
              </div>
              <div>
                <h3 className="font-extrabold text-sm tracking-tight flex items-center gap-1.5">
                  रोजगारमित्र सहाय्यक
                  <span className="text-[10px] bg-verified/20 text-verified-border px-1.5 py-0.2 rounded font-mono font-bold">
                    ONLINE
                  </span>
                </h3>
                <p className="text-[11px] text-steel/80">
                  {preferredLocale === 'mr'
                    ? 'स्थानिक विदर्भ सल्लागार'
                    : preferredLocale === 'hi'
                    ? 'स्थानीय विदर्भ सलाहकार'
                    : 'Vidarbha Career Advisor'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Quick Prompts Bar */}
          <div className="bg-canvas/80 px-3 py-2 border-b border-steel/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            <span className="text-[10px] font-bold text-ink-muted uppercase whitespace-nowrap">
              सुझाव:
            </span>
            {sampleQuestions[preferredLocale].map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="whitespace-nowrap bg-white hover:bg-steel-soft border border-steel/80 text-ink text-[11px] font-medium px-2.5 py-1 rounded-full shadow-solid-sm transition"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Message List */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-canvas/30 text-xs">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 border ${
                    msg.sender === 'user'
                      ? 'bg-primary text-white border-primary-hover shadow-solid-sm'
                      : 'bg-white text-ink border-ink/20 shadow-solid-sm'
                  }`}
                >
                  <p className="leading-relaxed font-medium whitespace-pre-wrap">{msg.text}</p>

                  {/* Assistant Extra Actions (TTS & Citations) */}
                  {msg.sender === 'assistant' && msg.id !== 'welcome' && (
                    <div className="mt-2 pt-2 border-t border-steel/30 flex items-center justify-between text-[11px]">
                      <button
                        onClick={() => speakText(msg.id, msg.text)}
                        className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded transition ${
                          speakingId === msg.id
                            ? 'bg-alert-bg text-alert border border-alert-border'
                            : 'text-primary hover:bg-steel-soft'
                        }`}
                      >
                        {speakingId === msg.id ? '🔊 बोलत आहे...' : '🗣️ ऐका (Listen)'}
                      </button>

                      {msg.citations && msg.citations.length > 0 && (
                        <span className="text-[10px] text-ink-muted">
                          सत्यापित स्रोत: {msg.citations.length}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-ink-secondary text-xs p-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                <span>मित्र विचार करत आहे... (Thinking...)</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-2.5 bg-white border-t-2 border-ink flex items-center gap-2">
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2 rounded-full border border-ink transition ${
                isListening
                  ? 'bg-alert text-white animate-pulse'
                  : 'bg-steel-soft text-ink hover:bg-steel'
              }`}
              title="Speak Question"
            >
              🎤
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
              className="flex-1 bg-canvas border border-ink/20 rounded-full px-3.5 py-2 text-xs font-medium text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink"
            />

            <button
              type="button"
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="p-2 bg-ink hover:bg-ink/90 disabled:opacity-40 text-white rounded-full transition border border-ink shadow-solid-sm"
              aria-label="Send"
            >
              ➔
            </button>
          </div>
        </div>
      )}
    </>
  );
}
