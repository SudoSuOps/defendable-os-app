import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

/** Uses a locally installed Chromium-family browser; set DEFENDABLE_BROWSER to override. */
export const BROWSER = process.env.DEFENDABLE_BROWSER || '/snap/bin/brave';

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.txt': 'text/plain', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.xml': 'application/xml', '.ico': 'image/x-icon' };

/** Parses a Cloudflare Pages `_headers` file into [pattern, headers] rules. */
export function parseHeaders(text) {
  const rules = [];
  let cur = null;
  for (const raw of text.split('\n')) {
    if (!raw.trim()) continue;
    if (!/^\s/.test(raw)) rules.push((cur = [raw.trim(), {}]));
    else if (cur) {
      const i = raw.indexOf(':');
      cur[1][raw.slice(0, i).trim()] = raw.slice(i + 1).trim();
    }
  }
  return rules;
}
const matches = (pattern, path) => new RegExp('^' + pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$').test(path);

/** Serves ./out (the static export) on a random loopback port, applying out/_headers the way Cloudflare Pages does. */
export async function serve(root = 'out') {
  const rules = parseHeaders(await readFile(join(root, '_headers'), 'utf8').catch(() => ''));
  const server = createServer(async (req, res) => {
    try {
      let p = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
      let file = join(root, p);
      if ((await stat(file).catch(() => null))?.isDirectory()) file = join(file, 'index.html');
      const body = await readFile(file);
      const headers = { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' };
      for (const [pat, h] of rules) if (matches(pat, p)) for (const [k, v] of Object.entries(h)) headers[k.toLowerCase()] = v;
      res.writeHead(200, headers);
      res.end(body);
    } catch {
      res.writeHead(404).end('not found');
    }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const { port } = server.address();
  return { base: `http://127.0.0.1:${port}`, close: () => new Promise((r) => server.close(r)) };
}

export async function launch({ width = 1440, height = 900, reducedMotion = 'no-preference', acceptDownloads = true } = {}) {
  const browser = await chromium.launch({ executablePath: BROWSER, headless: true, args: ['--no-sandbox', '--disable-gpu'] });
  const ctx = await browser.newContext({ viewport: { width, height }, reducedMotion, acceptDownloads });
  await ctx.addInitScript(() => {
    window.__csp = [];
    document.addEventListener('securitypolicyviolation', (e) => window.__csp.push(`${e.violatedDirective} blocked ${e.blockedURI}`));
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => {
    // WebGL driver chatter in headless is not an app error.
    if (m.type() === 'error' && !/GL Driver|GPU stall|WebGL/i.test(m.text())) errors.push('console: ' + m.text());
  });
  return { browser, ctx, page, errors };
}
