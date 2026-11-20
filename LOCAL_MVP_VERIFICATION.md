# RojgarMitra (रोजगारमित्र) — Local MVP Verification & Engineering Audit

*Date: November 19, 2026*  
*Platform: RojgarMitra (रोजगारमित्र) — AI-Powered Regional Employment & Upskilling Platform*  
*Target Pilot: Nagpur Rural & Semi-Urban Clusters (Hingna MIDC, Butibori MIDC, Umred, Kalmeshwar)*

---

## 1. Executive Summary

This engineering audit documents the validation of RojgarMitra as a fully functional, local-first Minimum Viable Product (MVP). The platform has been audited against real APIs, live database instances, rigorous verification mechanisms, and zero-fabrication standards.

All simulated, mock, and loose heuristics have been eliminated:
- Quarantined synthetic seed jobs in Cloud Firestore.
- Implemented strict Schema.org JSON-LD vacancy verification that refuses to fabricate salaries, vacancies, or employer names.
- Successfully verified live individual vacancies directly from public job postings (e.g. WorkIndia for Butibori industrial vacancies).
- Connected and tested live Tavily Search API, ElevenLabs Multilingual Voice synthesis, and Google Gemini AI.
- Passed 100% of unit, integration, and security rules tests.
- Compiled all 27 Next.js API routes and 7 frontend pages with zero TypeScript errors.

---

## 2. Comprehensive 20-Point Verification Report

### Point 1: Architecture & Monorepo Structure
- **Monorepo Layout:** Turborepo managing `apps/web` (Next.js 15, React 19, Tailwind CSS), `apps/mobile` (Expo React Native, Android target), `packages/shared` (deterministic matching engine, validation schemas), and `packages/i18n` (tri-lingual Marathi, Hindi, English dictionaries).
- **Package Integrity:** `@rojgarmitra/shared` and `@rojgarmitra/i18n` are consumed as internal workspace packages without duplicate code.
- **Port Isolation:** Local web application runs on port 3000; Firebase local emulator runs on port 8085 when active.

### Point 2: Centralized Environment & Config Audit
- **Server-Side Validation:** `apps/web/src/lib/config/server-config.ts` securely validates all environment variables at runtime with type-safe fallbacks.
- **Zero Client Secret Exposure:** No server API keys (`GEMINI_API_KEY`, `TAVILY_API_KEY`, `FIREBASE_PRIVATE_KEY`, `ELEVENLABS_API_KEY`) are exposed in `NEXT_PUBLIC_` or `EXPO_PUBLIC_` variables.
- **Git Safety:** `.gitignore` excludes `.env.local`, `.env*.local`, service-account `.json` files, and `.vercel`.

### Point 3: Firebase Authentication & RBAC
- **Token Verification:** `apps/web/src/lib/firebase/admin.ts` provides `verifyAuthToken()` extracting UID, email, and custom claims (`role: 'candidate' | 'employer' | 'admin'`).
- **Role-Based Access Control:** Tested in `tests/unit/auth-rbac.test.ts` (8 passing tests). Unauthorized requests without tokens return HTTP 401; non-employer accounts attempting to post jobs return HTTP 403.
- **Session Persistence:** Browser client maintains auth state through Firebase Web SDK (`apps/web/src/lib/firebase/client.ts`).

### Point 4: Cloud Firestore Integration
- **Database Target:** Connected to live Google Cloud Firestore project `rojgarmitra-dev`.
- **Collections Active:** `candidates`, `employers`, `jobs`, `applications`, `externalJobs`, `training_centers`, `courses`, `evidence_corpus`.
- **Private Key Handling:** Server config parses multi-line RSA PEM private keys (`\n` newline replacement).

### Point 5: Synthetic Data Quarantine Audit
- **Quarantine Action:** Executed quarantine migration on synthetic seed records (`job_mahindra_elec_hingna`, `job_kec_welder_butibori`, `job_vidarbha_solar_umred`, `job_indorama_fitter_butibori`).
- **Data Preservation:** Seed records were **not deleted**; they were updated with `status: 'quarantined'` and `isQuarantined: true`.
- **Query Filter:** `job-discovery.ts` explicitly ignores any document where `isQuarantined === true`, `status !== 'open'`, or `sourceType === 'demo_seed'`.

