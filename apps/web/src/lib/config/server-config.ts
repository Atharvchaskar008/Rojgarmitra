import { z } from 'zod';

const serverConfigSchema = z.object({
  // Firebase Admin
  FIREBASE_PROJECT_ID: z.string().default('rojgarmitra-dev'),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),

  // AI & Search
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash-lite'),
  TAVILY_API_KEY: z.string().optional(),
  BRAVE_SEARCH_API_KEY: z.string().optional(),

  // Google Maps & Places
  GOOGLE_MAPS_API_KEY: z.string().optional(),

  // ElevenLabs
  ELEVENLABS_API_KEY: z.string().optional(),
  ELEVENLABS_VOICE_ID: z.string().optional(),

  // App mode
  APP_MODE: z.enum(['demo', 'production', 'test']).default('demo'),
  NODE_ENV: z.string().default('development'),
});

export type ServerConfig = z.infer<typeof serverConfigSchema>;

export interface IntegrationStatus {
  provider: string;
  configured: boolean;
  notes: string;
}

class ServerConfigService {
  private config: ServerConfig;

  constructor() {
    // If running in test or local CLI without Next.js automatic env loading, load from .env.local
    if (!process.env.TAVILY_API_KEY && !process.env.FIREBASE_PRIVATE_KEY) {
      try {
        const fs = require('fs');
        const path = require('path');
        const envCandidates = [
          path.resolve(process.cwd(), 'apps', 'web', '.env.local'),
          path.resolve(process.cwd(), '.env.local'),
          'C:\\Projects\\Ycce-hackkumbh\\apps\\web\\.env.local',
        ];
        for (const envFile of envCandidates) {
          if (fs.existsSync(envFile)) {
            const lines = fs.readFileSync(envFile, 'utf8').split('\n');
            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed && !trimmed.startsWith('#')) {
                const idx = trimmed.indexOf('=');
                if (idx > -1) {
                  const k = trimmed.substring(0, idx).trim();
                  let v = trimmed.substring(idx + 1).trim();
                  if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
                  if (!process.env[k]) process.env[k] = v;
                }
              }
            }
            break;
          }
        }
      } catch {
        // ignore in environments without filesystem access
      }
    }

    const raw = {
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite',
      TAVILY_API_KEY: process.env.TAVILY_API_KEY,
      BRAVE_SEARCH_API_KEY: process.env.BRAVE_SEARCH_API_KEY,
      GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
      ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
      ELEVENLABS_VOICE_ID: process.env.ELEVENLABS_VOICE_ID,
      APP_MODE: process.env.APP_MODE as any,
      NODE_ENV: process.env.NODE_ENV,
    };

    this.config = serverConfigSchema.parse(raw);
  }

  get(): ServerConfig {
    return this.config;
  }

  getFirebaseAdminCredentials() {
    const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = this.config;
    if (!FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
      return null;
    }

    // Clean newline escapes if formatted as raw string or JSON escaped
    let formattedKey = FIREBASE_PRIVATE_KEY;
    if (formattedKey.startsWith('"') && formattedKey.endsWith('"')) {
      try {
        formattedKey = JSON.parse(formattedKey);
      } catch {
        // keep as is
      }
    }
    formattedKey = formattedKey.replace(/\\n/g, '\n');

    return {
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: formattedKey,
    };
  }

  getSanitizedStatus(): Record<string, IntegrationStatus> {
    return {
      gemini: {
        provider: 'Google Gemini',
        configured: Boolean(this.config.GEMINI_API_KEY),
        notes: this.config.GEMINI_API_KEY ? `Model: ${this.config.GEMINI_MODEL}` : 'Missing GEMINI_API_KEY',
      },
      tavily: {
        provider: 'Tavily Search API',
        configured: Boolean(this.config.TAVILY_API_KEY),
        notes: this.config.TAVILY_API_KEY ? 'Configured as primary independent search provider' : 'Missing TAVILY_API_KEY',
      },
      firebaseAdmin: {
        provider: 'Firebase Admin SDK (Firestore & Auth)',
        configured: Boolean(this.config.FIREBASE_CLIENT_EMAIL && this.config.FIREBASE_PRIVATE_KEY),
        notes: (this.config.FIREBASE_CLIENT_EMAIL && this.config.FIREBASE_PRIVATE_KEY)
          ? `Project: ${this.config.FIREBASE_PROJECT_ID}`
          : 'Service account client_email or private_key missing',
      },
      googleMaps: {
        provider: 'Google Places / Maps API',
        configured: Boolean(this.config.GOOGLE_MAPS_API_KEY),
        notes: this.config.GOOGLE_MAPS_API_KEY ? 'Configured for training center geo-discovery' : 'Missing GOOGLE_MAPS_API_KEY (optional)',
      },
      brave: {
        provider: 'Brave Search API',
        configured: Boolean(this.config.BRAVE_SEARCH_API_KEY),
        notes: this.config.BRAVE_SEARCH_API_KEY ? 'Configured as secondary search provider' : 'Not configured (Tavily is primary)',
      },
      elevenlabs: {
        provider: 'ElevenLabs Voice (STT & TTS)',
        configured: Boolean(this.config.ELEVENLABS_API_KEY),
        notes: this.config.ELEVENLABS_API_KEY
          ? (this.config.ELEVENLABS_VOICE_ID ? 'Configured with Voice ID' : 'API Key configured; Voice ID will be discovered dynamically')
          : 'Missing ELEVENLABS_API_KEY (optional)',
      },
    };
  }
}

export const serverConfig = new ServerConfigService();
