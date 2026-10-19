// Audits the BUILT output in ./out (run `npm run build` first). Everything here is a property of the shipped files, not of the source.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as cheerio from 'cheerio';

const OUT = 'out';
const SITE = 'https://defendableos.com';
const read = (p) => readFileSync(join(OUT, p), 'utf8');
const norm = (s) => s.replace(/\s+/g, ' ').trim();
const $ = cheerio.load(read('index.html'));
const pngSize = (p) => { const b = readFileSync(join(OUT, p)); return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) }; };
const ld = JSON.parse($('script[type="application/ld+json"]').first().text());
const graph = ld['@graph'];
const byType = (t) => graph.filter((n) => n['@type'] === t);
const visibleText = norm($('body').clone().find('script,style,noscript').remove().end().text());

describe('head: title, description, canonical, robots', () => {
  it('has a title and meta description of search-friendly length', () => {
    const t = $('title').text();
    const d = $('meta[name="description"]').attr('content');
    assert.ok(t.length >= 30 && t.length <= 65, `title ${t.length}: ${t}`);
    assert.ok(d.length >= 120 && d.length <= 165, `description ${d.length}`);
    assert.ok(!/(lorem|todo)/i.test(t + d));
  });
  it('has one absolute https canonical on the production domain', () => {
    const c = $('link[rel="canonical"]');
    assert.equal(c.length, 1);
    assert.match(c.attr('href'), /^https:\/\/defendableos\.com\/?$/);
  });
  it('is indexable (no noindex) and sets a language and viewport', () => {
    assert.equal($('html').attr('lang'), 'en');
    assert.match($('meta[name="robots"]').attr('content'), /index/);
    assert.doesNotMatch($('meta[name="robots"]').attr('content'), /noindex|nofollow/);
    assert.ok($('meta[name="viewport"]').attr('content'));
    assert.ok($('meta[name="theme-color"]').attr('content'));
  });
  it('has complete Open Graph and Twitter cards with a correctly sized image', () => {
    for (const p of ['og:title', 'og:description', 'og:url', 'og:image', 'og:image:width', 'og:image:height', 'og:image:alt', 'og:type', 'og:site_name', 'og:locale']) assert.ok($(`meta[property="${p}"]`).attr('content'), p);
    for (const n of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image', 'twitter:site']) assert.ok($(`meta[name="${n}"]`).attr('content'), n);
    const img = $('meta[property="og:image"]').attr('content');
    assert.ok(img.startsWith(`${SITE}/`));
    const { w, h } = pngSize(img.replace(SITE + '/', ''));
    assert.deepEqual([w, h], [1200, 630]);
    assert.ok(readFileSync(join(OUT, img.replace(SITE + '/', ''))).length < 300 * 1024, 'og image should stay small');
  });
  it('links the manifest, favicon and apple touch icon', () => {
    assert.ok($('link[rel="manifest"]').attr('href'));
    assert.ok($('link[rel="icon"]').length >= 1);
    assert.ok($('link[rel="apple-touch-icon"]').length >= 1);
  });
});

describe('document structure', () => {
  it('has exactly one h1 and never skips a heading level', () => {
    assert.equal($('h1').length, 1);
    let prev = 0;
    $('h1,h2,h3,h4').each((_, el) => {
      const lv = Number(el.tagName[1]);
      assert.ok(prev === 0 || lv <= prev + 1, `h${lv} after h${prev}`);
      prev = lv;
    });
  });
  it('has main, header, footer and nav landmarks', () => {
    for (const s of ['main', 'header', 'footer', 'nav[aria-label="Primary"]', 'nav[aria-label="Footer"]']) assert.equal($(s).length, 1, s);
  });
  it('every image has alt text (empty only when decorative) and explicit dimensions', () => {
    $('img').each((_, el) => {
      assert.notEqual($(el).attr('alt'), undefined, $(el).attr('src'));
      assert.ok($(el).attr('width') && $(el).attr('height'), `size missing: ${$(el).attr('src')}`);
    });
  });
  it('every in-page anchor resolves to an element id, and every internal link exists on disk', () => {
    const ids = new Set($('[id]').map((_, e) => $(e).attr('id')).get());
    $('a[href^="#"]').each((_, a) => { const h = $(a).attr('href').slice(1); if (h) assert.ok(ids.has(h), `#${h}`); });
    $('a[href^="/"]').each((_, a) => { const p = $(a).attr('href').split('#')[0].replace(/^\//, '') || 'index.html'; assert.ok(existsSync(join(OUT, p)), `/${p}`); });
  });
  it('external links are rel=noopener and no link is empty', () => {
    $('a[target="_blank"]').each((_, a) => assert.match($(a).attr('rel') ?? '', /noopener/));
    $('a').each((_, a) => assert.ok(norm($(a).text()) || $(a).attr('aria-label') || $(a).find('img[alt]').length, `empty link ${$(a).attr('href')}`));
  });
  it('ships the page content in the HTML (not rendered only by JavaScript)', () => {
    for (const phrase of ['An AI answer is not evidence.', 'Who validates the validator?', 'Every task begins with a contract.', 'Questions, answered plainly.', 'Donovan Mackey']) assert.ok(visibleText.includes(phrase), phrase);
  });
});

describe('structured data (JSON-LD)', () => {
  it('is one linked graph with the expected entity types', () => {
    assert.equal(ld['@context'], 'https://schema.org');
    for (const t of ['Organization', 'Person', 'WebSite', 'WebPage', 'SoftwareApplication', 'FAQPage']) assert.equal(byType(t).length, 1, t);
  });
  it('every @id reference resolves inside the graph, and every URL is on the production domain', () => {
    const ids = new Set(graph.map((n) => n['@id']));
    const walk = (o) => { if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === 'object') { const keys = Object.keys(o); if (keys.length === 1 && keys[0] === '@id') assert.ok(ids.has(o['@id']), o['@id']); for (const [k, v] of Object.entries(o)) { if (k === 'url' || k === '@id') assert.match(String(v), /^https:\/\/defendableos\.com\//, `${k}=${v}`); walk(v); } } };
    walk(graph);
  });
  it('FAQPage matches the visible FAQ exactly (same questions, same answers, same count)', () => {
    const faq = byType('FAQPage')[0].mainEntity;
    const visible = $('#faq details').map((_, d) => ({ q: norm($(d).find('summary span').first().text()), a: norm($(d).find('p').text()) })).get();
    assert.equal(visible.length, faq.length);
    assert.ok(faq.length >= 8);
    faq.forEach((f, i) => { assert.equal(norm(f.name), visible[i].q); assert.equal(norm(f.acceptedAnswer.text), visible[i].a); });
  });
  it('invents no ratings, reviews, offers or prices', () => {
    const s = JSON.stringify(ld);
    for (const k of ['aggregateRating', 'ratingValue', 'review', 'offers', 'price']) assert.ok(!s.includes(`"${k}"`), k);
  });
  it('Organization carries the founder, location and verifiable profile', () => {
    const org = byType('Organization')[0];
    assert.equal(org.name, 'Swarm & Bee AI');
    assert.equal(org.address.addressLocality, 'Jupiter');
    assert.ok(org.sameAs.includes('https://x.com/defendableos'));
    assert.equal(byType('Person')[0].name, 'Donovan Mackey');
  });
});

describe('Cloudflare email obfuscation guard', () => {
  it('wraps the whole page in email_off markers so version strings like dv-validator@1.4.0 are never rewritten', () => {
    const raw = read('index.html');
    const open = raw.indexOf('<!--email_off-->');
    const close = raw.indexOf('<!--/email_off-->');
    assert.ok(open > 0 && close > open, 'markers missing or out of order');
    assert.ok(open < raw.indexOf('<main'), 'opening marker must precede <main>');
    assert.ok(close > raw.indexOf('</footer>'), 'closing marker must follow the footer');
    for (const s of ['dv-validator@1.4.0', 'lease-record@2.1', 'build@defendableos.com']) {
      const i = raw.indexOf(s);
      assert.ok(i > open && i < close, `${s} falls outside the protected region`);
    }
  });
});

describe('crawl files', () => {
  it('robots.txt allows everything, names the AI crawlers, and points to the sitemap', () => {
    const r = read('robots.txt');
    assert.match(r, /User-Agent: \*\s+Allow: \//i);
    assert.doesNotMatch(r, /Disallow:\s*\/\s*$/m);
    for (const bot of ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended']) assert.match(r, new RegExp(`User-Agent: ${bot}\\s+Allow: /`, 'i'), bot);
    assert.match(r, /Sitemap: https:\/\/defendableos\.com\/sitemap\.xml/);
  });
  it('sitemap.xml lists the canonical URL with a real, non-future lastmod', () => {
    const s = read('sitemap.xml');
    assert.match(s, /<loc>https:\/\/defendableos\.com\/<\/loc>/);
    const lm = s.match(/<lastmod>([^<]+)<\/lastmod>/)[1];
    assert.ok(new Date(lm) <= new Date(Date.now() + 86400000), `lastmod in the future: ${lm}`);
    assert.ok(!/changefreq|priority/.test(s), 'Google ignores these');
  });
  it('manifest is valid and its icons exist', () => {
    const m = JSON.parse(read('manifest.webmanifest'));
    assert.ok(m.name && m.short_name && m.start_url && m.icons.length >= 2);
    for (const i of m.icons) assert.ok(existsSync(join(OUT, i.src.replace(/^\//, ''))), i.src);
  });
  it('security.txt has a contact and is not about to expire', () => {
    const t = read('.well-known/security.txt');
    assert.match(t, /^Contact: mailto:/m);
    const exp = new Date(t.match(/^Expires: (.+)$/m)[1]);
    assert.ok(exp > new Date(Date.now() + 30 * 86400000), `expires ${exp.toISOString()}`);
  });
  it('the 404 page is noindexed and offers a way home', () => {
    const n = cheerio.load(read('404.html'));
    assert.match(n('meta[name="robots"]').attr('content'), /noindex/);
    assert.ok(n('a[href="/"]').length >= 1);
  });
});

describe('llms.txt and llms-full.txt (generative engine optimization)', () => {
  const l = read('llms.txt');
  const full = read('llms-full.txt');
  it('follows the llms.txt shape: H1, blockquote summary, H2 sections with link lists', () => {
    assert.match(l, /^# DefendableOS\n\n> .{80,}/);
    for (const h of ['## Pages', '## Sections', '## Key concepts', '## Questions', '## Contact']) assert.ok(l.includes(h), h);
  });
  it('every link in llms.txt resolves (files exist, anchors match real ids)', () => {
    const ids = new Set($('[id]').map((_, e) => $(e).attr('id')).get());
    const links = [...l.matchAll(/\]\((https:\/\/defendableos\.com[^)]*)\)/g)].map((m) => m[1]);
    assert.ok(links.length >= 15);
    for (const u of links) {
      const { pathname, hash } = new URL(u);
      const file = pathname === '/' ? 'index.html' : pathname.slice(1);
      assert.ok(existsSync(join(OUT, file)), u);
      if (hash) assert.ok(ids.has(hash.slice(1)), u);
    }
  });
  it('llms-full.txt carries every FAQ question and answer verbatim, plus each engine stage and scenario', () => {
    for (const f of $('#faq details')) { assert.ok(full.includes(norm($(f).find('summary span').first().text()))); assert.ok(norm(full).includes(norm($(f).find('p').text()))); }
    for (const s of ['Input', 'Normalization', 'Dataset Curation', 'Agent Execution', 'Deterministic Validation', 'Independent Verification', 'Human Authority', 'Proof Receipt']) assert.ok(full.includes(`. ${s}`), s);
    for (const k of ['A', 'B', 'C', 'D', 'E']) assert.ok(full.includes(`Scenario ${k},`), k);
    assert.ok(full.length > 12000);
  });
  it('llms files are plain text with no HTML', () => { assert.ok(!/<\/?(div|span|script|p)\b/i.test(l + full)); });
});

describe('security headers (as served by Cloudflare Pages)', () => {
  const h = read('_headers');
  const all = h.split('\n\n')[0];
  it('sets HSTS, nosniff, frame denial, referrer and permissions policy, COOP', () => {
    for (const k of ['Strict-Transport-Security: max-age=31536000', 'X-Content-Type-Options: nosniff', 'X-Frame-Options: DENY', 'Referrer-Policy:', 'Permissions-Policy:', 'Cross-Origin-Opener-Policy: same-origin']) assert.ok(all.includes(k), k);
  });
  it('has a CSP with no unsafe-inline or unsafe-eval for scripts, and frame-ancestors none', () => {
    const csp = all.match(/Content-Security-Policy: (.+)/)[1];
    const script = csp.match(/script-src ([^;]+)/)[1];
    assert.ok(!/unsafe-inline|unsafe-eval|\*/.test(script), script);
    const origins = script.split(/\s+/).filter((t) => t.startsWith('http'));
    assert.deepEqual(origins, ['https://static.cloudflareinsights.com'], 'only the Cloudflare analytics origin may be allowed for scripts');
    assert.match(csp, /frame-ancestors 'none'/);
    assert.match(csp, /object-src 'none'/);
    assert.match(csp, /base-uri 'self'/);
  });
  it('the CSP hashes cover every inline script in every page (recomputed independently)', () => {
    const csp = all.match(/Content-Security-Policy: (.+)/)[1];
    for (const f of ['index.html', '404.html']) {
      const page = cheerio.load(read(f));
      page('script:not([src])').each((_, s) => {
        if (/ld\+json|json/.test(page(s).attr('type') ?? '')) return;
        const body = page(s).html();
        if (!body?.trim()) return;
        assert.ok(csp.includes(`'sha256-${createHash('sha256').update(body).digest('base64')}'`), `${f}: unhashed inline script ${body.slice(0, 50)}`);
      });
    }
  });
  it('hashed assets are immutable-cached', () => { assert.match(h, /\/_next\/static\/\*\s+Cache-Control: public, max-age=31536000, immutable/); });
});

describe('content rules hold in everything a crawler or answer engine reads', () => {
  const corpus = { page: visibleText, llms: read('llms.txt'), full: read('llms-full.txt'), meta: $('meta[name="description"]').attr('content') + ' ' + $('meta[property="og:description"]').attr('content') };
  const negated = /\b(not|no|never|isn['’]t|is not|does not|without)\b[^.]{0,60}$/i;
  for (const word of ['tamper-proof', 'certified', 'signature', 'zero egress', 'guarantee']) {
    it(`"${word}" only ever appears negated`, () => {
      for (const [name, text] of Object.entries(corpus)) {
        for (const m of text.matchAll(new RegExp(word, 'gi'))) {
          const before = text.slice(Math.max(0, m.index - 70), m.index);
          const rest = text.slice(m.index).match(/^[^.?!\n]*([.?!]|\n|$)/)?.[1];
          if (rest === '?') continue; // a question asserts nothing
          if (/[-#]/.test(text[m.index - 1] ?? '')) continue; // part of a URL slug, not prose
          assert.match(before, negated, `${name}: "…${before}${word}"`);
        }
      }
    });
  }
  it('every ecosystem product is marked planned and none is linked', () => {
    assert.equal($('#ecosystem a').length, 0);
    assert.equal(($('#ecosystem').text().match(/PLANNED/g) ?? []).length, 8);
  });
  it('states that samples are demonstration data and the hero is not telemetry', () => {
    assert.ok(visibleText.includes('Not live system telemetry'));
    assert.ok(/demonstration/i.test(visibleText));
  });
});
