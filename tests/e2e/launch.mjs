import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

/** Uses a locally installed Chromium-family browser; set DEFENDABLE_BROWSER to override. */
export const BROWSER = process.env.DEFENDABLE_BROWSER || '/snap/bin/brave';

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.txt': 'text/plain', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };

/** Serves ./out (the static export) on a random loopback port. */
export async function serve(root = 'out') {
  const server = createServer(async (req, res) => {
    try {
      let p = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
      let file = join(root, p);
      if ((await stat(file).catch(() => null))?.isDirectory()) file = join(file, 'index.html');
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' });
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
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => {
    // WebGL driver chatter in headless is not an app error.
    if (m.type() === 'error' && !/GL Driver|GPU stall|WebGL/i.test(m.text())) errors.push('console: ' + m.text());
  });
  return { browser, ctx, page, errors };
}
