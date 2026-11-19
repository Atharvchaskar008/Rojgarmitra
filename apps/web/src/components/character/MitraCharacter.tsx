'use client';

import React from 'react';

interface MitraCharacterProps {
  state?: 'idle' | 'listening' | 'speaking';
  size?: number;
  className?: string;
  onClick?: () => void;
}

/**
 * Handcrafted Vector Illustration of "Mitra"
 * A warm, smiling human advisor representing local Vidarbha youth guidance.
 * Pure SVG vectors with animated speaking/listening visual states (NO emojis).
 */
export function MitraCharacter({
  state = 'idle',
  size = 56,
  className = '',
  onClick,
}: MitraCharacterProps) {
  const isListening = state === 'listening';
  const isSpeaking = state === 'speaking';

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      className={`relative inline-flex items-center justify-center cursor-pointer select-none transition-transform active:scale-95 group ${className}`}
      style={{ width: size, height: size }}
      aria-label="Mitra Voice Assistant"
    >
      {/* Listening Pulse Waves */}
      {isListening && (
        <>
          <span className="absolute inset-0 rounded-full bg-alert/30 animate-ping pointer-events-none" />
          <span className="absolute -inset-2 rounded-full border-2 border-alert animate-pulse pointer-events-none" />
        </>
      )}

      {/* Speaking Sound Waves */}
      {isSpeaking && (
        <span className="absolute -inset-1.5 rounded-full border-2 border-primary/60 animate-ping pointer-events-none duration-1000" />
      )}

      {/* Outer Circle Container */}
      <div className="w-full h-full rounded-full bg-[#FFFFFF] border-2 border-ink shadow-solid flex items-center justify-center overflow-hidden transition-all group-hover:translate-x-0.5 group-hover:translate-y-0.5">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background Soft Glow */}
          <circle cx="50" cy="50" r="48" fill="#E8F0FA" />

          {/* Neck & Shirt Collar */}
          <path d="M42 66 H58 V80 H42 Z" fill="#FAD4B5" stroke="#101638" strokeWidth="2.5" />
          {/* Blue Work Collar / Polo */}
          <path
            d="M20 100 C20 78 35 72 43 72 L50 82 L57 72 C65 72 80 78 80 100 Z"
            fill="#214783"
            stroke="#101638"
            strokeWidth="2.5"
          />
          {/* Collar Triangles */}
          <polygon points="43,72 50,82 35,76" fill="#173463" />
          <polygon points="57,72 50,82 65,76" fill="#173463" />

          {/* Head & Face */}
          <ellipse
            cx="50"
            cy="46"
            rx="23"
            ry="25"
            fill="#FCDDC2"
            stroke="#101638"
            strokeWidth="2.5"
          />

          {/* Hair (Clean, modern Indian young professional style) */}
          <path
            d="M27 42 C26 26 36 17 50 17 C64 17 74 26 73 42 C71 31 63 26 50 26 C37 26 29 31 27 42 Z"
            fill="#101638"
          />
          <path
            d="M26 40 C26 26 38 18 53 18 C65 18 73 24 74 37 C70 30 60 26 48 26 C36 26 29 32 26 40 Z"
            fill="#101638"
          />

          {/* Ears */}
          <ellipse cx="26" cy="48" rx="4" ry="6" fill="#FCDDC2" stroke="#101638" strokeWidth="2" />
          <ellipse cx="74" cy="48" rx="4" ry="6" fill="#FCDDC2" stroke="#101638" strokeWidth="2" />

          {/* Eyes (Warm & Smiling) */}
          <path
            d="M38 43 Q43 39 46 43"
            stroke="#101638"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M54 43 Q57 39 62 43"
            stroke="#101638"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Eyebrows */}
          <path
            d="M37 38 Q42 35 46 38"
            stroke="#101638"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M54 38 Q58 35 63 38"
            stroke="#101638"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Nose */}
          <path
            d="M50 44 L49 51 H52"
            stroke="#101638"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Smiling Mouth */}
          {isSpeaking ? (
            /* Open Speaking Mouth */
            <path
              d="M43 56 Q50 66 57 56 Z"
              fill="#991B1B"
              stroke="#101638"
              strokeWidth="2"
              className="animate-pulse"
            />
          ) : (
            /* Warm Gentle Smile */
            <path
              d="M42 55 Q50 63 58 55"
              stroke="#101638"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          )}

          {/* Cheeks Blush */}
          <circle cx="36" cy="51" r="3.5" fill="#FCA5A5" opacity="0.6" />
          <circle cx="64" cy="51" r="3.5" fill="#FCA5A5" opacity="0.6" />
        </svg>
      </div>
    </div>
  );
}
