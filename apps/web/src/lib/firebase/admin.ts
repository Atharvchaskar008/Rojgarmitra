import admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

let projectId = process.env.FIREBASE_PROJECT_ID || 'rojgarmitra-vidarbha';
let clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;

// If credentials not yet populated in process.env, check local private directory or .env.local
if (!clientEmail || !privateKey) {
  const saCandidates = [
    'C:\\Projects\\rojgarmitra-private\\firebase-service-account.json',
    path.resolve(process.cwd(), '..', 'rojgarmitra-private', 'firebase-service-account.json'),
    path.resolve(process.cwd(), 'rojgarmitra-private', 'firebase-service-account.json'),
  ];

  for (const saPath of saCandidates) {
    if (fs.existsSync(saPath)) {
      try {
        const sa = JSON.parse(fs.readFileSync(saPath, 'utf8'));
        if (sa.client_email && sa.private_key) {
          projectId = sa.project_id || projectId;
          clientEmail = sa.client_email;
          privateKey = sa.private_key;
          break;
        }
      } catch {
        // continue
      }
    }
  }
}

if (typeof privateKey === 'string') {
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    try {
      const parsed = JSON.parse(privateKey);
      if (typeof parsed === 'string') {
        privateKey = parsed;
      }
    } catch {
      // keep as is
    }
  }
  // Handle escaped newlines from environment variables
  privateKey = privateKey.replace(/\\n/g, '\n');
}

if (!admin.apps.length) {
  if (clientEmail && typeof privateKey === 'string') {
    const validKey: string = privateKey;
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: validKey,
        }),
      });
    } catch (certErr) {
      console.warn('[FirebaseAdmin] Failed to initialize with cert, falling back to default:', (certErr as Error).message);
      admin.initializeApp({ projectId });
    }
  } else {
    // Development / Emulator mode or default application credentials
    admin.initializeApp({
      projectId,
    });
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export default admin;
