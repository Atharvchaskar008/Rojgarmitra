import { geminiClient, GroundedSearchResult } from '../ai/gemini-client';
import { serverConfig } from '../config/server-config';

export interface NormalizedSourceRecord {
  url: string;
  title: string;
  snippet: string;
  discoveredAt: string;
  provider: 'tavily' | 'gemini_grounding' | 'brave' | 'official_portal';
  originalQuery: string;
  sourceConfidence: 'high' | 'medium' | 'low';
  rawScore?: number;
}

export interface SearchProvider {
  name: string;
  isAvailable(): boolean;
  search(query: string, options?: { location?: string; maxResults?: number }): Promise<NormalizedSourceRecord[]>;
}

/**
 * Tavily Search Provider
 * Official REST API integration: POST https://api.tavily.com/search
 */
export class TavilySearchProvider implements SearchProvider {
  name = 'tavily';

  isAvailable(): boolean {
    const config = serverConfig.get();
    return Boolean(config.TAVILY_API_KEY && config.TAVILY_API_KEY.trim().length > 0);
  }

  async search(
    query: string,
    options: { location?: string; maxResults?: number } = {}
  ): Promise<NormalizedSourceRecord[]> {
    const apiKey = serverConfig.get().TAVILY_API_KEY;
    if (!apiKey) {
      return [];
    }

    const maxResults = options.maxResults || 5;
    const finalQuery = options.location && !query.toLowerCase().includes(options.location.toLowerCase())
      ? `${query} ${options.location}`
      : query;

    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 8000);

      const res = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: apiKey,
          query: finalQuery,
          search_depth: 'basic',
          max_results: maxResults,
          include_answer: false,
        }),
        signal: ctrl.signal,
      });

      clearTimeout(timer);

      if (!res.ok) {
        console.warn(`[TavilySearch] API returned HTTP ${res.status}`);
        return [];
      }

      const data = await res.json();
      const results: NormalizedSourceRecord[] = [];

      if (Array.isArray(data.results)) {
        for (const item of data.results) {
          if (item.url && item.url.startsWith('http')) {
            results.push({
              url: item.url,
              title: item.title || 'Job Opportunity',
              snippet: item.content || '',
              discoveredAt: new Date().toISOString(),
              provider: 'tavily',
              originalQuery: finalQuery,
              sourceConfidence: (item.score && item.score > 0.6) ? 'medium' : 'low',
              rawScore: item.score,
            });
          }
        }
      }

      return results;
    } catch (err) {
      console.warn('[TavilySearch] Error fetching results:', (err as Error).message);
      return [];
    }
  }
}

/**
 * Gemini Google Search Grounding Provider
 */
export class GeminiGroundingSearchProvider implements SearchProvider {
  name = 'gemini_grounding';

  isAvailable(): boolean {
    return geminiClient.isConfigured();
  }

  async search(
    query: string,
    options: { location?: string; maxResults?: number } = {}
  ): Promise<NormalizedSourceRecord[]> {
    if (!this.isAvailable()) {
      return [];
    }

    const loc = options.location || 'Maharashtra';
    const prompt = `Search for current, verified vocational and industrial job vacancies for "${query}" in or near "${loc}", Maharashtra.
Focus on industrial areas like Butibori MIDC, Hingna MIDC, Umred, Katol, Saoner, or Nagpur.
Only return information supported by public vacancy notices, employment portals (MahaJobs, NCS), or direct employer recruitment announcements.`;

    try {
      const grounded = await geminiClient.generateWithSearchGrounding(prompt, { timeoutMs: 8000 });
      const records: NormalizedSourceRecord[] = [];

      for (const src of grounded.sources) {
        if (src.url && src.url.startsWith('http')) {
          records.push({
            url: src.url,
            title: src.title || 'Grounded Search Result',
            snippet: grounded.text ? grounded.text.slice(0, 300) : '',
            discoveredAt: new Date().toISOString(),
            provider: 'gemini_grounding',
            originalQuery: query,
            sourceConfidence: 'medium',
          });
        }
      }

      return records;
    } catch (err) {
      console.warn('[GeminiGroundingSearch] Search failed or quota exhausted:', (err as Error).message);
      return [];
    }
  }
}

/**
 * Orchestrated Provider
 * Executes primary provider (Tavily), combines with secondary (Gemini Grounding),
 * deduplicates URLs, and returns normalized sources.
 */
export class OrchestratedSearchProvider implements SearchProvider {
  name = 'orchestrated_web_search';

  private tavily = new TavilySearchProvider();
  private gemini = new GeminiGroundingSearchProvider();

  isAvailable(): boolean {
    return this.tavily.isAvailable() || this.gemini.isAvailable();
  }

  async search(
    query: string,
    options: { location?: string; maxResults?: number } = {}
  ): Promise<NormalizedSourceRecord[]> {
    const records: NormalizedSourceRecord[] = [];
    const seenUrls = new Set<string>();

    // 1. Tavily (Primary live web search)
    if (this.tavily.isAvailable()) {
      const tavilyResults = await this.tavily.search(query, options);
      for (const r of tavilyResults) {
        if (!seenUrls.has(r.url)) {
          seenUrls.add(r.url);
          records.push(r);
        }
      }
    }

    // 2. Gemini Grounding (Complementary or Fallback)
    if (records.length < (options.maxResults || 5) && this.gemini.isAvailable()) {
      try {
        const geminiResults = await this.gemini.search(query, options);
        for (const r of geminiResults) {
          if (!seenUrls.has(r.url)) {
            seenUrls.add(r.url);
            records.push(r);
          }
        }
      } catch {
        // Continue with whatever records were obtained
      }
    }

    return records;
  }
}

export const searchProviderService = new OrchestratedSearchProvider();
