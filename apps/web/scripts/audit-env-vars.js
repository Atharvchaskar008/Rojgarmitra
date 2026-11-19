const fs = require('fs');
const path = require('path');

const rootDir = 'C:\\Projects\\Ycce-hackkumbh';
const ignoreDirs = new Set(['node_modules', '.next', '.git', 'dist', '.vercel', '.turbo', '.pnpm-store']);

const foundVars = new Map(); // varName -> Set of file paths

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!ignoreDirs.has(entry.name)) {
        scanDir(path.join(dir, entry.name));
      }
    } else if (entry.isFile() && /\.(ts|tsx|js|jsx|json|mjs|cjs)$/.test(entry.name)) {
      const filePath = path.join(dir, entry.name);
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        // Match process.env.XYZ
        const procMatches = content.matchAll(/process\.env\.([A-Z0-9_]+)/g);
        for (const m of procMatches) {
          const v = m[1];
          if (!foundVars.has(v)) foundVars.set(v, new Set());
          foundVars.get(v).add(path.relative(rootDir, filePath));
        }
        // Match EXPO_PUBLIC_XYZ
        const expoMatches = content.matchAll(/EXPO_PUBLIC_([A-Z0-9_]+)/g);
        for (const m of expoMatches) {
          const v = `EXPO_PUBLIC_${m[1]}`;
          if (!foundVars.has(v)) foundVars.set(v, new Set());
          foundVars.get(v).add(path.relative(rootDir, filePath));
        }
      } catch (e) {
        // ignore
      }
    }
  }
}

scanDir(rootDir);

// Read local .env.local in web and mobile securely
function readLocalEnv(envPath) {
  const map = new Map();
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const l of lines) {
      const t = l.trim();
      if (t && !t.startsWith('#')) {
        const idx = t.indexOf('=');
        if (idx > -1) {
          const k = t.substring(0, idx).trim();
          const v = t.substring(idx + 1).trim();
          map.set(k, { present: Boolean(v && v.length > 0), length: v.length });
        }
      }
    }
  }
  return map;
}

const webEnv = readLocalEnv(path.join(rootDir, 'apps', 'web', '.env.local'));
const mobileEnv = readLocalEnv(path.join(rootDir, 'apps', 'mobile', '.env.local'));
const rootEnv = readLocalEnv(path.join(rootDir, '.env.local'));

console.log('=== ENVIRONMENT VARIABLE AUDIT ===');
console.log(`Total distinct referenced variables: ${foundVars.size}\n`);

const results = [];
for (const [vName, files] of Array.from(foundVars.entries()).sort()) {
  const webState = webEnv.get(vName);
  const mobileState = mobileEnv.get(vName);
  const rootState = rootEnv.get(vName);

  const isPresentLocally = Boolean(
    (webState && webState.present) ||
    (mobileState && mobileState.present) ||
    (rootState && rootState.present)
  );

  const filesArr = Array.from(files);

  results.push({
    name: vName,
    presentLocally: isPresentLocally,
    web: webState ? (webState.present ? `YES (${webState.length} chars)` : 'EMPTY') : 'NOT_FOUND',
    mobile: mobileState ? (mobileState.present ? `YES (${mobileState.length} chars)` : 'EMPTY') : 'NOT_FOUND',
    usedIn: filesArr,
  });
}

console.log(JSON.stringify(results, null, 2));
