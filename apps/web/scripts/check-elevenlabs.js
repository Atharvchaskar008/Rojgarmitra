const fs = require('fs');

const envPath = 'C:\\Projects\\Ycce-hackkumbh\\apps\\web\\.env.local';
const envContent = fs.readFileSync(envPath, 'utf8');
let apiKey = '';
for (const line of envContent.split('\n')) {
  if (line.startsWith('ELEVENLABS_API_KEY=')) {
    apiKey = line.replace('ELEVENLABS_API_KEY=', '').trim();
  }
}

if (!apiKey) {
  console.error('ELEVENLABS_API_KEY not found in .env.local');
  process.exit(1);
}

async function testElevenLabs() {
  console.log('Testing live ElevenLabs API...');
  const res = await fetch('https://api.elevenlabs.io/v1/voices', {
    headers: { 'xi-api-key': apiKey },
  });

  const data = await res.json();
  if (res.ok && data.voices) {
    console.log('ElevenLabs API SUCCESS! Total available voices:', data.voices.length);
    const sample = data.voices.slice(0, 5).map(v => ({
      voice_id: v.voice_id,
      name: v.name,
      category: v.category,
      accent: v.labels?.accent,
      description: v.labels?.description,
      language: v.labels?.language,
    }));
    console.log('Discovered voices sample:', JSON.stringify(sample, null, 2));

    // Find the best voice for Indian multilingual/regional or default pleasant voice
    const indVoice = data.voices.find(v => 
      (v.labels?.accent && /indian|hindi|marathi/i.test(v.labels.accent)) ||
      (v.labels?.language && /hindi|marathi/i.test(v.labels.language))
    );

    const selectedVoice = indVoice || data.voices[0];
    console.log('Selected voice:', selectedVoice.name, '(', selectedVoice.voice_id, ')');

    // If ELEVENLABS_VOICE_ID is not already present, we can append or update it
    let updatedEnv = envContent;
    if (!envContent.includes('ELEVENLABS_VOICE_ID=') || envContent.includes('ELEVENLABS_VOICE_ID=\n') || envContent.endsWith('ELEVENLABS_VOICE_ID=')) {
      if (/ELEVENLABS_VOICE_ID=[^\r\n]*/.test(updatedEnv)) {
        updatedEnv = updatedEnv.replace(/ELEVENLABS_VOICE_ID=[^\r\n]*/, `ELEVENLABS_VOICE_ID=${selectedVoice.voice_id}`);
      } else {
        updatedEnv += `\nELEVENLABS_VOICE_ID=${selectedVoice.voice_id}\n`;
      }
      fs.writeFileSync(envPath, updatedEnv, 'utf8');
      console.log('Updated ELEVENLABS_VOICE_ID in .env.local to:', selectedVoice.voice_id);
    } else {
      console.log('ELEVENLABS_VOICE_ID is already configured.');
    }
  } else {
    console.error('ElevenLabs API returned error:', data);
    process.exit(1);
  }
}

testElevenLabs().catch(e => {
  console.error('ElevenLabs test failed:', e.message);
  process.exit(1);
});
