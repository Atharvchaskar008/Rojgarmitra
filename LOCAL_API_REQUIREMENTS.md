# RojgarMitra (रोजगारमित्र) — Local API Requirements & Credentials Audit

*Audit Date: November 19, 2026*  
*Environment: Local Development (`apps/web/.env.local`, `apps/mobile/.env.local`)*  
*Target Firebase Project: `rojgarmitra-dev`*

---

## 1. Master API & Credentials Matrix

| Provider | Exact Variable Name | Feature / Component | Required vs Optional | Present Locally? | Test Result & Status | Exact Error Code / Message if Failed | Needed in Vercel? | Official Portal Link | Billing / Tier / Permissions | Exact Manual Action Needed From User |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Google AI (Gemini)** | `GEMINI_API_KEY` | Regional Query Planning, Marathi Guidance, Grounded RAG | **Required** for AI Features | **Yes** | ⚠️ Tested: HTTP 200 on `gemini-2.5-flash-lite`, but hit 20 req/day Free Tier quota | HTTP 429 `RESOURCE_EXHAUSTED`: `GenerateRequestsPerDayPerProjectPerModel-FreeTier` (Limit: 20/day) | **Yes** | [Google AI Studio](https://aistudio.google.com/app/apikey) | Free Tier (20 req/day per model) or Pay-As-You-Go ($0.075 / 1M tokens) | Enable Billing on Google Cloud / AI Studio project, or provide an API key attached to a pay-as-you-go project. |
| **Google AI (Gemini)** | `GEMINI_MODEL` | AI Model Identifier | **Optional** (defaults to `gemini-2.5-flash-lite`) | **Yes** (`gemini-2.5-flash-lite`) | ✅ Operational | None | **Yes** (set to `gemini-2.5-flash-lite`) | [Gemini Models Documentation](https://ai.google.dev/gemini-api/docs/models/gemini) | Included with Gemini API | Keep set to `gemini-2.5-flash-lite` for fastest response and lowest latency. |
| **Tavily Search** | `TAVILY_API_KEY` | Independent Real-Time Web Job & Training Search | **Required** for Live Web Discovery | **Yes** | ✅ HTTP 200 OK | None | **Yes** | [Tavily Dashboard](https://app.tavily.com/) | Free Tier (1,000 queries/month) | None locally. Add to Vercel when ready to deploy. |
| **ElevenLabs** | `ELEVENLABS_API_KEY` | Voice Speech-to-Text & Text-to-Speech in Marathi/Hindi | **Required** for Voice Features | **Yes** | ✅ HTTP 200 OK (Multilingual TTS verified with 97KB MP3) | None | **Yes** | [ElevenLabs Dashboard](https://elevenlabs.io/) | Free Tier (10,000 characters/month) | None locally. Add to Vercel when ready to deploy. |
| **ElevenLabs** | `ELEVENLABS_VOICE_ID` | Voice Persona Identifier | **Optional** (auto-selects available multilingual voice) | **No** (Blank locally) | ✅ Operational (Auto-falls back to `CwhRBWXzGAHq8TQ4Fs17` Roger) | None | **Optional** | [ElevenLabs VoiceLab](https://elevenlabs.io/app/voice-lab) | Free Tier | Optional: Paste a preferred voice ID (e.g. `21m00Tcm4TlvDq8ikWAM` Rachel or a custom Marathi voice). |
| **Firebase Admin** | `FIREBASE_PROJECT_ID` | Server-Side Firestore & Authentication Admin | **Required** for Backend Database | **Yes** (`rojgarmitra-dev`) | ✅ Operational (Connected to Cloud Firestore) | None | **Yes** (Already in Vercel) | [Firebase Console](https://console.firebase.google.com/) | Blaze Pay-as-you-go (Spark free limits apply) | None. Already configured locally and on Vercel. |
| **Firebase Admin** | `FIREBASE_CLIENT_EMAIL` | Service Account Client Email | **Required** for Server Auth | **Yes** | ✅ Operational | None | **Yes** (Already in Vercel) | [Google Cloud IAM](https://console.cloud.google.com/iam-admin/serviceaccounts) | Service Account Token Creator / Admin | None. Already configured. |
| **Firebase Admin** | `FIREBASE_PRIVATE_KEY` | Service Account RSA Private Key | **Required** for Server Auth | **Yes** | ✅ Operational (Properly parses multi-line PEM) | None | **Yes** (Already in Vercel) | [Google Cloud IAM](https://console.cloud.google.com/iam-admin/serviceaccounts) | Private Key | None. Already configured. |
| **Firebase Web SDK** | `NEXT_PUBLIC_FIREBASE_API_KEY` | Client-Side Web Authentication | **Required** for Browser Login | **Yes** | ✅ Operational | None | **Yes** | [Firebase Project Settings](https://console.firebase.google.com/project/rojgarmitra-dev/settings/general) | Client Web App API Key | Add `NEXT_PUBLIC_FIREBASE_API_KEY` to Vercel (see Vercel checklist). |
| **Firebase Web SDK** | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Web Auth Domain | **Required** for Browser Auth | **Yes** (`rojgarmitra-dev.firebaseapp.com`) | ✅ Operational | None | **Yes** (Already in Vercel) | [Firebase Auth Settings](https://console.firebase.google.com/project/rojgarmitra-dev/authentication) | Public domain | None. Already configured. |
| **Firebase Web SDK** | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Client Project ID | **Required** for Web SDK | **Yes** (`rojgarmitra-dev`) | ✅ Operational | None | **Yes** (Already in Vercel) | [Firebase Project Settings](https://console.firebase.google.com/project/rojgarmitra-dev/settings/general) | Public config | None. Already configured. |
| **Firebase Web SDK** | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Cloud Storage Bucket | **Optional** (for resumes/certificates) | **Yes** (`rojgarmitra-dev.firebasestorage.app`) | ✅ Operational | None | **Yes** (Already in Vercel) | [Firebase Storage](https://console.firebase.google.com/project/rojgarmitra-dev/storage) | Cloud Storage | None. Already configured. |
| **Firebase Web SDK** | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Cloud Messaging Sender | **Optional** (for push notifications) | **Yes** | ✅ Operational | None | **Yes** (Already in Vercel) | [Firebase Cloud Messaging](https://console.firebase.google.com/project/rojgarmitra-dev/settings/cloudmessaging) | FCM | None. Already configured. |
| **Firebase Web SDK** | `NEXT_PUBLIC_FIREBASE_APP_ID` | Client App ID | **Required** for Web SDK | **Yes** | ✅ Operational | None | **Yes** (Already in Vercel) | [Firebase Project Settings](https://console.firebase.google.com/project/rojgarmitra-dev/settings/general) | Public config | None. Already configured. |
| **Firebase Web SDK** | `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Google Analytics Measurement ID | **Optional** | **Yes** | ✅ Operational | None | **Yes** (Already in Vercel) | [Google Analytics](https://analytics.google.com/) | Analytics | None. Already configured. |
| **Google Maps** | `GOOGLE_MAPS_API_KEY` | Industrial Area Geocoding & Travel Distance Matrix | **Optional** (System uses deterministic coordinate math fallback) | **No** (Blank locally) | ℹ️ Geodesic distance formula fallback used | None | **Optional** | [Google Cloud Console](https://console.cloud.google.com/google/maps-apis) | Places API & Distance Matrix API (Requires Billing) | Add a Google Maps API Key with Geocoding and Distance Matrix enabled if live driving routing is needed. |
| **SMS Gateway (TRAI)** | `SMS_GATEWAY_API_KEY` / `SMS_SENDER_ID` | SMS Job Alerts & Interview Calls | **Optional** (Preview generator active locally) | **No** (Mock / Preview mode active) | ℹ️ `/api/v1/sms/preview` renders compliant TRAI DLT templates | None | **Optional** | [TRAI DLT Portal](https://www.vilpower.in/) / [Gupshup](https://www.gupshup.io/) / [Twilio](https://www.twilio.com/) | Commercial Indian Entity PAN/GST registration + Approved DLT Header & Template ID | Register business entity on Indian telecom DLT portal (Jio/VilPower), register Principal Entity and SMS templates, then configure live SMS provider. |
| **Mobile Client** | `EXPO_PUBLIC_FIREBASE_API_KEY` | Android App Firebase Authentication | **Required** for Android App | **Yes** in `apps/mobile/.env.local` | ✅ Operational | None | **No** (Mobile client only) | [Firebase Project Settings](https://console.firebase.google.com/project/rojgarmitra-dev/settings/general) | Mobile Client | None. Already configured locally. |
| **Mobile Client** | `EXPO_PUBLIC_API_BASE_URL` | Android App Backend API Endpoint | **Required** for Android App | **Yes** (`http://10.0.2.2:3000` / `http://localhost:3000`) | ✅ Operational | None | **No** (Mobile client only) | Local dev server | Local LAN / Emulator IP | When testing on a physical phone, change from `10.0.2.2` to computer LAN IP (e.g. `http://192.168.x.x:3000`). |

---

## 2. Gemini Free Tier Rate Limit Analysis

### Observed Behavior
During the initial connection test:
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent`
- Auth: HTTP 200 OK.
- Generation: Marathi response generated, Structured JSON validated, Google Search Grounding active.

During extended test suite execution:
- Error: `HTTP 429 RESOURCE_EXHAUSTED`
- Message: `GenerateRequestsPerDayPerProjectPerModel-FreeTier: Generate content requests per day limit exceeded on Free Tier (limit: 20 requests/day).`
- Reset Timer: Approximately 17 hours from trigger.

### What This Means For RojgarMitra
1. **Fallback Resilience:** RojgarMitra's architecture does **not crash** when Gemini hits a 429. The platform falls back gracefully:
   - Job Discovery: Switched seamlessly to **Tavily Search API**, which is fully operational with 1,000 monthly credits.
   - Vacancy Verification: Uses deterministic Schema.org JSON-LD web page parsing (`vacancy-verifier.ts`).
   - Regional RAG: Uses Firestore-grounded institutional documents (Government ITI catalogs, Apprentices Act 1961 rules).
   - Matching: Pure TypeScript matching engine computes skill match percentages, distance, and wages deterministically.
2. **Production Requirement:** For uninterrupted production or multi-user staging demonstrations, the Google Cloud project hosting the Gemini API key must be upgraded to **Pay-As-You-Go** billing. Gemini 2.5 Flash Lite costs $0.075 per 1 million input tokens ($0.000075 / 1K tokens), meaning 10,000 user requests cost less than $1.00 USD.

---

## 3. Required User Actions Before Production Deployment

1. **Google Gemini:** Upgrade Google AI Studio / Google Cloud project to Pay-As-You-Go to remove the 20 requests/day limit.
2. **Google Maps (Optional):** Provide `GOOGLE_MAPS_API_KEY` if live travel routing is desired over geodesic distance calculation.
3. **TRAI SMS (Optional):** Register company and templates on Indian Telecom DLT portal if live SMS delivery is needed in place of the current DLT-compliant preview generator.
4. **Vercel Deployment:** Review `VERCEL_ENV_CHECKLIST.md` to add `GEMINI_API_KEY`, `TAVILY_API_KEY`, `ELEVENLABS_API_KEY`, and `NEXT_PUBLIC_FIREBASE_API_KEY` before triggering production deployment.
