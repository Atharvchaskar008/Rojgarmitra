import { describe, it, expect } from 'vitest';
import { CandidateProfileSchema } from '../../packages/shared/src/schemas';
import { formatZodErrors } from '../../apps/web/src/lib/validation/onboarding';

describe('Localized Validation Errors', () => {
  it('formats invalid phone error in Marathi', () => {
    try {
      CandidateProfileSchema.parse({
        preferredName: 'A', // too small
        district: 'Nagpur',
        skillIds: ['house_wiring'],
        phone: '12345',
      });
    } catch (err: any) {
      const mrErrors = formatZodErrors(err, 'mr');
      expect(mrErrors.some(e => e.message.includes('किमान २ अक्षरांचे नाव'))).toBe(true);
      expect(mrErrors.some(e => e.message.includes('१० अंकी वैध भारतीय मोबाईल'))).toBe(true);
    }
  });

  it('formats invalid phone error in Hindi', () => {
    try {
      CandidateProfileSchema.parse({
        preferredName: 'Amit',
        district: 'Nagpur',
        skillIds: [], // empty
      });
    } catch (err: any) {
      const hiErrors = formatZodErrors(err, 'hi');
      expect(hiErrors.some(e => e.message.includes('कम से कम एक कौशल'))).toBe(true);
    }
  });

  it('formats errors in English', () => {
    try {
      CandidateProfileSchema.parse({
        preferredName: 'Amit',
        district: 'Nagpur',
        skillIds: [],
      });
    } catch (err: any) {
      const enErrors = formatZodErrors(err, 'en');
      expect(enErrors.some(e => e.message.includes('Please select at least one skill'))).toBe(true);
    }
  });
});
