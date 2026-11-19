import { describe, it, expect } from 'vitest';

describe('Firestore Security Rules Logic', () => {
  function canCandidateWriteProfile(authUid: string | null, targetUid: string) {
    if (!authUid) return false;
    return authUid === targetUid;
  }

  function canClientEscalateRole(authUid: string | null, requestedRole: string) {
    if (!authUid) return false;
    // Disallow self-promotion to admin
    return requestedRole === 'candidate' || requestedRole === 'employer';
  }

  function canEmployerManageJob(authUid: string | null, jobEmployerUid: string) {
    if (!authUid) return false;
    return authUid === jobEmployerUid;
  }

  function canCandidateApplyToJob(authUid: string | null, candidateUid: string, sourceType: string) {
    if (!authUid) return false;
    if (authUid !== candidateUid) return false;
    // Cannot apply in-app to third-party external job
    return sourceType !== 'external_public';
  }

  it('allows candidate to write only their own profile', () => {
    expect(canCandidateWriteProfile('user_123', 'user_123')).toBe(true);
    expect(canCandidateWriteProfile('user_123', 'user_456')).toBe(false);
    expect(canCandidateWriteProfile(null, 'user_123')).toBe(false);
  });

  it('prevents client from self-assigning admin role', () => {
    expect(canClientEscalateRole('user_123', 'admin')).toBe(false);
    expect(canClientEscalateRole('user_123', 'candidate')).toBe(true);
    expect(canClientEscalateRole('user_123', 'employer')).toBe(true);
  });

  it('permits only the job creator employer to edit vacancy', () => {
    expect(canEmployerManageJob('emp_1', 'emp_1')).toBe(true);
    expect(canEmployerManageJob('emp_2', 'emp_1')).toBe(false);
  });

  it('enforces that candidates cannot apply internally to external public jobs', () => {
    expect(canCandidateApplyToJob('user_1', 'user_1', 'internal_employer')).toBe(true);
    expect(canCandidateApplyToJob('user_1', 'user_1', 'demo_seed')).toBe(true);
    expect(canCandidateApplyToJob('user_1', 'user_1', 'external_public')).toBe(false);
  });
});
