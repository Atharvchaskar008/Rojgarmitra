const fs = require('fs');
const admin = require('firebase-admin');

// Parse .env.local without external dependencies
const envContent = fs.readFileSync('C:\\Projects\\Ycce-hackkumbh\\apps\\web\\.env.local', 'utf8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eq = trimmed.indexOf('=');
  if (eq > 0) {
    const k = trimmed.slice(0, eq).trim();
    let v = trimmed.slice(eq + 1).trim();
    if (v.startsWith('"') && v.endsWith('"')) {
      try {
        v = JSON.parse(v);
      } catch {}
    }
    process.env[k] = v;
  }
}

let privateKey = process.env.FIREBASE_PRIVATE_KEY;
if (privateKey) {
  privateKey = privateKey.replace(/\\n/g, '\n');
}

try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  });

  admin.firestore().listCollections()
    .then((collections) => {
      console.log('Firebase Admin connectivity verified: SUCCESS.');
      console.log('Collections present in rojgarmitra-dev:', collections.map((c) => c.id));
      process.exit(0);
    })
    .catch((err) => {
      console.error('Firestore access error:', err.message);
      process.exit(1);
    });
} catch (initErr) {
  console.error('Firebase Admin init error:', initErr.message);
  process.exit(1);
}
