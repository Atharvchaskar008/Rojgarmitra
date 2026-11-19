import * as fs from 'fs';
import * as path from 'path';

// Pre-load environment variables from apps/web/.env.local for all Vitest suites
const envCandidates = [
  path.resolve(process.cwd(), 'apps', 'web', '.env.local'),
  path.resolve(process.cwd(), '.env.local'),
  'C:\\Projects\\Ycce-hackkumbh\\apps\\web\\.env.local',
];

for (const envFile of envCandidates) {
  if (fs.existsSync(envFile)) {
    const lines = fs.readFileSync(envFile, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const idx = trimmed.indexOf('=');
        if (idx > -1) {
          const k = trimmed.substring(0, idx).trim();
          let v = trimmed.substring(idx + 1).trim();
          if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
          if (!process.env[k]) process.env[k] = v;
        }
      }
    }
    break;
  }
}