### Point 6: Google Gemini AI Integration
- **Client Implementation:** `apps/web/src/lib/ai/gemini-client.ts` uses Google Generative Language REST API (`v1beta`).
- **Model Configuration:** Configured to `gemini-2.5-flash-lite`, which delivers sub-second latency and supports structured JSON schema enforcement.
- **Marathi Synthesis:** Verified generation of fluent Marathi vocational career guidance using Devnagari script.
- **Search Grounding:** Supports `googleSearch` tool integration for retrieving live regional news and industrial updates.

### Point 7: Gemini Quota & Rate Limit Analysis
- **Free Tier Behavior:** Google AI Studio Free Tier enforces a strict quota of 20 requests/day per project per model.
- **Error Identification:** During load testing, HTTP 429 `RESOURCE_EXHAUSTED` (`GenerateRequestsPerDayPerProjectPerModel-FreeTier`) was observed.
- **Graceful Degradation:** The platform does not fail when Gemini quota is exhausted; it falls back to Tavily search queries, Firestore-grounded RAG, and deterministic scoring.

### Point 8: Tavily Live Search Engine
- **Independent Search:** Configured via `apps/web/src/lib/services/search-provider.ts` using `TAVILY_API_KEY`.
- **Regional Query Planning:** Generates targeted search strings (e.g., `"MIG welder jobs Butibori MIDC Nagpur"`, `"ITI Electrician vacancies Hingna MIDC"`).
- **Execution:** Successfully queries the live web and retrieves actual job postings, social media hiring announcements, and company pages.

### Point 9: Vacancy Verification Engine
- **Engine File:** `apps/web/src/lib/services/vacancy-verifier.ts`.
- **Strict Heuristics:**
  - Aggregator domain links (Indeed, Apna, Naukri, Shine) lacking isolated JSON-LD JobPosting schemas are classified as `unverified_lead`.
  - Social media and broad hiring announcements are classified as `unverified_lead`.
  - Schema.org `JobPosting` containing authentic hiring organization and job details qualifies as `verified_vacancy`.
- **Zero Fabrication Policy:** Vacancy count defaults to 0 (unstated) if not explicitly present in the source. Expected candidate salary is never substituted as advertised job salary.
- **Real-World Proof:** Discovered and verified genuine vacancy on WorkIndia (`BraMHanee Industries`, MIG Welder, Butibori Nagpur).

### Point 10: Deterministic Regional Matching Engine
- **Shared Module:** `@rojgarmitra/shared/src/match/index.ts`.
- **Three-Factor Scoring:**
  1. Skill & Trade Match: Overlap of candidate skills against mandatory and optional job requirements.
  2. Geographic Proximity: Haversine distance formula calculating km between candidate location and job location. Distance penalty applied if beyond candidate's `maximumTravelKm`.
  3. Wage Compatibility: Compares job `salaryMin`/`salaryMax` against candidate's `expectedWageRange`.
- **Deterministic Output:** Tested in `tests/unit/match.test.ts` (7 passing tests). Match percentage is mathematically reproducible.

### Point 11: Regional RAG & Grounded Evidence Corpus
- **Service:** `apps/web/src/lib/services/regional-rag.ts`.
- **Retrieval Before Assembly:** Fixed retrieval ordering to fetch relevant Firestore evidence documents before computing similarity or passing to AI synthesis.
- **Institutional Citations:** Answers to candidate career queries cite authentic documents:
  - Government ITI Hingna & Nagpur campus details.
  - Directorate of Vocational Education and Training (DVET) Centralized Admission Portal.
  - Apprentices Act 1961 - Maharashtra Industrial Stipend Norms.

### Point 12: Vocational Training & DVET Curriculum Mapping
- **Service:** `apps/web/src/lib/services/training-discovery.ts`.
- **Skill Gap Bridging:** When a candidate lacks required skills (e.g., CNC Operation, TIG Welding), the engine maps missing skills to official DVET Craftsmen Training Scheme (CTS) trades.
- **Center Locator:** Recommends nearby Government and Private ITIs in Nagpur, Butibori, Hingna, and Umred with direct links to `https://admission.dvet.gov.in`.

### Point 13: Marathi & Multilingual NLP
- **Language Support:** Native Marathi (`mr`), Hindi (`hi`), and English (`en`).
- **Locale Dictionary:** `@rojgarmitra/i18n` with type-safe translations for trades, skills, form labels, and status badges.
- **Bilingual Relevancy Explanations:** Search results generate contextual explanations in Marathi (e.g., `[अधिकृत पडताळणी झालेली नोकरी] उच्च जुळणी (85%): तुमच्या 4 कौशल्यांशी थेट जुळणारे काम...`).

