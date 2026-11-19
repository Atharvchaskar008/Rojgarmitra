import { describe, it, expect } from 'vitest';
import { CandidateProfileSchema, EmployerProfileSchema } from '../../packages/shared/src/schemas';
import { requireRole, AuthError, AuthenticatedUser } from '../../apps/web/src/lib/auth/server-auth';

describe('Auth & RBAC Guards', () => {
  const candidateUser: AuthenticatedUser = {
    uid: 'candidate_1',
    role: 'candidate',
    email: 'ramesh@example.com',
    preferredLocale: 'mr',
  };

  const employerUser: AuthenticatedUser = {
    uid: 'employer_1',
    role: 'employer',
    email: 'vidarbha.auto@example.com',
    preferredLocale: 'mr',
  };

  it('allows candidate when candidate role is permitted', () => {
    expect(() => requireRole(candidateUser, ['candidate'])).not.toThrow();
  });

  it('denies candidate when employer role is strictly required', () => {
    expect(() => requireRole(candidateUser, ['employer'])).toThrow(AuthError);
    try {
      requireRole(candidateUser, ['employer']);
    } catch (err: any) {
      expect(err.status).toBe(403);
    }
  });

  it('allows employer when employer or admin role is permitted', () => {
    expect(() => requireRole(employerUser, ['employer', 'admin'])).not.toThrow();
  });

  it('denies employer from accessing candidate-only endpoints', () => {
    expect(() => requireRole(employerUser, ['candidate'])).toThrow(AuthError);
  });
});

describe('Validation Schemas', () => {
  it('validates candidate profile correctly', () => {
    const validData = {
      preferredName: 'Sanjay Deshmukh',
      district: 'Nagpur',
      taluka: 'Butibori',
      skillIds: ['house_wiring'],
      experienceMonths: 12,
      availability: 'immediate',
      phone: '9876543210',
    };
    const parsed = CandidateProfileSchema.parse(validData);
    expect(parsed.preferredName).toBe('Sanjay Deshmukh');
    expect(parsed.skillIds).toContain('house_wiring');
  });

  it('fails candidate profile with invalid phone number', () => {
    const invalidData = {
      preferredName: 'Sanjay',
      district: 'Nagpur',
      skillIds: ['house_wiring'],
      phone: '12345', // invalid length and starting digit
    };
    expect(() => CandidateProfileSchema.parse(invalidData)).toThrow();
  });

  it('fails candidate profile when no skills are provided', () => {
    const noSkillsData = {
      preferredName: 'Sanjay',
      district: 'Nagpur',
      skillIds: [], // empty
    };
    expect(() => CandidateProfileSchema.parse(noSkillsData)).toThrow();
  });

  it('validates employer profile with industrial area', () => {
    const validEmployer = {
      businessName: 'Vidarbha Engineering',
      contactName: 'Sunil Verma',
      district: 'Nagpur',
      industrialArea: 'Butibori MIDC',
      companyCategory: 'manufacturing',
      phone: '9123456789',
    };
    const parsed = EmployerProfileSchema.parse(validEmployer);
    expect(parsed.industrialArea).toBe('Butibori MIDC');
  });
});
