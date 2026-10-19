// Runs after `next build`. Computes a strict Content-Security-Policy from the inline scripts Next actually emitted and writes it into
// out/_headers, so script-src can be 'self' plus exact hashes (no 'unsafe-inline'). Fails the build if a page has an inline script it cannot hash.
import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const OUT = 'out';

async function htmlFiles(dir) {
  const files = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.name === '_next') continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) files.push(...(await htmlFiles(p)));
    else if (e.name.endsWith('.html')) files.push(p);
  }
  return files;
}

const hashes = new Set();
for (const f of await htmlFiles(OUT)) {
  const html = await readFile(f, 'utf8');
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    const attrs = m[1];
    if (/\bsrc=/.test(attrs)) continue; // external, covered by 'self'
    if (/type=["']application\/(ld\+json|json)["']/.test(attrs)) continue; // data blocks are not executed
    if (!m[2].trim()) continue;
    hashes.add(`'sha256-${createHash('sha256').update(m[2]).digest('base64')}'`);
  }
}

const csp = [
  "default-src 'self'",
  `script-src 'self' ${[...hashes].sort().join(' ')}`,
  "style-src 'self' 'unsafe-inline'", // React emits inline style attributes (SVG, CSS variables); scripts are the real attack surface
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

const path = join(OUT, '_headers');
const src = await readFile(path, 'utf8');
if (!src.includes('Content-Security-Policy:')) throw new Error('public/_headers has no Content-Security-Policy line to replace');
await writeFile(path, src.replace(/^(\s*)Content-Security-Policy:.*$/m, `$1Content-Security-Policy: ${csp}`));
console.log(`postbuild: CSP written with ${hashes.size} inline-script hashes`);
