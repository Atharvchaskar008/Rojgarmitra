import admin from 'firebase-admin';

const projectId = process.env.FIREBASE_PROJECT_ID || 'rojgarmitra-dev';
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (privateKey) {
  // Handle escaped newlines from environment variables
  privateKey = privateKey.replace(/\\n/g, '\n');
}

if (!admin.apps.length) {
  if (clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
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
