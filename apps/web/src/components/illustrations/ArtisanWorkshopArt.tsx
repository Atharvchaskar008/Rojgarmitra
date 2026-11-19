import React from 'react';

/**
 * Handcrafted Classical Engraving Illustration
 * Represents authentic human craft, vocational mastery, and hardworking industrial apprentices.
 * Inspired by archival industrial prints and architectural sketches.
 */
export function ArtisanWorkshopArt({ className = 'w-full h-full' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-[#E8F0FA] flex flex-col justify-between p-8 sm:p-12 select-none border-l-2 border-ink ${className}`}>
      {/* Background Decorative Grid / Blueprint lines */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#101638 1px, transparent 1px), radial-gradient(#101638 1px, #E8F0FA 1px)`,
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px'
        }}
      />

      {/* Top Header Tag */}
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-ink text-ink text-[11px] font-black tracking-wider uppercase shadow-solid-sm">
          <span>ROJGARMITRA ARCHIVES</span>
          <span>•</span>
          <span>EST. 2026</span>
        </div>
      </div>

      {/* Center Drawing: Architectural & Artisan Workshop Linework */}
      <div className="relative z-10 my-auto py-8 flex items-center justify-center">
        <svg
          viewBox="0 0 400 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full max-w-[340px] drop-shadow-sm"
        >
          {/* Workshop Window Arch */}
          <path
            d="M50 300 V120 C50 60 120 20 200 20 C280 20 350 60 350 120 V300"
            stroke="#101638"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M65 300 V125 C65 75 125 35 200 35 C275 35 335 75 335 125 V300"
            stroke="#526F9D"
            strokeWidth="1.25"
            strokeDasharray="4 4"
          />
          
          {/* Sunbeams & Industry skyline behind arch */}
          <path d="M200 35 V140 M140 50 L180 120 M260 50 L220 120" stroke="#B8C9E1" strokeWidth="1.5" />
          <path d="M90 220 H310" stroke="#101638" strokeWidth="2" />
          
          {/* Heavy Workbench Table */}
          <rect x="70" y="210" width="260" height="18" rx="2" fill="#FFFFFF" stroke="#101638" strokeWidth="2.5" />
          <rect x="90" y="228" width="20" height="72" fill="#FFFFFF" stroke="#101638" strokeWidth="2" />
          <rect x="290" y="228" width="20" height="72" fill="#FFFFFF" stroke="#101638" strokeWidth="2" />
          <line x1="100" y1="270" x2="300" y2="270" stroke="#101638" strokeWidth="2" />

          {/* Vise & Precision Tools on bench */}
          <path d="M110 210 V180 H140 V210 Z" fill="#E8F0FA" stroke="#101638" strokeWidth="2" />
          <circle cx="125" cy="195" r="4" fill="#101638" />
          <line x1="100" y1="185" x2="150" y2="185" stroke="#101638" strokeWidth="2" />
          
          {/* Gearwheel of Industry */}
          <g transform="translate(245, 155)">
            <circle cx="25" cy="25" r="22" stroke="#214783" strokeWidth="2.5" fill="#FFFFFF" />
            <circle cx="25" cy="25" r="9" stroke="#101638" strokeWidth="2" fill="#E8F0FA" />
            {/* Gear teeth */}
            <path d="M25 0 V6 M25 44 V50 M0 25 H6 M44 25 H50 M7 7 L12 12 M38 38 L43 43 M43 7 L38 12 M7 43 L12 38" stroke="#214783" strokeWidth="3" strokeLinecap="round" />
          </g>

          {/* Anvil & Hammer */}
          <path
            d="M165 210 L170 190 H210 C218 190 225 182 225 178 H160 L155 190 H150 V210 Z"
            fill="#FFFFFF"
            stroke="#101638"
            strokeWidth="2"
          />
          <path d="M185 165 L205 185 M190 160 L180 170" stroke="#214783" strokeWidth="2.5" strokeLinecap="round" />

          {/* Compass / Caliper drafting symbol */}
          <path d="M200 80 L180 130 M200 80 L220 130 M185 115 H215" stroke="#101638" strokeWidth="2" strokeLinecap="round" />
          <circle cx="200" cy="80" r="3" fill="#101638" />
        </svg>
      </div>

      {/* Bottom Quote / Human Caption */}
      <div className="relative z-10 pt-4 border-t-2 border-ink bg-white/70 backdrop-blur-sm p-4 rounded-xl shadow-solid-sm">
        <blockquote className="text-xs sm:text-sm font-black text-ink leading-snug">
          “श्रम आणि कौशल्य हेच राष्ट्राचे खरे सामर्थ्य.”
        </blockquote>
        <p className="text-[11px] font-bold text-ink-secondary mt-1 tracking-wide">
          Direct, dignified employment for every skilled hand across Vidarbha and beyond.
        </p>
      </div>
    </div>
  );
}
