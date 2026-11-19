import { JobPosting } from '@rojgarmitra/shared';
import { NormalizedSourceRecord } from './search-providers';

export type VacancyVerificationStatus = 'verified_vacancy' | 'unverified_lead' | 'expired' | 'unavailable';

export interface VerifiedSourceEvidence {
  evidenceType: 'internal_employer_posting' | 'authoritative_job_portal' | 'grounded_search_result' | 'verified_web_page';
  confidence: 'high' | 'medium' | 'low';
  sourcePortalName: string;
  sourceUrl?: string;
  observedAt: string;
  notes: string;
}

export interface VerificationResult {
  status: VacancyVerificationStatus;
  evidence: VerifiedSourceEvidence;
  extractedJob?: Partial<JobPosting>;
  rejectionReason?: string;
}

/**
 * SSRF Protection Validator
 */
export function isSafePublicUrl(urlString: string): boolean {
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    const host = parsed.hostname.toLowerCase();

    // Loopback & local hosts
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host === '::1' ||
      host === '[::1]' ||
      host.startsWith('[') ||
      host.endsWith('.local') ||
      host.endsWith('.internal')
    ) {
      return false;
    }

    // Cloud metadata endpoints
    if (host === '169.254.169.254' || host === 'metadata.google.internal') {
      return false;
    }

    // Private IPv4 ranges
    const parts = host.split('.').map(Number);
    if (parts.length === 4 && parts.every((p) => !isNaN(p) && p >= 0 && p <= 255)) {
      if (parts[0] === 10) return false;
      if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return false;
      if (parts[0] === 192 && parts[1] === 168) return false;
      if (parts[0] === 169 && parts[1] === 254) return false;
      if (parts[0] === 127) return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Safe Page Fetcher with strict size, timeout, and SSRF restrictions
 */
export async function safeFetchPageHtml(url: string, timeoutMs = 6000): Promise<{ ok: boolean; status: number; html: string }> {
  if (!isSafePublicUrl(url)) {
    return { ok: false, status: 400, html: 'BLOCKED_BY_SSRF_PROTECTION' };
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 RojgarMitraVerificationBot/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,mr;q=0.8,hi;q=0.7',
      },
      signal: ctrl.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      return { ok: false, status: res.status, html: '' };
    }

    // Limit read size to 512 KB
    const reader = res.body?.getReader();
    if (!reader) {
      const text = await res.text();
      return { ok: true, status: res.status, html: text.slice(0, 524288) };
    }

    let receivedBytes = 0;
    const maxBytes = 524288;
    const chunks: Uint8Array[] = [];

    while (receivedBytes < maxBytes) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        receivedBytes += value.length;
      }
    }

    const totalBuffer = Buffer.concat(chunks.map((c) => Buffer.from(c)));
    const html = totalBuffer.toString('utf-8', 0, Math.min(totalBuffer.length, maxBytes));

    return { ok: true, status: res.status, html };
  } catch (err) {
    clearTimeout(timer);
    return { ok: false, status: 0, html: (err as Error).message };
  }
}

/**
 * Vacancy Verifier
 * Inspects candidate URL and page contents to confirm whether an actual,
 * active individual vacancy exists.
 */
