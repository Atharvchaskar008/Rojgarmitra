const fs = require('fs');
const admin = require('firebase-admin');

const envContent = fs.readFileSync('apps/web/.env.local', 'utf8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eq = trimmed.indexOf('=');
  if (eq > 0) {
    const k = trimmed.slice(0, eq).trim();
    let v = trimmed.slice(eq + 1).trim();
    if (v.startsWith('"') && v.endsWith('"')) {
      try { v = JSON.parse(v); } catch {}
    }
    process.env[k] = v;
  }
}

let privateKey = process.env.FIREBASE_PRIVATE_KEY;
if (privateKey) privateKey = privateKey.replace(/\\n/g, '\n');

const app = admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey,
  }),
});

async function addAuthorizedDomains() {
  try {
    const token = await app.options.credential.getAccessToken();
    const projectId = process.env.FIREBASE_PROJECT_ID;

    // Current domains + vercel domains
    const newDomains = [
      "localhost",
      "127.0.0.1",
      "rojgarmitra-vidarbha.firebaseapp.com",
      "rojgarmitra-vidarbha.web.app",
      "rojgarmitra.vercel.app",
      "vercel.app"
    ];

    console.log('Updating authorized domains to:', newDomains);

    const res = await fetch(`https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config?updateMask=authorizedDomains`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        authorizedDomains: newDomains,
      }),
    });

    const data = await res.json();
    console.log('Update response status:', res.status);
    console.log('Updated config:', JSON.stringify(data.authorizedDomains, null, 2));
  } catch (e) {
    console.error('Error updating authorized domains:', e.message);
  }
}

addAuthorizedDomains();
