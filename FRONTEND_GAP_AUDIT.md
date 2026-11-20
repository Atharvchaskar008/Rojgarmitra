# ROJGARMITRA — FRONTEND GAP AUDIT & RESOLUTION REPORT
**Audit Date:** November 2026  
**Platform Version:** SETTLE Minimalist Vernacular Edition  
**Target Region:** Vidarbha (Nagpur, Butibori, Hingna MIDC, Umred, Katol)  

---

## EXECUTIVE SUMMARY

This audit evaluates the RojgarMitra web frontend across 10 critical UX, technical, and architectural criteria. The objective is to eliminate generic "AI-slop" patterns, ensure robust multilingual support (Marathi, Hindi, English), replace cumbersome checkbox lists with conversational natural-language onboarding, implement real Firebase authentication, and guarantee 100% transparent job vacancy evidence for rural youth.

---

## 10 AUDITED AREAS & GAP ANALYSIS

| Area | Observed Behavior | Required Behavior | Severity | Responsible File(s) | Status |
|---|---|---|---|---|---|
| **1. First-time Visit vs. Returning Session Routing** | Previously, public visitors were shown a direct candidate dashboard without clear authentication options. | Public landing page at `/` with explicit Login and Sign Up actions; role-aware redirection to candidate or employer portal. | **P0** | `apps/web/app/page.tsx`<br>`apps/web/src/components/Navbar.tsx` | RESOLVED |
| **2. Login, Signup & Password Reset Flows** | Missing dedicated `/login` and `/signup` routes; users could not sign in or recover passwords. | Dedicated `/login` and `/signup` pages with Firebase Auth, role toggles (Jobseeker vs. Employer), friendly vernacular error handling, and password reset. | **P0** | `apps/web/app/login/page.tsx`<br>`apps/web/app/signup/page.tsx`<br>`apps/web/src/lib/auth/AuthContext.tsx` | RESOLVED |
| **3. Language Switcher & Persistent Locale State** | Header buttons toggled state locally but lacked smooth persistence and global dictionary synchronization. | Three-way toggle (मराठी, हिन्दी, English) with instant reactive re-rendering, local storage persistence, and Firestore sync. | **P0** | `apps/web/src/components/Navbar.tsx`<br>`apps/web/src/lib/auth/AuthContext.tsx`<br>`packages/i18n` | RESOLVED |
| **4. Conversational Skills Entry vs. Static Walls** | Onboarding demanded navigating dozens of skill checkboxes and trade dropdowns with hardcoded voice mockups. | Single conversational natural-language textarea with microphone input, suggested prompts, Gemini extraction, and a 1-tap review/confirmation screen. | **P0** | `apps/web/app/candidate/onboarding/page.tsx`<br>`apps/web/app/api/v1/voice/transcribe/route.ts` | RESOLVED |
| **5. Voice Assistant Ergonomics** | Embedded assistant occupied valuable screen real estate and pushed forms below the fold. | Lightweight floating assistant button ("Mitra") in bottom-right corner, opening a collapsible chat/voice drawer with ElevenLabs TTS. | **P0** | `apps/web/src/components/FloatingAssistant.tsx`<br>`apps/web/app/layout.tsx` | RESOLVED |
| **6. Typography & Vernacular Readability** | Generic system fonts produced uneven spacing and poor rendering of Marathi/Hindi conjunct consonants. | Google Fonts `Inter` for Latin characters and `Noto Sans Devanagari` for Marathi/Hindi text with calibrated line heights. | **P0** | `apps/web/app/layout.tsx`<br>`apps/web/tailwind.config.ts`<br>`apps/web/app/globals.css` | RESOLVED |
| **7. Real Job Discovery Evidence** | Risk of user skepticism regarding synthetic or unverified job listings. | Strict separation: Verified employer plant postings (e.g. BraMHanee Industries, Butibori) vs. raw public web leads with transparent source badges. | **P0** | `apps/web/app/candidate/page.tsx`<br>`apps/web/src/lib/services/job-discovery.ts` | RESOLVED |
| **8. Navbar & Mobile Responsiveness** | Missing mobile drawer; navigation links collapsed and were inaccessible on phones. | Responsive navbar with mobile hamburger menu, quick language switcher, and accessible links to all portals. | **P1** | `apps/web/src/components/Navbar.tsx` | RESOLVED |
| **9. Form Validation & Friendly Error Recovery** | Raw English Firebase error codes (e.g., `auth/user-not-found`) displayed to vernacular users. | Plain-language vernacular error alerts (e.g., "ईमेल किंवा पासवर्ड चुकीचा आहे") with actionable recovery prompts. | **P1** | `apps/web/app/login/page.tsx`<br>`apps/web/app/signup/page.tsx` | RESOLVED |
| **10. End-to-End Integration & Error State Behavior** | Partial disconnects between voice recording, STT transcription, and profile saving. | Seamless end-to-end pipeline: Web Speech API / ElevenLabs STT → Gemini extraction → structured preview → Firestore save → job match. | **P0** | Entire Web Pipeline | RESOLVED |

---

## ARCHITECTURAL CONFORMANCE

1. **Design System:** SETTLE Minimalist Aesthetics  
   - Canvas: `#F1F5FC`
   - Surface: `#FFFFFF`
   - Ink: `#101638` (Deep Midnight Blue)
   - Accent: `#214783` (Industrial Steel Blue)
   - Shadows: Solid offset `4px 4px 0px #101638` (zero blur, tactile retro-modern feel)
   - Buttons: Rounded pill shapes (`rounded-full`) with solid contrast borders

2. **Zero-Fabrication Policy:**  
   - No mock salaries or synthetic vacancies are shown.
   - All external search results from Tavily carry `unverified_lead` flags and point directly to source URLs.
   - Plant vacancies verified directly with employers display the green `verified_vacancy` badge with verified contact details.
