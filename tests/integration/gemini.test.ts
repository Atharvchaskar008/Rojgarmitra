import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

beforeAll(() => {
  try {
    const envPath = path.resolve(__dirname, '../../apps/web/.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/GEMINI_API_KEY=(.+)/);
      if (match) {
        process.env.GEMINI_API_KEY = match[1].trim();
      }
      const modelMatch = content.match(/GEMINI_MODEL=(.+)/);
      if (modelMatch) {
        process.env.GEMINI_MODEL = modelMatch[1].trim();
      }
    }
  } catch {}
});

import { geminiClient } from '../../apps/web/src/lib/ai/gemini-client';

describe('Gemini AI Client Integration', () => {
  it('is properly configured with the server-side API key', () => {
    // Note: in local development, GEMINI_API_KEY is loaded from .env.local
    if (!process.env.GEMINI_API_KEY) {
      const fs = require('fs');
      try {
        const env = fs.readFileSync('apps/web/.env.local', 'utf8');
        const match = env.match(/GEMINI_API_KEY=(.+)/);
        if (match) process.env.GEMINI_API_KEY = match[1].trim();
      } catch {}
    }
    expect(process.env.GEMINI_API_KEY).toBeDefined();
  });

  it('generates localized regional job search queries', async () => {
    const queries = await geminiClient.planJobSearchQueries({
      trade: 'electrician',
      skills: ['house wiring', 'motor repair'],
      location: 'Hingna, Nagpur',
      locale: 'mr',
    });

    expect(Array.isArray(queries)).toBe(true);
    expect(queries.length).toBeGreaterThanOrEqual(2);
    // Should include regional keywords
    const combined = queries.join(' ').toLowerCase();
    expect(combined.includes('electrician') || combined.includes('वायरमन') || combined.includes('इलेक्ट्रिशियन') || combined.includes('hingna')).toBe(true);
  }, 15000);
});
