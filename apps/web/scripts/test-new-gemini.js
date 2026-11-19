const fs = require('fs');

const envPath = 'C:\\Projects\\Ycce-hackkumbh\\apps\\web\\.env.local';
const envContent = fs.readFileSync(envPath, 'utf8');

let apiKey = '';
let model = 'gemini-2.5-flash';

for (const line of envContent.split('\n')) {
  if (line.startsWith('GEMINI_API_KEY=')) {
    apiKey = line.replace('GEMINI_API_KEY=', '').trim();
  }
  if (line.startsWith('GEMINI_MODEL=')) {
    model = line.replace('GEMINI_MODEL=', '').trim();
  }
}

console.log('=== GEMINI API AUDIT ===');
console.log('Configured Model:', model);
console.log('API Key Present:', Boolean(apiKey), `(${apiKey.length} chars)`);

if (!apiKey) {
  console.error('ERROR: GEMINI_API_KEY is missing from .env.local');
  process.exit(1);
}

async function testGemini() {
  console.log('\n[1/3] Testing minimal ping to Gemini API...');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: 'Respond with exactly the single word: OK' }] }],
      generationConfig: { maxOutputTokens: 10, temperature: 0.0 },
    }),
  });

  console.log('HTTP Status:', res.status, res.statusText);
  const data = await res.json();

  if (res.status === 200) {
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    console.log('SUCCESS! Authentication passed.');
    console.log('Model Response:', reply);

    // [2/3] Structured JSON test
    console.log('\n[2/3] Testing Structured JSON generation...');
    const jsonRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Generate JSON with: {"status": "ok", "role": "electrician"}' }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.1 },
      }),
    });
    const jsonData = await jsonRes.json();
    console.log('JSON Status:', jsonRes.status);
    console.log('JSON Output:', jsonData.candidates?.[0]?.content?.parts?.[0]?.text?.trim());

    // [3/3] Marathi Career Guidance Test
    console.log('\n[3/3] Testing Marathi Career Guidance generation...');
    const mrRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'मराठीमध्ये एका वाक्यात सांगा: आयटीआय इलेक्ट्रिशियन झाल्यानंतर नागपूर हिंगणा एमआयडीसीमध्ये काय संधी आहेत?' }] }],
        generationConfig: { maxOutputTokens: 100, temperature: 0.2 },
      }),
    });
    const mrData = await mrRes.json();
    console.log('Marathi Status:', mrRes.status);
    console.log('Marathi Output:', mrData.candidates?.[0]?.content?.parts?.[0]?.text?.trim());

    console.log('\nRESULT: GEMINI IS 100% OPERATIONAL WITH THE NEW KEY.');
  } else {
    console.error('ERROR RESPONSE:');
    if (res.status === 401 || res.status === 403) {
      console.error('AUTHENTICATION/PERMISSION ERROR:', data.error?.message);
    } else if (res.status === 404) {
      console.error('MODEL NOT FOUND ERROR:', data.error?.message);
    } else if (res.status === 429) {
      console.error('RATE LIMIT / QUOTA EXHAUSTED ERROR:', data.error?.message);
    } else {
      console.error('OTHER ERROR:', JSON.stringify(data));
    }
    console.log('\nRESULT: GEMINI IS NOT USABLE (Status ' + res.status + ')');
  }
}

testGemini().catch((e) => console.error('Network failure:', e.message));
