const fs = require('fs');

const envContent = fs.readFileSync('C:\\Projects\\Ycce-hackkumbh\\apps\\web\\.env.local', 'utf8');
let tavilyKey = '';
for (const line of envContent.split('\n')) {
  if (line.startsWith('TAVILY_API_KEY=')) {
    tavilyKey = line.replace('TAVILY_API_KEY=', '').trim();
  }
}

if (!tavilyKey) {
  console.error('TAVILY_API_KEY not found in .env.local');
  process.exit(1);
}

async function testTavily() {
  console.log('Testing live Tavily Search API with basic query...');
  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: tavilyKey,
      query: 'electrician jobs in Nagpur MIDC',
      search_depth: 'basic',
      max_results: 3,
    }),
  });

  const data = await res.json();
  if (res.ok && data.results) {
    console.log('Tavily Search API SUCCESS! Total results:', data.results.length);
    console.log('First result title:', data.results[0]?.title);
    console.log('First result URL:', data.results[0]?.url);
  } else {
    console.error('Tavily API returned error:', data);
    process.exit(1);
  }
}

testTavily().catch(e => {
  console.error('Tavily network test failed:', e.message);
  process.exit(1);
});
