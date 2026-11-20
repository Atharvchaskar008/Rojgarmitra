# RojgarMitra (रोजगारमित्र) — Vercel Production Environment Checklist

*Target Project: `Atharvchaskar008/Ycce-hackkumbh` on Vercel*  
*Deployment Target: Production (`main` branch)*  
*Current Status: **Deployment Paused (Local Validation Complete)***

---

## 1. Audit of Current Vercel Environment Variables

According to your Vercel Project configuration, the following **10 environment variables** are currently configured:

| Variable Name in Vercel | Purpose | Status in Vercel |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Web Firebase Auth Domain (`rojgarmitra-dev.firebaseapp.com`) | ✅ Configured |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Web Firebase Project ID (`rojgarmitra-dev`) | ✅ Configured |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Cloud Storage Bucket | ✅ Configured |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Cloud Messaging Sender ID | ✅ Configured |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Web Firebase Application ID | ✅ Configured |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Google Analytics Measurement ID | ✅ Configured |
| `FIREBASE_PROJECT_ID` | Firebase Admin Project ID | ✅ Configured |
| `FIREBASE_CLIENT_EMAIL` | Firebase Admin Service Account Email | ✅ Configured |
| `FIREBASE_PRIVATE_KEY` | Firebase Admin Service Account RSA Key | ✅ Configured |
| `APP_MODE` | Application Mode (`production` or `development`) | ✅ Configured |

---

## 2. Missing Environment Variables Required in Vercel

The following variables exist in your local `.env.local` but are **MISSING from Vercel**:

| Missing Variable Name | Feature Dependent on It | Impact if Missing on Vercel | Where to Get the Value |
| :--- | :--- | :--- | :--- |
| **`GEMINI_API_KEY`** | Google Gemini AI Career Guidance & RAG | `/api/v1/agents/*` and Marathi career planning will fail or use static fallbacks. | [Google AI Studio](https://aistudio.google.com/app/apikey) (Copy the key from local `apps/web/.env.local`). |
| **`GEMINI_MODEL`** | Gemini Model Selection | Defaults to `gemini-2.5-flash-lite`, but explicit setting avoids version drift. | Set value to: `gemini-2.5-flash-lite`. |
| **`TAVILY_API_KEY`** | Live Web Job Discovery | Real-time web search for vacancies in Nagpur/MIDC will fail. | [Tavily Dashboard](https://app.tavily.com/) (Copy the key from local `apps/web/.env.local`). |
| **`ELEVENLABS_API_KEY`** | Voice Synthesis & Transcription | Voice job alerts and Marathi read-aloud will return 500 error. | [ElevenLabs Dashboard](https://elevenlabs.io/) (Copy the key from local `apps/web/.env.local`). |
| **`NEXT_PUBLIC_FIREBASE_API_KEY`** | Client-Side Web Firebase SDK | Browser login on the deployed Vercel domain will fail to initialize. | [Firebase Project Settings](https://console.firebase.google.com/project/rojgarmitra-dev/settings/general) (Copy from `apps/web/.env.local`). |
| `ELEVENLABS_VOICE_ID` *(Optional)* | Preferred Voice Persona | System will auto-fallback to available voice (Roger `CwhRBWXzGAHq8TQ4Fs17`). | Optional. |
| `GOOGLE_MAPS_API_KEY` *(Optional)* | Live Driving Route Matrix | System uses built-in Haversine distance math fallback if omitted. | Optional. |

---

## 3. Step-by-Step Instructions to Configure Vercel

Before deploying to production, follow these steps in your Vercel Dashboard:

1. Open your browser and navigate to **[Vercel Dashboard](https://vercel.com/)**.
2. Select the **RojgarMitra** project (`Ycce-hackkumbh`).
3. Click on **Settings** in the top navigation bar.
4. In the left sidebar, click on **Environment Variables**.
5. Add the missing variables one by one:
   - **`NEXT_PUBLIC_FIREBASE_API_KEY`**: Paste your Firebase Web API key. Select Environments: `Production`, `Preview`, `Development`. Click **Save**.
   - **`GEMINI_API_KEY`**: Paste your Google Gemini API key. Select Environments: `Production`, `Preview`. Click **Save**.
   - **`GEMINI_MODEL`**: Set value to `gemini-2.5-flash-lite`. Select Environments: `Production`, `Preview`. Click **Save**.
   - **`TAVILY_API_KEY`**: Paste your Tavily API key. Select Environments: `Production`, `Preview`. Click **Save**.
   - **`ELEVENLABS_API_KEY`**: Paste your ElevenLabs API key. Select Environments: `Production`, `Preview`. Click **Save**.
6. Ensure that **`FIREBASE_PRIVATE_KEY`** in Vercel has line breaks properly formatted (if pasted with literal `\n`, the backend `server-config.ts` automatically converts them).

---

## 4. Deployment Safety Lock

> [!IMPORTANT]
> **DO NOT TRIGGER A PRODUCTION DEPLOYMENT YET.**
>
> 1. Ensure you have enabled Pay-As-You-Go on Google Cloud/AI Studio so your Gemini key is not blocked by the 20 requests/day Free Tier limit.
> 2. Add the 5 required variables listed above to Vercel.
> 3. Once configured in Vercel, a git push to `main` or clicking "Redeploy" in Vercel will launch the fully functional platform without errors.
