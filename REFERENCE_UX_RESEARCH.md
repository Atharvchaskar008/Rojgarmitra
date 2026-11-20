# RojgarMitra (रोजगारमित्र) — Reference UX Research & Comparative Synthesis

*Author: Senior Product Designer & AI Systems Architect*  
*Date: November 19, 2026*  
*Scope: Systematic Analysis of Functional & Visual References for RojgarMitra*

---

## 1. Executive Research Matrix

| Product | Core Competency | Key Strengths Borrowed | Critical Flaws Avoided | RojgarMitra Application |
| :--- | :--- | :--- | :--- | :--- |
| **WorkIndia** | Blue-Collar Job Search & Speed | 3-second scannable Job Cards, transparent salary callouts, direct "Call HR" action | Opaque aggregator clutter, unverified consultancies, low design craft | Clean, structured Job Cards with verifiable employer contact & zero-brokerage guarantees |
| **Apna** | Vernacular Job Feed & Candidate Profiles | Horizontal scrollable filter pills, digital visiting card profile model, clear shift/location tags | Heavy ad monetization, aggressive upselling, noisy gamification | Progressive filter pills, structured candidate profile cards, zero pop-up distractions |
| **Google Pay** | Task Simplicity & Low Cognitive Load | Singular primary focus, circular/pill avatars, clear success states, radical navigation minimalism | Monolithic single-flow rigidity | High-contrast single primary actions, friction-free onboarding, calm fintech-grade visual trust |
| **Duolingo** | Conversational First-Use Onboarding | One-question-at-a-time flow, clear progress bar, friendly companion feedback | Excessive streaks/gamification, bright carnival colors, infantalizing animations | Step-by-step conversational voice onboarding with "Mitra" companion without gamified pressure |
| **DigiLocker** | Vernacular Public-Sector Trust | Native Marathi/Hindi support, standardized government category taxonomy, clear verification badges | Bureaucratic dryness, slow density, awkward desktop-first grids | DVET ITI course integration, official verification badges, dignified public-service trust |
| **SETTLE (Primary Visual)** | Modern Neo-Brutalist Soft-Pop Craft | Pale powder-blue canvas, pure white floating cards, midnight navy ink, solid offset shadows, pill actions | Cryptic Web3 terminology, empty space without information utility | Core visual design language across all screens, responsive tokens, and component architecture |

---

## 2. In-Depth Product UX Deconstructions

### A. WorkIndia (https://www.workindia.in/app/)

#### Strengths & Valuable Patterns:
- **3-Second Card Scan:** WorkIndia's job cards are engineered for rapid decision-making:
  1. *Role Title (Primary Anchor):* Bold, recognizable trade titles (e.g. "MIG Welder", "Wireman").
  2. *Salary Range (Financial Hook):* Prominently highlighted in bold numerals (e.g. `₹16,000 - ₹22,000 / month`).
  3. *Hyperlocal Proximity:* Specific industrial locality or landmark (e.g. "Hingna MIDC, Near Gate No. 2").
  4. *Direct Action Button:* Prominent "Call HR" button bypassing lengthy cover-letter workflows.
- **Low Jargon Threshold:** Eliminates corporate terminology ("Stakeholder management", "KPIs") in favor of clear operational requirements ("Day Shift", "ITI Welder Pass", "1 Year Experience").

#### Weaknesses & Traps to Avoid:
- Low visual craft and cluttered typography.
- Presence of unverified consultancy job leads that demand upfront "registration fees".
- Intrusive interstitial banners and distracting SMS spam loops.

#### RojgarMitra Adaptation:
- Adopt the scannable hierarchy: `Trade Title` → `Salary Range` → `MIDC Location & Distance (km)` → `Matched Skills Count` → `1-Tap Action`.
- Enforce strict verification: every employer contact is validated, and aggregator leads are transparently badged as unverified.

---

### B. Apna (https://www.apna.co/)

#### Strengths & Valuable Patterns:
- **Progressive Horizontal Filter Pills:** High-intent filters (Trade, Radius, Salary, Shift) sit immediately below the search bar as horizontal scrollable capsules.
- **Candidate "Digital Visiting Card":** Candidate profiles are chunked into visual summary cards (Trade, Certified Skills, Education, Preferred Locations) rather than traditional multi-page CVs.
- **Vernacular Language Prominence:** Regional language selection is treated as a top-level first-class citizen rather than buried in settings.

#### Weaknesses & Traps to Avoid:
- Aggressive spamming of "coins", badges, and artificial social feed distractions.
- Complex nested menus that confuse users with low digital literacy.

#### RojgarMitra Adaptation:
- Implement horizontal pill filters for Nagpur industrial clusters (`All`, `Hingna MIDC`, `Butibori MIDC`, `Umred`, `Kalmeshwar`).
- Utilize the modular card profile format that can be viewed and edited with a single tap.

---

### C. Google Pay (https://pay.google.com/)

#### Strengths & Valuable Patterns:
- **Radical Navigation Minimalism:** Eliminates complex multi-tier menus; user enters the app and is presented with immediate actionable contacts or primary tasks.
- **Large Thumb-Friendly Touch Targets:** Big circular or pill buttons (min 48px height) designed for one-handed thumb reach on mobile devices.
- **High-Affordance Trust Signals:** Distinct, unmistakable verification indicators (green checkmark, encrypted bank labels) that reassure users dealing with livelihood or finances.

#### Weaknesses & Traps to Avoid:
- Over-simplification that hides critical secondary information behind non-standard gestures.

