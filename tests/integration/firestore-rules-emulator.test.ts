import { describe, it, beforeAll, afterAll, beforeEach, expect } from 'vitest';
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import * as fs from 'fs';
import * as path from 'path';
import * as net from 'net';

describe('Firestore Security Rules Verification with Firebase Emulator', () => {
  let testEnv: RulesTestEnvironment | null = null;
  let emulatorAvailable = false;

  beforeAll(async () => {
    emulatorAvailable = await new Promise<boolean>((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(800);
      socket.on('connect', () => {
        socket.destroy();
        resolve(true);
      });
      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });
      socket.on('error', () => {
        resolve(false);
      });
      socket.connect(8085, '127.0.0.1');
    });

    if (!emulatorAvailable) {
      console.warn(
        '[Firestore Rules Test] Local Firestore emulator not detected on port 8085. Run with: pnpm test:emulator'
      );
      return;
    }

    const rulesPath = path.resolve(__dirname, '../../firebase/firestore.rules');
    const rules = fs.readFileSync(rulesPath, 'utf8');

    testEnv = await initializeTestEnvironment({
      projectId: 'rojgarmitra-test-rules',
      firestore: {
        rules,
        host: '127.0.0.1',
        port: 8085,
      },
    });
  });

  afterAll(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  beforeEach(async () => {
    if (testEnv) {
      await testEnv.clearFirestore();
    }
  });

  it('allows authenticated candidate to read and write their own candidate profile', async (ctx) => {
    if (!emulatorAvailable || !testEnv) return ctx.skip();
    const candidateContext = testEnv.authenticatedContext('candidate_ramesh');
    const profileRef = candidateContext.firestore().collection('candidates').doc('candidate_ramesh');

    await assertSucceeds(
      profileRef.set({
        trade: 'electrician',
        district: 'Nagpur',
        taluka: 'Hingna',
      })
    );

    const doc = await profileRef.get();
    expect(doc.exists).toBe(true);
    expect(doc.data()?.trade).toBe('electrician');
  });

  it('strictly blocks unauthorized user from reading another candidate profile', async (ctx) => {
    if (!emulatorAvailable || !testEnv) return ctx.skip();
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection('candidates').doc('candidate_private_1').set({
        preferredName: 'Private Candidate',
        phone: '9876543210',
        district: 'Nagpur',
      });
    });

    const attackerContext = testEnv.authenticatedContext('attacker_uid');
    const targetRef = attackerContext.firestore().collection('candidates').doc('candidate_private_1');

    await assertFails(targetRef.get());
  });

  it('strictly blocks unauthorized user from modifying another candidate profile', async (ctx) => {
    if (!emulatorAvailable || !testEnv) return ctx.skip();
    const attackerContext = testEnv.authenticatedContext('attacker_uid');
    const targetRef = attackerContext.firestore().collection('candidates').doc('victim_candidate');

    await assertFails(
      targetRef.set({
        preferredName: 'Tampered Profile',
      })
    );
  });

  it('allows public read on job feed but blocks unauthenticated job creation', async (ctx) => {
    if (!emulatorAvailable || !testEnv) return ctx.skip();
    const unauthContext = testEnv.unauthenticatedContext();
    const jobsRef = unauthContext.firestore().collection('jobs').doc('job_public_1');

    await assertSucceeds(jobsRef.get());

    await assertFails(
      jobsRef.set({
        title: 'Fake Job',
        employerUid: 'anyone',
      })
    );
  });

  it('allows employer to create job only when employerUid matches authenticated uid', async (ctx) => {
    if (!emulatorAvailable || !testEnv) return ctx.skip();
    const employerContext = testEnv.authenticatedContext('emp_tata_motors');
    const validJobRef = employerContext.firestore().collection('jobs').doc('job_1');

    await assertSucceeds(
      validJobRef.set({
        title: 'CNC Operator',
        employerUid: 'emp_tata_motors',
        status: 'open',
      })
    );

    const invalidJobRef = employerContext.firestore().collection('jobs').doc('job_2');
    await assertFails(
      invalidJobRef.set({
        title: 'Fake Posting',
        employerUid: 'different_emp_id',
        status: 'open',
      })
    );
  });
});
