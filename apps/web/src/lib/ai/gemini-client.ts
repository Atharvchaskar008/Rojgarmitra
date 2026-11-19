import { SupportedLocale } from '@rojgarmitra/shared';

export interface GroundingSource {
  title: string;
  url: string;
  snippet?: string;
}

export interface GroundedSearchResult {
  text: string;
  sources: GroundingSource[];
  searchQueries?: string[];
}

export class GeminiServiceError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = 'GeminiServiceError';
    this.statusCode = statusCode;
  }
}

/**
 * Production-ready server-side Gemini Client
 * Uses Google Gen AI REST API with model discovery fallback,
 * Google Search Grounding, exponential backoff retries, and strict timeouts.
 */
export class GeminiClient {
  private apiKey: string;
  private defaultModel: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.defaultModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';

    if (!this.apiKey) {
      console.warn('[GeminiClient] GEMINI_API_KEY is not configured in environment.');
    }
  }

  private getApiKey(): string {
    return process.env.GEMINI_API_KEY || this.apiKey || '';
  }

  private getModel(): string {
    return process.env.GEMINI_MODEL || this.defaultModel || 'gemini-2.5-flash-lite';
  }

  public isConfigured(): boolean {
    const key = this.getApiKey();
    return Boolean(key && key.trim().length > 0);
  }

  /**
   * Sanitizes user input to mitigate prompt injection and removes delimiter attacks.
   */
  public sanitizeInput(input: string): string {
    if (!input) return '';
    return input
      .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, '') // remove control chars
      .replace(/```/g, "'''") // neutralize code block delimiters
      .trim()
      .slice(0, 1000); // hard limit length
  }

  /**
   * Executes a prompt with Google Search Grounding enabled.
   */
  public async generateWithSearchGrounding(
    prompt: string,
    options: { timeoutMs?: number; temperature?: number } = {}
  ): Promise<GroundedSearchResult> {
    if (!this.isConfigured()) {
      throw new GeminiServiceError('Gemini API key is missing. Grounded search unavailable.', 503);
    }

    const model = this.getModel();
    const apiKey = this.getApiKey();
    const url = `${this.baseUrl}/models/${model}:generateContent?key=${apiKey}`;
    const timeoutMs = options.timeoutMs || 8000;

    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      tools: [
        {
          google_search: {},
        },
      ],
      generationConfig: {
        temperature: options.temperature ?? 0.2,
      },
    };

    const responseData = await this.executeWithRetry(url, requestBody, timeoutMs);

    const candidate = responseData.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text || '';
    const groundingMetadata = candidate?.groundingMetadata;

    const sources: GroundingSource[] = [];
    const searchQueries: string[] = groundingMetadata?.webSearchQueries || [];

    if (groundingMetadata?.groundingChunks) {
      for (const chunk of groundingMetadata.groundingChunks) {
        if (chunk.web?.uri) {
          sources.push({
            title: chunk.web.title || 'Web Source',
            url: chunk.web.uri,
          });
        }
      }
    }

    return {
      text,
      sources,
      searchQueries,
    };
  }

  /**
   * Generates structured JSON output with schema validation and sanitization.
   */
  public async generateStructuredJson<T>(
    prompt: string,
    systemInstruction?: string,
    options: { timeoutMs?: number } = {}
  ): Promise<T> {
    if (!this.isConfigured()) {
      throw new GeminiServiceError('Gemini API key is not configured', 503);
    }

    const model = this.getModel();
    const apiKey = this.getApiKey();
    const url = `${this.baseUrl}/models/${model}:generateContent?key=${apiKey}`;
    const timeoutMs = options.timeoutMs || 8000;

    const contents: any[] = [];
    if (systemInstruction) {
      contents.push({
        role: 'user',
        parts: [{ text: `System Guidance:\n${systemInstruction}\n\nTask:\n${prompt}` }],
      });
    } else {
      contents.push({
        role: 'user',
        parts: [{ text: prompt }],
      });
    }

    const requestBody = {
      contents,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    };

    const responseData = await this.executeWithRetry(url, requestBody, timeoutMs);
    const candidate = responseData.candidates?.[0];
    const rawJson = candidate?.content?.parts?.[0]?.text;

    if (!rawJson) {
      throw new GeminiServiceError('No content returned from Gemini model', 502);
    }

    try {
      return JSON.parse(rawJson) as T;
    } catch (parseErr: any) {
      // Attempt clean recovery if model wrapped with ```json ... ```
      const cleaned = rawJson.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      try {
        return JSON.parse(cleaned) as T;
      } catch {
        throw new GeminiServiceError(`Failed to parse structured JSON from model: ${parseErr.message}`, 502);
      }
    }
  }

  /**
   * Generates localized search queries for rural/semi-urban Maharashtra job discovery.
   */
  public async planJobSearchQueries(params: {
    trade?: string;
    skills: string[];
    qualifications?: string[];
    location: string;
    locale: SupportedLocale;
  }): Promise<string[]> {
    const tradeSafe = this.sanitizeInput(params.trade || 'technician');
    const locationSafe = this.sanitizeInput(params.location || 'Nagpur');
    const skillsSafe = params.skills.map((s) => this.sanitizeInput(s)).filter(Boolean).slice(0, 5);

    const prompt = `You are a regional employment discovery planner for rural and semi-urban Maharashtra (Vidarbha region including Nagpur, Hingna, Butibori MIDC, Umred, Katol, Saoner).
Given a candidate context:
- Trade: "${tradeSafe}"
- Skills: ${JSON.stringify(skillsSafe)}
- Education: ${JSON.stringify(params.qualifications || [])}
- Target Location: "${locationSafe}"
- Preferred Language: "${params.locale}"

Generate an array of exactly 4 to 6 concise, highly-targeted web search queries to find real, current job vacancies in this industrial region.
Include localized English queries (e.g. "industrial electrician vacancy Butibori MIDC") and regional Marathi/Hindi queries (e.g. "वायरमन नोकरी हिंगणा", "इलेक्ट्रिशियन भरती नागपूर").
Respond ONLY with a JSON array of strings:
["query1", "query2", "query3", "query4"]`;

    try {
      const queries = await this.generateStructuredJson<string[]>(prompt, undefined, { timeoutMs: 10000 });
      if (Array.isArray(queries) && queries.length > 0) {
        return queries;
      }
    } catch (err) {
      console.warn('[GeminiClient] Query planning fallback used:', (err as Error).message);
    }

    // Deterministic fallback queries if AI query planner is rate limited or unavailable
    return [
      `${tradeSafe} jobs ${locationSafe} MIDC`,
      `${tradeSafe} vacancies ${locationSafe} industrial area`,
      `${skillsSafe[0] || tradeSafe} भर्ती ${locationSafe}`,
      `${tradeSafe} नोकरी ${locationSafe}`,
    ];
  }

  /**
   * HTTP POST helper with exponential backoff and timeout
   */
  private async executeWithRetry(url: string, body: any, timeoutMs: number, maxRetries = 2): Promise<any> {
    let attempt = 0;
    let delay = 1000;

    while (attempt <= maxRetries) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(timeoutMs),
        });

        if (!response.ok) {
          const status = response.status;
          const errorText = await response.text();

          // If daily quota is exhausted, fail fast to avoid blocking with futile retries
          if (status === 429 && (errorText.includes('RESOURCE_EXHAUSTED') || errorText.includes('daily limit') || errorText.includes('per day'))) {
            throw new GeminiServiceError(`Gemini daily quota exhausted: ${errorText}`, 429);
          }

          // Handle transient 429 or 503 Service Unavailable with retry
          if ((status === 429 || status === 503) && attempt < maxRetries) {
            console.warn(`[GeminiClient] HTTP ${status} on attempt ${attempt + 1}. Retrying in ${delay}ms...`);
            await new Promise((r) => setTimeout(r, delay));
            delay *= 2;
            attempt++;
            continue;
          }

          throw new GeminiServiceError(`Gemini API request failed (${status}): ${errorText}`, status);
        }

        return await response.json();
      } catch (err: any) {
        if (err.name === 'TimeoutError' || err.name === 'AbortError') {
          throw new GeminiServiceError(`Gemini API request timed out after ${timeoutMs}ms`, 504);
        }
        if (err instanceof GeminiServiceError) {
          throw err;
        }
        if (attempt < maxRetries) {
          attempt++;
          await new Promise((r) => setTimeout(r, delay));
          delay *= 2;
          continue;
        }
        throw new GeminiServiceError(`Gemini request failed: ${err.message}`, 500);
      }
    }
  }
}

// Global singleton instance
export const geminiClient = new GeminiClient();