#### RojgarMitra Adaptation:
- Mobile-first candidate view with a single persistent bottom action bar: `Jobs`, `Voice Mitra`, `My Profile`, `Upskilling`.
- Calm, dignified trust markers on verified employers (`✓ Verified Employer (Direct MIDC Plant)`).

---

### D. Duolingo (https://www.duolingo.com/)

#### Strengths & Valuable Patterns:
- **Bite-Sized Guided Onboarding:** Breaks down profile creation into bite-sized conversational steps:
  1. *What trade are you trained in?* (Single selection).
  2. *Which specific skills do you have?* (Multi-chip toggle).
  3. *Where do you live?* (Taluka/MIDC picker).
  4. *How far can you travel?* (Clear distance chips: 5 km, 15 km, 25 km).
- **Non-Threatening Progress Indication:** Subtle top progress bar indicating how close the candidate is to discovering matching jobs.
- **Warm Conversational Tone:** Friendly encouraging prompts that reduce user anxiety.

#### Weaknesses & Traps to Avoid:
- Aggressive streak pressure, cartoonish sound effects, and heavy gamification.
- Unnecessary character dialogues that slow down urgent task completion.

#### RojgarMitra Adaptation:
- Introduce **"Mitra" (मित्र)**: an abstract, warm geometric speech-bubble companion that guides the candidate through voice-based profile creation without childish distraction.
- Step-by-step onboarding with single-tap chip selections and immediate back/next navigation.

---

### E. DigiLocker (https://www.digilocker.gov.in/)

#### Strengths & Valuable Patterns:
- **Institutional Legitimacy & Trust:** Familiar design language of Indian public services (clear government departmental identifiers, seal of authenticity).
- **Trilingual Accessibility:** Equal visual weight given to Marathi (मराठी), Hindi (हिंदी), and English (English).
- **Structured Categorization:** Clear categorization of certifications (ITI CTS Marksheet, National Apprenticeship Certificate, Driving License).

#### Weaknesses & Traps to Avoid:
- Dense, bureaucratic layout with heavy tables and cramped font sizes.
- Frustrating session timeouts and cryptic error codes.

#### RojgarMitra Adaptation:
- Direct integration with Directorate of Vocational Education and Training (DVET) curriculum.
- Clear status badges: `DVET Certified`, `ITI Apprenticeship Ready`, `Direct Plant Interview`.

---

## 3. SETTLE — Primary Visual Inspiration Analysis

The attached SETTLE screenshot (`media_1795103449874_0d394b85.jpg`) provides the foundational visual vocabulary for RojgarMitra:

```
┌────────────────────────────────────────────────────────────────────────┐
│  SETTLE                                                  [☀️/☁️] [Profiles] │
│                                                                        │
│       ┌─────────────────────────────────────────────── [Attach][AI][↳] ┐│
│       │  Describe a deal...                                            ││
│       └────────────────────────────────────────────────────────────────┘│
│                  (Flatmates)  (Freelance)  (Renovation)  (Bonus)       │
│                                                                        │
│   ┌───────────────────────────┐    ┌───────────────────────────────┐   │
│   │ WORKSPACES                │    │                               │   │
│   │                           │    │                               │   │
│   │ None yet                  │    │                               │   │
│   └───────────────────────────┘▓   └───────────────────────────────┘▓  │
│    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │
└────────────────────────────────────────────────────────────────────────┘
```

### Visual Characteristics Deconstructed:

1. **Canvas & Atmosphere:**
   - Background: Pale powder-blue canvas (`#F1F5FC`). Not sterile white, but soft, airy, and calming.
   - Text & Outlines: Deep midnight navy ink (`#101638`). Crisp, authorative contrast (14:1 contrast ratio against canvas).
2. **Surfaces & Cards:**
   - Pure floating white surfaces (`#FFFFFF`).
   - Sharp, solid 1.5px to 2px midnight navy border (`#101638`).
   - Generously rounded corners (16px to 20px radius).
3. **Selective Hard Offset Shadows:**
   - Solid drop shadow offset down and to the right (`box-shadow: 4px 4px 0px #101638`).
   - Used **selectively** on high-intent cards, hero inputs, and signature buttons—never on every passive element.
4. **Pill-Shaped Interactive Elements:**
   - Rounded-full pill chips (`padding: 8px 18px`, `rounded-full`).
   - Filter chips use soft muted steel-blue background (`#D8E5F8`) or white with thin navy border.
5. **Calm Spatial Rhythm:**
   - Spacious margins and generous vertical padding.
   - Elimination of visual clutter: no noisy gradients, no glow effects, no transparent glassmorphism.

---

## 4. What RojgarMitra Will and Will NOT Copy

### What RojgarMitra ADAPTS:
- **Visuals:** SETTLE's pale powder-blue canvas, pure white floating cards, midnight navy borders, selective solid offset shadows, and pill actions.
- **Job Flow:** WorkIndia's 3-second scannable job cards with prominent salary and micro-market location.
- **Filters:** Apna's horizontal scrollable pill filters and modular candidate profile card.
- **Onboarding:** Duolingo's step-by-step conversational questioning powered by ElevenLabs voice and the friendly "Mitra" companion.
- **Trust:** DigiLocker's clean regional language support and official DVET ITI curriculum credentials.

### What RojgarMitra STRICTLY REFUSES:
- ❌ No tricolor/saffron-green political styling.
- ❌ No generic purple/violet "AI sparkle" gradients.
- ❌ No unverified consultancy leads or fabricated job salaries.
- ❌ No infantilizing cartoon mascots or aggressive gamification streaks.
- ❌ No low-contrast gray text on gray backgrounds.
- ❌ No hard offset shadows on every passive card (only on primary interactive elements).
