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
 * Strictly blocks private, loopback, link-local, and cloud metadata endpoints.
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
 * Known job aggregator domains that serve search results, feeds, or lead pages
 */
const AGGREGATOR_DOMAINS = new Set([
  'indeed.com',
  'in.indeed.com',
  'naukri.com',
  'adzuna.in',
  'adzuna.com',
  'jobhai.com',
  'shine.com',
  'monsterindia.com',
  'foundit.in',
  'placementindia.com',
  'linkedin.com',
  'glassdoor.com',
  'freshersworld.com',
  'timesjobs.com',
  'quickr.com',
  'olx.in',
]);

/**
 * Vacancy Verifier
 * Rigorous multi-stage verification:
 * - Detects expired / removed listings (404, 410, expiration text)
 * - Identifies aggregator category search feeds
 * - Rejects generic pages where only a title + "Apply Now" button is present
 * - Requires verified Schema.org JobPosting or confirmed employer recruitment notice
 * - Never fabricates salaries, vacancies, or employer identities
 */
export class VacancyVerifier {
  async verifySourceRecord(
    record: NormalizedSourceRecord,
    targetTrade?: string
  ): Promise<VerificationResult> {
    const url = record.url;
    let domain = '';
    let parsedUrl: URL;

    try {
      parsedUrl = new URL(url);
      domain = parsedUrl.hostname.replace('www.', '');
    } catch {
      return {
        status: 'unavailable',
        evidence: {
          evidenceType: 'grounded_search_result',
          confidence: 'low',
          sourcePortalName: 'invalid_url',
          observedAt: new Date().toISOString(),
          notes: 'Malformed URL.',
        },
        rejectionReason: 'Malformed URL',
      };
    }

    // Step 1: Detect aggregator / category listing URL patterns
    const pathname = parsedUrl.pathname.toLowerCase();
    const isCategoryOrSearchListing =
      pathname.startsWith('/q-') ||
      pathname.includes('/search') ||
      pathname.includes('/job-search') ||
      pathname.includes('/browse') ||
      pathname.endsWith('-jobs.html') ||
      pathname.endsWith('/jobs') ||
      pathname.endsWith('/electrician') ||
      pathname.endsWith('/welder') ||
      pathname.includes('/jobs-in-');

    if (isCategoryOrSearchListing) {
      return {
        status: 'unverified_lead',
        evidence: {
          evidenceType: 'grounded_search_result',
          confidence: 'low',
          sourcePortalName: domain,
          sourceUrl: url,
          observedAt: new Date().toISOString(),
          notes: 'Portal category search or multi-job feed page. Does not confirm an active individual vacancy.',
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

    // Step 3: Check for explicit expiration or closed vacancy notices
    const expirationMarkers = [
      'this job has expired',
      'this vacancy has expired',
      'job is no longer available',
      'application is closed',
      'applications are now closed',
      'position has been filled',
      'no longer accepting applications',
      'this opening is closed',
      'this posting has expired',
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

    // Step 4: Check if page is an aggregator multi-job feed
    if (
      lowerHtml.includes('jobs found') ||
      lowerHtml.includes('showing 1 -') ||
      lowerHtml.includes('create job alert for this search') ||
      lowerHtml.includes('sign in to create job alert')
    ) {
      return {
        status: 'unverified_lead',
        evidence: {
          evidenceType: 'grounded_search_result',
          confidence: 'low',
          sourcePortalName: domain,
          sourceUrl: url,
          observedAt: new Date().toISOString(),
          notes: 'Search results feed with multiple job snippets, not an individual confirmed vacancy.',
        },
        rejectionReason: 'Multi-job search result feed',
      };
    }

    // Step 5: Rigorous schema.org / structured data extraction
    let verifiedBySchema = false;
    let schemaEmployer = '';
    let schemaTitle = '';
    let schemaLocation = '';
    let schemaSalaryMin: number | undefined;
    let schemaSalaryMax: number | undefined;

    const ldJsonMatches = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    for (const match of ldJsonMatches) {
      try {
        const parsed = JSON.parse(match[1]);
        const items = Array.isArray(parsed) ? parsed : [parsed];
        for (const item of items) {
          if (item['@type'] === 'JobPosting') {
            schemaTitle = item.title || '';
            if (typeof item.hiringOrganization === 'object' && item.hiringOrganization?.name) {
              schemaEmployer = String(item.hiringOrganization.name).trim();
            } else if (typeof item.hiringOrganization === 'string') {
              schemaEmployer = item.hiringOrganization.trim();
            }
            if (typeof item.jobLocation === 'object') {
              schemaLocation = item.jobLocation?.address?.addressLocality || item.jobLocation?.address?.addressRegion || '';
            }
            if (item.baseSalary?.value) {
              const val = item.baseSalary.value;
              if (typeof val === 'number') schemaSalaryMin = val;
              else if (typeof val === 'object') {
                schemaSalaryMin = val.minValue;
                schemaSalaryMax = val.maxValue;
              }
            }
            if (schemaTitle && schemaEmployer && schemaEmployer !== domain) {
              verifiedBySchema = true;
            }
          }
        }
      } catch {
        // continue
      }
    }

    // If verified by schema.org on an authentic page
    if (verifiedBySchema && schemaTitle) {
      return {
        status: 'verified_vacancy',
        evidence: {
          evidenceType: 'verified_web_page',
          confidence: 'high',
          sourcePortalName: domain,
          sourceUrl: url,
          observedAt: new Date().toISOString(),
          notes: `Verified individual JobPosting schema from ${schemaEmployer}.`,
        },
        extractedJob: {
          title: schemaTitle.slice(0, 100),
          employerName: schemaEmployer,
          district: schemaLocation.toLowerCase().includes('nagpur') ? 'Nagpur' : undefined,
          salaryMin: schemaSalaryMin,
          salaryMax: schemaSalaryMax,
          status: 'open',
          sourceType: 'external_public',
          sourceUrl: url,
          sourceDomain: domain,
          freshnessStatus: 'fresh',
          vacancies: 0, // Unstated in schema, do not fabricate 1
        },
      };
    }

    // Step 6: Fallback check for direct employer career portals (e.g. careers.company.com)
    // CRITICAL: We DO NOT treat a generic page with a title + "Apply Now" as a verified vacancy.
    // An aggregator page with "Apply Now" buttons without schema.org is strictly an unverified lead.
    const isDirectEmployerSite = !AGGREGATOR_DOMAINS.has(domain);
    const hasDetailedJobDescription = lowerHtml.includes('job description') || lowerHtml.includes('responsibilities') || lowerHtml.includes('key skills');
    const hasApplyAction = lowerHtml.includes('submit your application') || lowerHtml.includes('apply for this position') || lowerHtml.includes('apply on company website');

    if (isDirectEmployerSite && hasDetailedJobDescription && hasApplyAction) {
      const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      const cleanTitle = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';

      if (cleanTitle.length > 5 && !cleanTitle.toLowerCase().includes('job') && !cleanTitle.toLowerCase().includes('careers')) {
        return {
          status: 'verified_vacancy',
          evidence: {
            evidenceType: 'verified_web_page',
            confidence: 'medium',
            sourcePortalName: domain,
            sourceUrl: url,
            observedAt: new Date().toISOString(),
            notes: `Confirmed individual vacancy on direct employer domain (${domain}).`,
          },
          extractedJob: {
            title: cleanTitle.slice(0, 100),
            employerName: domain,
            status: 'open',
            sourceType: 'external_public',
            sourceUrl: url,
            sourceDomain: domain,
            freshnessStatus: 'fresh',
            vacancies: 0, // Unstated, never fabricate
          },
        };
      }
    }

    // In all other cases, strictly treat as unverified lead
    return {
      status: 'unverified_lead',
      evidence: {
        evidenceType: 'grounded_search_result',
        confidence: 'low',
        sourcePortalName: domain,
        sourceUrl: url,
        observedAt: new Date().toISOString(),
        notes: 'Public search citation. Independent structured vacancy evidence was not confirmed on page.',
      },
      rejectionReason: 'Lacks structured schema.org JobPosting or confirmed employer recruitment evidence',
    };
  }
}

export const vacancyVerifier = new VacancyVerifier();
