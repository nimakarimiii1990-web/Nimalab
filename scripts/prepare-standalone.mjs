// Prepares the Next.js standalone output after `next build`.
// Works regardless of the project folder name (standalone output is nested
// like .next/standalone/<project>/server.js) and copies public/ + static
// assets into the right place.
import { existsSync, cpSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const root = process.cwd();
const standaloneDir = join(root, '.next', 'standalone');

function findServerDir(dir, depth = 0) {
  if (depth > 4) return null;
  if (existsSync(join(dir, 'server.js'))) return dir;
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    try {
      if (statSync(p).isDirectory()) {
        const found = findServerDir(p, depth + 1);
        if (found) return found;
      }
    } catch {
      /* ignore unreadable entries */
    }
  }
  return null;
}

const serverDir = findServerDir(standaloneDir);
if (!serverDir) {
  console.error('[prepare-standalone] server.js not found under .next/standalone — was "next build" run?');
  process.exit(1);
}

cpSync(join(root, 'public'), join(serverDir, 'public'), { recursive: true });
cpSync(join(root, '.next', 'static'), join(serverDir, '.next', 'static'), { recursive: true });
console.log('[prepare-standalone] ready:', serverDir);