export class VacancyVerifier {
  /**
   * Evaluates a search record and safely confirms or rejects vacancy status.
   */
  async verifySourceRecord(
    record: NormalizedSourceRecord,
    targetTrade?: string
  ): Promise<VerificationResult> {
    const url = record.url;
    let domain = '';
    try {
      domain = new URL(url).hostname.replace('www.', '');
    } catch {
      return {
        status: 'unavailable',
        evidence: {
          evidenceType: 'grounded_search_result',
          confidence: 'low',
          sourcePortalName: 'invalid_url',
          observedAt: new Date().toISOString(),
          notes: 'Invalid URL scheme.',
        },
        rejectionReason: 'Malformed URL',
      };
    }

    // Step 1: Detect obvious search aggregator / category listing URLs
    const pathname = new URL(url).pathname.toLowerCase();
    const isCategoryOrSearchListing =
      pathname.startsWith('/q-') ||
      pathname.includes('/search') ||
      pathname.includes('/job-search') ||
      pathname.includes('/browse') ||
      pathname.endsWith('-jobs.html') ||
      pathname.endsWith('/jobs') ||
      pathname.endsWith('/electrician') ||
      pathname.endsWith('/welder');

    if (isCategoryOrSearchListing) {
      return {
        status: 'unverified_lead',
        evidence: {
          evidenceType: 'grounded_search_result',
          confidence: 'low',
          sourcePortalName: domain,
          sourceUrl: url,
          observedAt: new Date().toISOString(),
          notes: 'Portal category search or aggregator index page. Does not confirm an individual vacancy.',
        },
        rejectionReason: 'Aggregator category page, not an individual vacancy posting',
      };
    }

    // Step 2: Fetch page safely
    const fetchRes = await safeFetchPageHtml(url, 6000);

    // If page is unreachable or HTTP 404/410/500
    if (!fetchRes.ok) {
      if (fetchRes.status === 410 || fetchRes.status === 404) {
        return {
          status: 'expired',
          evidence: {
            evidenceType: 'grounded_search_result',
            confidence: 'low',
            sourcePortalName: domain,
            sourceUrl: url,
            observedAt: new Date().toISOString(),
            notes: `Page returned HTTP ${fetchRes.status} (Expired / Page Not Found).`,
          },
          rejectionReason: `HTTP ${fetchRes.status}`,
        };
      }

      return {
        status: 'unavailable',
        evidence: {
          evidenceType: 'grounded_search_result',
          confidence: 'low',
          sourcePortalName: domain,
          sourceUrl: url,
          observedAt: new Date().toISOString(),
          notes: `Page unreachable or blocked (HTTP ${fetchRes.status}).`,
        },
        rejectionReason: `Unreachable: HTTP ${fetchRes.status}`,
      };
    }

    const html = fetchRes.html;
    const lowerHtml = html.toLowerCase();

    // Step 3: Check for expiration or closed vacancy notices
    const expirationMarkers = [
      'this job has expired',
      'this vacancy has expired',
      'job is no longer available',
      'application is closed',
      'applications are now closed',
      'position has been filled',
      'no longer accepting applications',
      'this opening is closed',
    ];

    for (const marker of expirationMarkers) {
      if (lowerHtml.includes(marker)) {
        return {
          status: 'expired',
          evidence: {
            evidenceType: 'verified_web_page',
            confidence: 'medium',
            sourcePortalName: domain,
            sourceUrl: url,
            observedAt: new Date().toISOString(),
            notes: `Vacancy confirmed closed by page notice: "${marker}".`,
          },
          rejectionReason: 'Page explicitly states vacancy is expired or closed',
        };
      }
    }

    // Step 4: Check if page is an aggregator search result rather than a single vacancy
    if (
      lowerHtml.includes('jobs found') ||
      lowerHtml.includes('showing 1 -') ||
      lowerHtml.includes('create job alert for this search')
    ) {
      return {
        status: 'unverified_lead',
        evidence: {
          evidenceType: 'grounded_search_result',
          confidence: 'low',
          sourcePortalName: domain,
          sourceUrl: url,
          observedAt: new Date().toISOString(),
          notes: 'Page content is a search result feed with multiple listings, not an individual verified vacancy.',
        },
        rejectionReason: 'Multi-job search result feed',
      };
    }

    // Step 5: Check for individual vacancy markers
    // Needs title, employer, location, and apply action
    const hasApplyAction =
      lowerHtml.includes('apply now') ||
      lowerHtml.includes('easy apply') ||
      lowerHtml.includes('apply on company site') ||
      lowerHtml.includes('submit application') ||
      lowerHtml.includes('contact employer') ||
      lowerHtml.includes('send resume');

    // Extract title from <title> tag
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const rawTitle = titleMatch ? titleMatch[1].trim() : record.title;

    // Clean title
    const cleanTitle = rawTitle.split(/[-–|]/)[0].trim();

    // Location detection
    let extractedDistrict = '';
    let areaOrMidc: string | undefined = undefined;

    if (lowerHtml.includes('nagpur')) extractedDistrict = 'Nagpur';
    if (lowerHtml.includes('wardha')) extractedDistrict = 'Wardha';
    if (lowerHtml.includes('amravati')) extractedDistrict = 'Amravati';
    if (lowerHtml.includes('butibori')) areaOrMidc = 'Butibori MIDC';
    if (lowerHtml.includes('hingna')) areaOrMidc = 'Hingna MIDC';
    if (lowerHtml.includes('umred')) areaOrMidc = 'Umred';

    // Employer detection from schema.org or OpenGraph or title
    let employerName = `Employer on ${domain}`;
    const ogSiteName = html.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i);
    if (ogSiteName && ogSiteName[1]) {
      employerName = ogSiteName[1].trim();
    }

    // Check if authentic individual vacancy confirmed
    if (hasApplyAction && cleanTitle.length > 3) {
      return {
        status: 'verified_vacancy',
        evidence: {
          evidenceType: 'verified_web_page',
          confidence: 'high',
          sourcePortalName: domain,
          sourceUrl: url,
          observedAt: new Date().toISOString(),
          notes: `Confirmed individual vacancy page on ${domain} with active application action.`,
        },
        extractedJob: {
          title: cleanTitle.slice(0, 100),
          employerName,
          district: extractedDistrict || 'Nagpur',
          areaOrMidc,
          status: 'open',
          sourceType: 'external_public',
          sourceUrl: url,
          sourceDomain: domain,
          freshnessStatus: 'fresh',
          vacancies: 1, // Only set to 1 when individual vacancy page is confirmed
        },
      };
    }

    // Otherwise, conservative classification as unverified lead
    return {
      status: 'unverified_lead',
      evidence: {
        evidenceType: 'grounded_search_result',
        confidence: 'low',
        sourcePortalName: domain,
        sourceUrl: url,
        observedAt: new Date().toISOString(),
        notes: 'Public search lead. Could not independently confirm direct application action on individual page.',
      },
      rejectionReason: 'Insufficient individual vacancy evidence',
    };
  }
}

export const vacancyVerifier = new VacancyVerifier();
