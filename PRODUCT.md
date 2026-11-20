# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

1. **Vocational & ITI Candidates (Primary Jobseekers):**
   - **Profile:** ITI graduates (Electrician, Wireman, Welder, Fitter, Machinist, Motor Mechanic), rural and semi-urban youth across Vidarbha/Nagpur (Hingna, Butibori, Umred, Kalmeshwar, Katol), informal technicians, and entry-level industrial jobseekers.
   - **Operating Scene:** Primarily low-to-mid-tier Android smartphones (360px–390px viewports), mobile 4G/5G connections, varying digital literacy. Often uncomfortable with complex multi-page desktop forms and English corporate jargon.
   - **Job to be Done:** Find genuine, nearby industrial jobs matching their specific trade; understand travel distance and authentic wage ranges; receive clear Marathi/Hindi guidance; quickly bridge missing skills through Government ITI programs.

2. **Local Industrial Employers & MSME Plant Heads:**
   - **Profile:** Small-to-medium manufacturing units, fabrication workshops, electrical contractors, logistics warehouses in Hingna and Butibori MIDC.
   - **Operating Scene:** Plant floor managers and local business owners accessing via mobile browsers or factory desktop computers.
   - **Job to be Done:** Post authentic shift and trade requirements without bureaucratic recruitment agencies; quickly review nearby candidates verified by trade qualification and industrial proximity; update applicant interview statuses with 1 click.

---

## Product Purpose

RojgarMitra (रोजगारमित्र — "Employment Friend") transforms rural and semi-urban job discovery from an opaque, spam-filled aggregator experience into a trusted, region-grounded employment ecosystem. It exists to bridge the deep information gap between skilled vocational youth and local industrial manufacturers in Maharashtra, starting with the Nagpur industrial belt.

**Success means:**
- Zero fabricated jobs or fake salary promises: every job is an authentic direct employer listing or a strictly verified public vacancy.
- Candidates know within 5 seconds if a job matches their skills, exactly where the plant is located, and what it pays.
- A candidate who is not yet qualified for a role receives a concrete, government-backed upskilling roadmap (DVET curriculum) rather than a rejection dead-end.

---

## Positioning

Unlike white-collar platforms (LinkedIn, Naukri) that demand English resumes and complex ATS profiles, and unlike predatory aggregators that scrape expired leads and fabricate fake vacancy counts, **RojgarMitra guarantees regional truth:**
1. **Hyperlocal Grounding:** Micro-market proximity matching for Nagpur MIDC clusters (Butibori, Hingna, Umred).
2. **Zero-Fabrication Guarantee:** Every job carries transparent evidence—either direct employer posting with verified contact or independently parsed Schema.org JSON-LD vacancy with source attribution.
3. **Voice-First & Native Marathi:** Voice-driven conversational onboarding powered by authentic speech recognition and high-fidelity Marathi vocal guidance.
4. **Skill-to-DVET Bridge:** Directly integrates with Directorate of Vocational Education and Training (DVET) Maharashtra curriculum to bridge candidate skill gaps.

---

## Operating Context

- **Candidate Journey:**
  - Landing on mobile browser → Language selection (मराठी / हिंदी / English) → One-tap Voice or guided Onboarding with "Mitra" → Profile confirmation → Hyperlocal Job Feed sorted by deterministic match score → Transparent Match Breakdown (matched vs missing skills) → One-tap Application or Call HR → Skill Gap to Government ITI Course recommendations.
- **Employer Journey:**
  - Mobile/Desktop access → Simple business authentication → Post Vacancy with industrial area, shift, trade, and wage brackets → Review nearby candidate applications with trade badges → 1-tap Status Update (Shortlisted / Interview / Rejected).
- **Environment:** High-contrast mobile screens, direct sunlight on factory gates, multilingual voice in noisy environments.

---

## Capabilities and Constraints

- **Confirmed Capabilities:**
  - Next.js 15 App Router with TypeScript and Tailwind CSS.
  - Live Firebase Authentication & Cloud Firestore (`rojgarmitra-dev`).
  - Google Gemini AI client (`gemini-2.5-flash-lite`) with search grounding and Marathi vocational guidance.
  - Tavily Search API for real-time web job discovery.
  - ElevenLabs Voice API for Marathi text-to-speech and structured voice transcription.
  - Deterministic 3-factor matching engine (`@rojgarmitra/shared`).
  - Strict vacancy verifier with zero-fabrication contract.
  - TRAI DLT-compliant SMS template preview generator.
- **Durable Constraints:**
  - DO NOT fabricate salary, vacancies, or employer identities.
  - DO NOT deploy or alter production environment variables until user approval.
  - Preserve all working backend API routes and Firebase authentication contracts.
  - Ensure WCAG AA compliance (4.5:1 text contrast on pale powder-blue canvas).

---

## Brand Commitments

- **Name:** RojgarMitra (रोजगारमित्र).
- **Visual Identity:** Inspired by SETTLE—crisp pale powder-blue canvas (`#F1F5FC`), pure white floating surfaces (`#FFFFFF`), midnight navy ink (`#101638`), solid offset navy drop shadows, and friendly rounded pill actions.
- **Companion:** "Mitra" (मित्र) — a subtle, friendly geometric speech-bubble companion that guides candidates through voice interactions without childish cartoon clutter.
- **Anti-Patterns Strictly Banned:**
  - No tricolor / saffron-green nationalistic cliches.
  - No generic purple/violet "AI magic" gradients.
  - No blurry glassmorphism or low-contrast gray text.
  - No fake candidate transcripts or hardcoded demo jobs in production.

---

## Evidence on Hand

- Verified live vacancy parsing on WorkIndia for Butibori industrial vacancies (`BraMHanee Industries`, MIG Welder).
- Official Directorate of Vocational Education and Training (DVET) curriculum mapping for Craftsmen Training Schemes (CTS).
- Authentic Government ITI catalog across Nagpur, Hingna, Butibori, and Umred.
- Live ElevenLabs Marathi speech audio stream (97 KB MP3 verified).
- 44 passing automated unit, integration, and security rules tests.

---

## Product Principles

1. **The User Should Understand the Next Action Without Reading a Manual:** Zero jargon, large tap targets, intuitive micro-copy.
2. **Radical Transparency over False Hope:** If no verified vacancy exists, show unverified leads honestly and recommend official government apprenticeship portals (MahaJobs, NCS).
3. **Fast Feedback, No Dead-Ends:** Every rejection or missing skill immediately offers a verified Government ITI upskilling solution.
4. **Voice as a Bridge, Not a Gimmick:** Voice onboarding extracts structured profile attributes, always displays the real transcript, and requires candidate confirmation.
5. **Calm, Human, Premium Craft:** A dignified experience for vocational workers that feels as polished as modern consumer fintech.

---

## Accessibility & Inclusion

- Target standard: WCAG 2.1 AA.
- High legibility for Marathi (Devnagari) script with appropriate line-height (`leading-relaxed` / 1.6) and font sizing (`min 16px` for body inputs).
- Minimum tap target size: 48x48px on mobile for all buttons and interactive chips.
- Full keyboard navigation and visible high-contrast focus rings.
