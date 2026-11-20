# रोजगारमित्र (RojgarMitra)
### Localized Skill-to-Employment Intelligence Platform for Tier-2/3 & Rural Youth

[![Next.js](https://img.shields.io/badge/Next.js-15.2.9-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-FFA611?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Google Maps](https://img.shields.io/badge/Google%20Maps-Places%20API-4285F4?style=for-the-badge&logo=google-maps)](https://developers.google.com/maps)
[![ElevenLabs](https://img.shields.io/badge/ElevenLabs-Pro%20Voice%20AI-FF6B6B?style=for-the-badge)](https://elevenlabs.io/)
[![Tavily](https://img.shields.io/badge/Tavily-Live%20Search-4A90E2?style=for-the-badge)](https://tavily.com/)

---

## 📌 Executive Summary

**RojgarMitra** is a localized, bilingual (Marathi, Hindi & English) skill-to-employment matching platform engineered specifically for youth and informal/blue-collar workers in Tier-2/3 industrial regions and surrounding rural districts (grounded in the **Nagpur & Vidarbha Industrial Belt**: Hingna MIDC, Butibori MIDC, Kalmeshwar, Umred, and Wardha).

It bridges the severe informational and literacy divide between rural job seekers, Industrial Training Institutes (ITIs), micro-enterprises, and manufacturing hubs through:
1. **Universal Job Giver & Seeker Access (No Niche Restrictions):** Open to ANY employer—from individual shopkeepers, local contractors, garages, and logistics hubs to large MIDC industrial factories—and ANY jobseeker across all sectors (Retail Sales, Tally Billing, Computer Operators, Healthcare Assistants, Hospitality, Logistics, Drivers, Construction, and ITI trades).
2. **Zero-Hallucination Deterministic Matching Engine:** Mathematical skill & proximity scoring (0–100%) that never invents fake openings.
3. **Live Web Crawling & Anti-Hallucination Vacancy Verification:** Real-time web discovery paired with rigorous evidence checks and direct redirection to verified online job sources (WorkIndia, Indeed, MahaJobs, NCS).
4. **Google Maps Places API Integration:** Direct navigation from rural villages to physical industrial factory gates.
5. **Mitra Voice Assistant (Speech-to-Text & Text-to-Speech):** Complete voice accessibility powered by ElevenLabs Pro (Scribe STT + Multilingual v2) and plug-and-play Sarvam AI (Bulbul TTS + Saaras STT).
6. **Multi-Track Upskilling & Free Self-Learning Library:** DVET ITI directory + MIDC Factory Apprenticeships (stipend under Apprentices Act 1961) + MSME Technology Centre (Indo-German Tool Room) + curated YouTube video playlists (मराठी/हिंदी) + official Bharat Skills (DGT) NIMI textbooks + workshop DIY practical exercises.
7. **Direct Employer Hiring Portal:** Fast posting with instant one-click telephone dialer (`tel:`) for quick applicant hiring.
8. **Digital Profile Badges:** Cryptographically verifiable digital credential badges for candidates and employers across all dashboards.

---

## 🏗️ System Architecture

### 1. High-Level Modular Architecture

```mermaid
flowchart TB
    subgraph ClientLayer["🖥️ Frontend & Client Layer (Next.js 15 + React 19)"]
        UI_Landing["Public Landing Page (/)"]
        UI_Candidate["Candidate Portal (/candidate)"]
        UI_Employer["Employer Portal (/employer)"]
        UI_Career["Career Roadmap (/candidate/career)"]
        UI_Upskilling["Upskilling Library (/candidate/upskilling)"]
        UI_Mitra["Floating Assistant (Mitra)"]
    end

    subgraph APILayer["⚡ Edge & API Server (Next.js Route Handlers)"]
        API_Discovery["/api/v1/discovery/jobs"]
        API_Jobs["/api/v1/jobs & /recommendations"]
        API_Employer["/api/v1/employer/*"]
        API_Voice["/api/v1/voice/speak & transcribe"]
        API_Notifications["/api/v1/notifications"]
        API_SMS["/api/v1/sms/preview"]
        API_RAG["/api/v1/agents/ask"]
    end

    subgraph CoreEngines["⚙️ Core Business Engines (Deterministic & Independent)"]
        Engine_Match["Deterministic Match Engine (packages/shared/src/match)"]
        Engine_Verifier["Vacancy Verifier & SSRF Guard (vacancy-verifier.ts)"]
        Engine_Maps["Google Maps Places Service (google-maps-service.ts)"]
        Engine_RAG["Regional RAG with 15-min In-Memory Cache (regional-rag.ts)"]
    end

    subgraph DataServices["☁️ Data & External Integration Layer"]
        DB_Firestore[("Google Cloud Firestore")]
        AUTH_Firebase["Firebase Auth (Google, Phone OTP, Email)"]
        API_Tavily["Tavily Live Web Search API"]
        API_Maps["Google Places API (Geocoding & Hubs)"]
        API_ElevenLabs["ElevenLabs Voice API (Multilingual TTS & Scribe STT)"]
        API_Gemini["Google Gemini (Search Planning & RAG Synthesis)"]
    end

    ClientLayer --> APILayer
    APILayer --> CoreEngines
    CoreEngines --> DataServices
    Engine_Match --> DB_Firestore
    Engine_Verifier --> API_Tavily
    Engine_Maps --> API_Maps
    APILayer --> API_ElevenLabs
    Engine_RAG --> API_Gemini
```

---

### 2. Live Job Discovery & Anti-Hallucination Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor Candidate as 👨‍🔧 Candidate (Voice/Text)
    participant API as 🚀 /api/v1/discovery/jobs
    participant DB as 🗄️ Firestore DB
    participant Planner as 🧠 Query Planner
    participant Web as 🌐 Tavily Search API
    participant Verifier as 🛡️ Vacancy Verifier
    participant Maps as 📍 Google Places API
    participant Match as 📐 Math Match Engine

    Candidate->>API: Submits query ("मी हिंगणा MIDC मध्ये वायरमन शोधत आहे")
    API->>API: Extracts Trade ("electrician"), Cluster ("Hingna MIDC")
    API->>DB: Scan direct employer postings (status == 'open')
    DB-->>API: Returns verified internal vacancies
    API->>Planner: Plan targeted queries (with fallback if Gemini offline)
    Planner-->>API: ["ITI Wireman opening Hingna MIDC", "motor maintenance Nagpur"]
    API->>Web: Crawl live job boards (Tavily)
    Web-->>API: Raw search records (titles, URLs, snippets)
    API->>Verifier: Check SSRF safety, domain authority, active vacancy signals
    Verifier-->>API: Label as 'verified_vacancy' OR 'unverified_lead'
    API->>Maps: Enrich employers with Google Maps coordinates & navigation routes
    Maps-->>API: Attaches verified street addresses, ratings, and map links
    API->>Match: Calculate match score (0-100%) against candidate profile
    Match-->>API: Ranked opportunities with Marathi/Hindi explanations
    API-->>Candidate: Delivers verified vacancies + Google Maps directions + ITI upskilling
```

---

### 3. Pure Deterministic Mathematical Matching Algorithm

The matching engine located in [`packages/shared/src/match/index.ts`](file:///C:/Projects/Ycce-hackkumbh/packages/shared/src/match/index.ts) is **100% deterministic** and executes entirely in TypeScript without invoking non-deterministic LLMs:

$$\text{Final Score} = \text{Skill Overlap Score (75%)} + \text{Location Proximity Bonus (25%)}$$

```
                ┌────────────────────────────────────────────────────────┐
                │             Candidate Profile & Job Posting            │
                └───────────────────────────┬────────────────────────────┘
                                            │
                                            ▼
                       ┌────────────────────────────────────────┐
                       │   Gate 1: Active Status Check          │
                       │   Is job status == 'open'?             │
                       └───────┬────────────────────────┬───────┘
                              YES                       NO ──► [Ineligible: Score 0%]
                               ▼
                       ┌────────────────────────────────────────┐
                       │   Gate 2: Mandatory License Check      │
                       │   Has required ITI/Wireman/DL certs?   │
                       └───────┬────────────────────────┬───────┘
                              YES                       NO ──► [Ineligible: Lacks Cert]
                               ▼
     ┌────────────────────────────────────────────────────────────────────────┐
     │   Gate 3: Skill Overlap (0 to 75 points)                               │
     │   Score = (Matched Candidate Skills / Total Required Skills) * 75      │
     └─────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
     ┌────────────────────────────────────────────────────────────────────────┐
     │   Gate 4: Regional Proximity Compatibility (0 to 25 points)            │
     │   • Same District (Nagpur): +15 points                                 │
     │   • Same Taluka/Cluster (Hingna/Butibori MIDC): +10 bonus points       │
     │   • Commute Distance Check vs Candidate Maximum Travel Radius          │
     └─────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
     ┌────────────────────────────────────────────────────────────────────────┐
     │   Final Compatibility Score: 0 - 100%                                  │
     │   Generates Transparent Match Badge & Missing Skills List in MR/HI/EN  │
     └────────────────────────────────────────────────────────────────────────┘
```

---

## 🌟 Core Subsystems & Technical Innovations

### 1. Zero AI Slop & Anti-Hallucination Guarantee
Conventional hackathon prototypes prompt an LLM to "invent matching jobs," resulting in fabricated companies, fictitious phone numbers, and unreal wages. 
RojgarMitra strictly forbids synthetic hallucination:
* **Evidence Classification:** Postings are partitioned into `verified_vacancy` (verified employer or validated job post) and `unverified_lead` (generic portal directory).
* **Quarantined Seeds:** Demo seeds are strictly segregated and excluded in production.
* **Honest Fallback:** If zero verified jobs exist in a specific taluka, the engine **never makes up a fake job**. It transparently displays zero jobs and triggers the upskilling pipeline: nearby Government ITIs, Bharat Skills courses, and official state employment portals (MahaJobs, NCS).

### 2. Google Maps Places API & Industrial Grounding
* Integrates directly with Google Places Text Search API.
* Automatically discovers live operational manufacturing plants, fabrication workshops, and engineering units in candidate-specific clusters (e.g. *CMS Techno Corporation*, *Paramount Engineering*, *Shree Sai Engineering*, *Electus Technologies* in Hingna MIDC).
* Every job card features a **"📍 Google Maps वर रस्ता पहा (Navigate on Map)"** action that opens Google Maps directions from the candidate's village directly to the factory gate.

### 3. Multi-Track Upskilling & Free Self-Learning Library
Candidates in Tier-2/3 cities often cannot afford full-time classroom re-enrollment. RojgarMitra delivers a dual-track upskilling ecosystem:
1. **Accredited Government Institutes:** Directory of accredited DVET institutions (Govt ITI Nagpur, ITI Hingna, ITI Butibori, ITI Umred) with centralized DVET portal links (`https://admission.dvet.gov.in`).
2. **Free YouTube Video Tutorials (मराठी/हिंदी):** Curated direct video search queries for technical trades (*Global ITI*, *Electrical Dost*, *Make It Easy ITI*, *Welding Academy India*).
3. **Official NIMI Textbooks (Bharat Skills):** 100% free downloadable Trade Theory & Trade Practical PDF books published by the Directorate General of Training (DGT).
4. **Shop-Floor Practical DIY Projects:** Real workshop exercises with step-by-step procedures and mandatory safety guidelines.

### 4. Mitra Voice Assistant (Regional STT & TTS)
* **Bilingual Speech Synthesis:** Powered by ElevenLabs Multilingual v2 with fallback to smart Indian browser SpeechSynthesis (`mr-IN`, `hi-IN`).
* **Speech-to-Text:** Audio recordings are processed with automatic language detection supporting Marathi and Hindi.
* **Docked Responsive Launcher:** Mobile-first floating UI with smooth backdrop and zero horizontal viewport overflow.

### 5. Employer Hiring Dashboard & Direct Dialer
* Enables local workshop owners and SME employers to post entry-level blue-collar and administrative openings in under 2 minutes.
* Provides real-time applicant tracking (`shortlisted`, `interview_requested`, `accepted`, `rejected`).
* Integrated one-click telephone dialer (`tel:${applicant.candidatePhone}`) designed specifically for blue-collar recruitment where phone calls precede written resumes.

### 6. DLT-Compliant Regional SMS Job Alerts
* Implemented in [`/api/v1/sms/preview`](file:///C:/Projects/Ycce-hackkumbh/apps/web/app/api/v1/sms/preview/route.ts).
* Generates localized job match alert SMS templates conforming to Indian Telecom Commercial Communications Customer Preference Regulations (TCCCPR/DLT) in Marathi, Hindi, and English for low-end feature phones.

---

## 📂 Repository Monorepo Structure

```
Ycce-hackkumbh/
├── apps/
│   └── web/                                # Next.js 15 Web Application
│       ├── app/                            # Next.js App Router
│       │   ├── api/v1/                     # 28 Production REST API Endpoints
│       │   │   ├── agents/                 # RAG, Career Planning & Skill-Gap APIs
│       │   │   ├── discovery/              # Web Crawling & Nearby Hubs Discovery
│       │   │   ├── employer/               # Employer Jobs & Applicant Endpoints
│       │   │   ├── jobs/                   # Jobs Feed & Recommendations
│       │   │   ├── notifications/          # Real-time In-App Notifications
│       │   │   ├── sms/                    # DLT-Compliant SMS Job Alerts
│       │   │   ├── training-centers/       # Accredited ITI Directory
│       │   │   └── voice/                  # TTS & STT Voice Endpoints
│       │   ├── candidate/                  # Candidate Portal Pages
│       │   │   ├── applications/           # Submitted Applications Tracking
│       │   │   ├── career/                 # Career Roadmap & Self-Learning
│       │   │   ├── onboarding/             # Conversational Skill Profile Setup
│       │   │   └── upskilling/             # ITI & Bharat Skills Directory
│       │   ├── employer/                   # Employer Portal Pages
│       │   │   ├── jobs/[id]/applicants/   # Applicant Review & Phone Dialer
│       │   │   └── post/                   # Post New Vacancy
│       │   ├── login/ & signup/            # Multi-provider Authentication
│       │   └── page.tsx                    # SAKER-Inspired Public Landing Page
│       └── src/
│           ├── components/                 # Reusable UI & Icon Components
│           │   ├── character/              # Mitra Animated SVG Character
│           │   ├── icons/                  # 30+ Industrial Stroke SVG Icons
│           │   ├── FloatingAssistant.tsx   # Mitra Voice Floating Assistant
│           │   ├── Navbar.tsx              # Role-Based Navigation Header
│           │   └── SmoothScroll.tsx        # Lenis Smooth Scrolling Engine
│           └── lib/                        # Core Application Libraries
│               ├── ai/                     # Gemini AI Client with Safety Filters
│               ├── auth/                   # Client & Server-side Firebase Auth
│               ├── config/                 # Zod Server Configuration Validator
│               ├── firebase/               # Firebase Client & Admin SDK
│               └── services/               # Core Business Services
│                   ├── career-planner.ts   # Upskilling & Self-Learning Planner
│                   ├── google-maps-service.ts # Google Places Geocoding & Hubs
│                   ├── job-discovery.ts    # Orchestrated Job Discovery Agent
│                   ├── regional-rag.ts     # Evidence RAG with 15-min Query Cache
│                   ├── search-providers.ts # Tavily & Grounding Providers
│                   └── vacancy-verifier.ts # SSRF Guard & Anti-Hallucination Verifier
├── packages/
│   ├── i18n/                               # Type-safe Dictionaries (mr, hi, en)
│   └── shared/                             # Pure TypeScript Data Models & Match Engine
│       └── src/
│           ├── match/index.ts              # Deterministic Scoring Engine
│           ├── schemas/index.ts            # Zod Validation Schemas
│           ├── skills/index.ts             # Standard Regional Trades & Skills
│           └── types/index.ts              # Canonical Data Interfaces
└── tests/                                  # Comprehensive Test Suite
    ├── integration/                        # E2E Discovery & RAG Tests
    └── unit/                               # Pure Math & Rules Tests
```

---

## 🌐 API Reference

| Endpoint | Method | Auth Level | Purpose |
| :--- | :---: | :---: | :--- |
| `/api/v1/health` | `GET` | Public | System health check (Firebase, Gemini, i18n status) |
| `/api/v1/public/config` | `GET` | Public | Client configuration & regional pilot cluster metadata |
| `/api/v1/discovery/jobs` | `POST` | Public | Discovers verified vacancies via live web crawl & Google Places |
| `/api/v1/jobs` | `GET` | Public | Fetches active vacancies enriched with Google Maps navigation |
| `/api/v1/jobs/recommendations` | `GET` | Candidate | Calculates personalized 0–100% compatibility scores |
| `/api/v1/jobs/[id]/apply` | `POST` | Candidate | Submits application and triggers employer notification |
| `/api/v1/candidate/applications` | `GET` | Candidate | Returns real-time status of candidate's job applications |
| `/api/v1/agents/career-plan` | `POST` | Candidate | Generates career roadmap with YouTube tutorials & NIMI books |
| `/api/v1/agents/skill-gap` | `POST` | Candidate | Evaluates skill deficits against a target industrial job |
| `/api/v1/agents/ask` | `POST` | Public | RAG Q&A answering candidate queries with official citations |
| `/api/v1/voice/speak` | `POST` | Public | Synthesizes regional Marathi/Hindi speech via ElevenLabs |
| `/api/v1/voice/transcribe` | `POST` | Public | Transcribes spoken audio and extracts candidate skills/trade |
| `/api/v1/employer/jobs` | `GET`, `POST` | Employer | Manages employer job postings |
| `/api/v1/employer/jobs/[id]/applications` | `GET` | Employer | Retrieves applicants with phone dialer metadata |
| `/api/v1/applications/[id]/status` | `PATCH` | Employer | Updates applicant status and notifies candidate |
| `/api/v1/notifications` | `GET`, `PATCH` | Authenticated | Real-time in-app notifications subsystem |
| `/api/v1/sms/preview` | `POST` | Authenticated | Generates DLT-compliant Marathi/Hindi SMS alert previews |
| `/api/v1/training-centers` | `GET` | Public | Directory of accredited regional Government ITI institutes |
| `/api/v1/courses` | `GET` | Public | Accredited vocational certification courses |

---

## 🚀 Local Development & Setup

### Prerequisites
* **Node.js:** v20.x or higher
* **Package Manager:** `pnpm` (v9.x or higher)
* **Firebase:** Project with Firestore enabled

### 1. Installation
```bash
git clone https://github.com/Atharvchaskar008/Ycce-hackkumbh.git
cd Ycce-hackkumbh
pnpm install
```

### 2. Environment Variables Configuration
Configure your `apps/web/.env.local`:
```env
# Client-side Firebase Configuration (Project: rojgarmitra-vidarbha)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCQiVLVmQKK-mibpdWj90v018N5MrcZRrc
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=rojgarmitra-vidarbha.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=rojgarmitra-vidarbha
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=rojgarmitra-vidarbha.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=37436857045
NEXT_PUBLIC_FIREBASE_APP_ID=1:37436857045:web:1b27c214c247f82cc6205c

# Server-side Firebase Admin SDK Credentials
FIREBASE_PROJECT_ID=rojgarmitra-vidarbha
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@rojgarmitra-vidarbha.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# AI & Search APIs
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=gemini-2.5-flash-lite
TAVILY_API_KEY=YOUR_TAVILY_API_KEY
GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY

# ElevenLabs Pro Voice API (Multilingual TTS & Scribe STT)
ELEVENLABS_API_KEY=YOUR_ELEVENLABS_PRO_KEY
ELEVENLABS_VOICE_MR_MALE=oIhZlnorjQiJ5jF7X73a
ELEVENLABS_VOICE_MR_FEMALE=dSEhEXLzhnZEytnJ2rRy
ELEVENLABS_VOICE_HI_MALE=f1abxvIEijusskcPWE5x
ELEVENLABS_VOICE_HI_FEMALE=JTPrASXyK62cF3L7w8hv

# Optional: Sarvam AI Key (Bulbul TTS & Saaras STT for Indian Languages)
SARVAM_API_KEY=YOUR_SARVAM_API_KEY
```

### 3. Pre-Seeded Production Demo Accounts
Pre-configured demo users are available at `/login`:
* **Candidate Demo (Ramesh Patil - Welder, Hingna MIDC):**
  * **Email:** `candidate.demo@rojgarmitra.in`
  * **Password:** `DemoPassword@123`
  * **Verified Credential ID:** `RM-VID-2026-8941`
* **Employer Demo (Mahindra & Mahindra - Hingna Plant):**
  * **Email:** `employer.demo@rojgarmitra.in`
  * **Password:** `DemoPassword@123`
  * **Verified Enterprise ID:** `RM-EMP-3319`

### 4. Run Verification Tests
```bash
# Execute unit and integration test suite
pnpm test
```
*Current test status: 11 test files passed, 44 tests passed.*

### 5. Build and Run Production Server Locally
```bash
# Build production bundle
pnpm --filter @rojgarmitra/web build

# Start production server on port 3000
pnpm --filter @rojgarmitra/web start -p 3000
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 6. Deployment to Vercel (Fresh Project)
1. Fork or import your repository `https://github.com/Atharvchaskar008/Ycce-hackkumbh.git` into your personal Vercel dashboard.
2. In Project Settings, set:
   * **Root Directory:** `apps/web` (or leave root with build command `pnpm --filter @rojgarmitra/web build`)
   * **Framework Preset:** Next.js
3. Copy the environment variables from `apps/web/.env.local` into Vercel Settings > Environment Variables.
4. Click **Deploy**.

---

## 🛡️ Security, Caching & Resilience

* **SSRF Protection:** All external URL checks strictly block private IPv4 ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), loopbacks (`127.0.0.1`, `localhost`), and cloud metadata endpoints (`169.254.169.254`).
* **Query Caching Layer:** Regional RAG features a 15-minute in-memory query cache (`locale:trade:taluka:query`), reducing repeat query latency to ~2ms and eliminating Gemini 429 quota exhaustion.
* **Role-Based Access Control (RBAC):** Firebase server-side token authentication enforces role boundaries between candidates and employers.
* **Rate Limiting:** Sliding-window rate limiters protect public endpoints against crawler abuse.

---

## 👥 Hackathon Team & Acknowledgments
Built with dedication for **YCCE HackKumbh 2026** to empower rural and semi-urban youth across Maharashtra through ethical, grounded, and accessible AI technology.
