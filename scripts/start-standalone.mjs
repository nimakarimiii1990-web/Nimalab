// Starts the production server from the standalone build.
// Finds server.js automatically (nested or not) and runs it with Node.
import { spawn } from 'child_process';
import { existsSync, readdirSync, statSync } from 'fs';
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
  console.error('[start] No standalone build found. Run:  npm run build');
  process.exit(1);
}

const port = process.env.PORT || '3000';
console.log(`[start] Nima running on http://localhost:${port}`);
const child = spawn(process.execPath, [join(serverDir, 'server.js')], {
  cwd: serverDir,
  env: { ...process.env, NODE_ENV: 'production', PORT: port },
  stdio: 'inherit',
});
child.on('exit', (code) => process.exit(code ?? 0));
