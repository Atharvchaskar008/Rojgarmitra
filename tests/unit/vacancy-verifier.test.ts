import { describe, it, expect } from 'vitest';
import { isSafePublicUrl, VacancyVerifier } from '../../apps/web/src/lib/services/vacancy-verifier';
import { NormalizedSourceRecord } from '../../apps/web/src/lib/services/search-providers';

describe('SSRF Protection (isSafePublicUrl)', () => {
  it('allows valid public HTTP and HTTPS URLs', () => {
    expect(isSafePublicUrl('https://mahajobs.maharashtra.gov.in')).toBe(true);
    expect(isSafePublicUrl('https://in.indeed.com/viewjob?jk=12345')).toBe(true);
    expect(isSafePublicUrl('https://www.ncs.gov.in/job/detail/67890')).toBe(true);
  });

  it('blocks localhost, 127.0.0.1, and 0.0.0.0', () => {
    expect(isSafePublicUrl('http://localhost:3000/api')).toBe(false);
    expect(isSafePublicUrl('http://127.0.0.1:8080')).toBe(false);
    expect(isSafePublicUrl('http://0.0.0.0:80')).toBe(false);
    expect(isSafePublicUrl('http://[::1]:3000')).toBe(false);
  });

  it('blocks private IPv4 address spaces', () => {
    expect(isSafePublicUrl('http://10.0.0.1/admin')).toBe(false);
    expect(isSafePublicUrl('http://192.168.1.1/router')).toBe(false);
    expect(isSafePublicUrl('http://172.16.0.1/internal')).toBe(false);
    expect(isSafePublicUrl('http://172.31.255.255/internal')).toBe(false);
  });

  it('blocks cloud metadata IP endpoints', () => {
    expect(isSafePublicUrl('http://169.254.169.254/latest/meta-data')).toBe(false);
    expect(isSafePublicUrl('http://metadata.google.internal/computeMetadata/v1')).toBe(false);
  });

  it('blocks non-HTTP protocols', () => {
    expect(isSafePublicUrl('ftp://example.com/file.txt')).toBe(false);
    expect(isSafePublicUrl('file:///etc/passwd')).toBe(false);
    expect(isSafePublicUrl('javascript:alert(1)')).toBe(false);
  });
});

describe('Vacancy Verifier Classification', () => {
  const verifier = new VacancyVerifier();

  it('classifies category / search listing URLs as unverified_lead without fetching', async () => {
    const record: NormalizedSourceRecord = {
      url: 'https://in.indeed.com/q-electrician-l-nagpur,-maharashtra-jobs.html',
      title: '25 Electrician Job Vacancies in Nagpur',
      snippet: 'Search results for electrician in Nagpur',
      discoveredAt: new Date().toISOString(),
      provider: 'tavily',
      originalQuery: 'electrician jobs nagpur',
      sourceConfidence: 'low',
    };

    const result = await verifier.verifySourceRecord(record, 'electrician');
    expect(result.status).toBe('unverified_lead');
    expect(result.evidence.sourcePortalName).toBe('in.indeed.com');
  });

  it('classifies malformed URLs as unavailable', async () => {
    const record: NormalizedSourceRecord = {
      url: 'not-a-valid-url',
      title: 'Bad URL',
      snippet: '',
      discoveredAt: new Date().toISOString(),
      provider: 'tavily',
      originalQuery: 'bad query',
      sourceConfidence: 'low',
    };

    const result = await verifier.verifySourceRecord(record);
    expect(result.status).toBe('unavailable');
  });
});