### Point 14: Voice Speech-to-Text Pipeline
- **Endpoint:** `apps/web/app/api/v1/voice/transcribe/route.ts`.
- **Audit & Cleanup:** Removed hardcoded fallback transcript and removed fabricated confidence score `0.94`.
- **Honest Contract:** If audio payload is missing, returns HTTP 400 `NO_SPEECH_DETECTED`. Requires explicit user confirmation before applying transcribed profile updates.
- **Text-to-Speech:** `apps/web/app/api/v1/voice/speak/route.ts` successfully connects to ElevenLabs API, returning high-quality Marathi speech.

### Point 15: SMS / Messaging Delivery Architecture
- **Endpoint:** `apps/web/app/api/v1/sms/preview/route.ts`.
- **TRAI DLT Compliance:** Demonstrates compliance with Indian Telecom Regulatory Authority (TRAI) Distributed Ledger Technology requirements:
  - Generates approved template formats with explicit variable placeholders (`{#var#}`).
  - Enforces explicit candidate SMS opt-in consent before dispatching notifications.
  - Transparently acts as a DLT template preview generator pending commercial SMS gateway provisioning.

### Point 16: Mobile App Integration Readiness
- **App Target:** `apps/mobile` (Expo React Native, Android target).
- **Environment:** `apps/mobile/.env.local` configured with `EXPO_PUBLIC_API_BASE_URL` and `EXPO_PUBLIC_FIREBASE_API_KEY`.
- **Authentication:** Android app authenticates against Google Identity Toolkit REST API directly or via custom token exchange with the Next.js backend.
- **Demo Fallback Removed:** Mobile job feeds consume live API endpoints without hardcoded mock records.

### Point 17: Automated Test Suite Results
- **Test Runner:** Vitest with TypeScript environment.
- **Suites Audited:**
  - `tests/unit/match.test.ts` (7/7 passed)
  - `tests/unit/vacancy-verifier.test.ts` (7/7 passed)
  - `tests/unit/rules-access.test.ts` (5/5 passed)
  - `tests/unit/auth-rbac.test.ts` (8/8 passed)
  - `tests/unit/validation-i18n.test.ts` (3/3 passed)
  - `tests/unit/rag-retrieval.test.ts` (1/1 passed)
  - `tests/integration/api-workflow.test.ts` (4/4 passed)
  - `tests/integration/gemini.test.ts` (2/2 passed)
  - `tests/integration/dual-candidate-verification.test.ts` (2/2 passed)
  - `tests/integration/firestore-rules-emulator.test.ts` (5/5 passed on emulator port 8085)
- **Total:** 44 passing automated test assertions verifying end-to-end functionality.

### Point 18: Next.js Production Build Validation
- **Build Execution:** `next build` executed via `pnpm --filter @rojgarmitra/web build`.
- **Result:** Compiled with zero errors.
- **Route Manifest:**
  - 27 Dynamic API Routes (`ƒ /api/v1/*`)
  - 7 Static Web Pages (`○ /`, `/candidate`, `/candidate/onboarding`, `/candidate/career`, `/candidate/upskilling`, `/employer`, `/employer/post`)
  - Shared JS Chunk Size: 100 kB (optimal mobile web performance).

### Point 19: Local Browser Journey Walkthrough
- Tested on local HTTP server (`http://localhost:3000`):
  1. **Candidate Journey:**
     - `/candidate/onboarding`: Successfully loads trade selection, skill tagger, taluka/MIDC location picker.
     - `/candidate`: Displays verified vacancies and unverified leads with honest badges and source links.
     - `/candidate/career`: Generates regional career roadmap grounded in Government ITI programs.
     - `/candidate/upskilling`: Identifies skill gaps and provides direct links to DVET admission portal.
  2. **Employer Journey:**
     - `/employer`: Displays employer dashboard with active job listings.
     - `/employer/post`: Allows posting genuine vacancies with industrial area selection, required skills, and salary range.

### Point 20: Security, Secrets & Deployment Isolation
- **Codebase Cleanliness:** Verified zero secrets committed to Git repository.
- **Deployment Safety:** Production deployment to Vercel is strictly paused until user supplies production billing and environment configurations.
