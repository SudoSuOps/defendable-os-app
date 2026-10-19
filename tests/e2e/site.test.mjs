import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { launch, serve } from './launch.mjs';

let srv, env;
const canon = (v) => (v === null || typeof v !== 'object' ? JSON.stringify(v) : Array.isArray(v) ? '[' + v.map(canon).join(',') + ']' : '{' + Object.keys(v).filter((k) => v[k] !== undefined).sort().map((k) => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}');
const sha = (s) => createHash('sha256').update(s).digest('hex');

before(async () => {
  srv = await serve('out');
  env = await launch();
  await env.page.goto(srv.base, { waitUntil: 'networkidle' });
});
after(async () => {
  await env?.browser.close();
  await srv?.close();
});

const sec = (id) => env.page.locator(`#${id}`);

describe('page', () => {
  it('loads with no console or page errors', async () => {
    assert.deepEqual(env.errors, []);
  });
  it('has all eleven sections, a skip link, and the founder and contact copy', async () => {
    for (const id of ['top', 'problem', 'engine', 'curator', 'validator', 'flightsheet', 'receipt', 'edge', 'ecosystem', 'founder', 'cta', 'contact']) {
      assert.equal(await sec(id).count(), 1, `#${id}`);
    }
    assert.equal(await env.page.locator('a[href="#main"]').count(), 1);
    assert.match(await sec('founder').innerText(), /Donovan Mackey/);
  });
  it('renders the 3D engine canvas, or the plain-list fallback', async () => {
    await env.page.waitForTimeout(800);
    const canvas = await sec('top').locator('canvas').count();
    const list = await sec('top').getByText('01 INGEST').count();
    assert.ok(canvas === 1 || list >= 1, `canvas=${canvas} list=${list}`);
  });
  it('labels the hero sequence as a demonstration, not telemetry', async () => {
    assert.match(await sec('top').innerText(), /Not live system telemetry/);
  });
  it('shows every ecosystem product as PLANNED with no links', async () => {
    const eco = sec('ecosystem');
    assert.equal(await eco.getByText('PLANNED', { exact: true }).count(), 8);
    assert.equal(await eco.locator('a').count(), 0);
  });
});

describe('problem', () => {
  it('switches to the Defendable view and shows the failing DSCR row', async () => {
    await env.page.getByRole('tab', { name: 'Defendable execution' }).click();
    const t = await sec('problem').innerText();
    assert.match(t, /2\.07 ≠ 2\.30/);
    assert.match(t, /REVIEW REQUIRED/);
  });
});

describe('engine', () => {
  it('Engineer view shows code for the selected stage', async () => {
    await env.page.getByRole('button', { name: /08.*Proof Receipt/is }).click();
    await env.page.getByRole('tab', { name: 'Engineer View' }).click();
    assert.match(await sec('engine').locator('pre').innerText(), /receipt_hash = sha256\(canon\(body\)\)/);
  });
});

describe('curator', () => {
  const adv = () => sec('curator').getByRole('button', { name: /^Advance to|Pipeline complete/ });
  it('corrupted source halts the pipeline at VALIDATE and cannot advance', async () => {
    await sec('curator').getByRole('checkbox').check();
    for (let i = 0; i < 6; i++) await adv().click();
    assert.match(await sec('curator').getByRole('alert').innerText(), /halted at VALIDATE/);
    assert.equal(await adv().isDisabled(), true);
    assert.match(await sec('curator').innerText(), /area_sqft: integer > 0\s*FAIL/);
  });
  it('a clean record reaches APPROVE, blocks until a reviewer approves, then exports', async () => {
    await sec('curator').getByRole('checkbox').uncheck();
    await sec('curator').getByRole('button', { name: 'Reset' }).click();
    for (let i = 0; i < 8; i++) await adv().click();
    assert.match(await sec('curator').innerText(), /STEP 09 \/ 10 · APPROVE/);
    assert.equal(await adv().isDisabled(), true);
    await sec('curator').getByRole('button', { name: /Record reviewer approval/ }).click();
    await adv().click();
    assert.match(await sec('curator').innerText(), /STEP 10 \/ 10 · EXPORT/);
    assert.equal(await adv().isDisabled(), true);
    assert.match(await sec('curator').locator('pre').innerText(), /"status": "APPROVED"/);
  });
  it('shows a 64-hex content hash that changes as the record grows', async () => {
    const h = async () => (await sec('curator').getByText(/^content_sha256/).innerText()).replace('content_sha256', '').trim();
    await sec('curator').getByRole('button', { name: 'Reset' }).click();
    const a = await h();
    await adv().click();
    await env.page.waitForTimeout(100);
    const b = await h();
    assert.match(a, /^[0-9a-f]{64}$/);
    assert.notEqual(a, b);
  });
  it('lineage nodes are selectable by button', async () => {
    await sec('curator').getByRole('button', { name: 'CALC-RENT-0042', exact: true }).click();
    assert.match(await sec('curator').innerText(), /598500 \(exact\)/);
  });
});

describe('validator lab', () => {
  const expected = { A: 'PASS', B: 'FAIL', C: 'INSUFFICIENT EVIDENCE', D: 'REVIEW REQUIRED', E: 'VALIDATOR FAILURE' };
  const final = async () => (await sec('validator').locator('li', { hasText: 'FINAL TECHNICAL CLASSIFICATION' }).locator('div.text-\\[15px\\]').first().innerText()).trim();
  const hash = async () => (await sec('validator').getByText(/^result_sha256/).innerText()).replace('result_sha256', '').trim();
  for (const [key, want] of Object.entries(expected)) {
    it(`scenario ${key} ends as ${want}`, async () => {
      await sec('validator').getByRole('radio', { name: new RegExp(`SCENARIO ${key}`) }).click();
      await env.page.waitForTimeout(2800); // 6 rows x 380ms
      assert.equal(await final(), want);
      assert.match(await hash(), /^[0-9a-f]{64}$/);
    });
  }
  it('scenario E shows the false-approval alert and a mismatched K2 canary', async () => {
    await sec('validator').getByRole('radio', { name: /SCENARIO E/ }).click();
    await env.page.waitForTimeout(2800);
    assert.match(await sec('validator').getByRole('alert').innerText(), /FALSE APPROVAL DETECTED/);
    assert.match(await sec('validator').innerText(), /K2 · known incorrect[\s\S]*returned PASS/);
  });
  it('Run again reproduces the identical result hash (determinism)', async () => {
    const a = await hash();
    await sec('validator').getByRole('button', { name: 'Run again' }).click();
    await env.page.waitForTimeout(2800);
    assert.equal(await hash(), a);
  });
  it('scenario D reports the record hash mismatch', async () => {
    await sec('validator').getByRole('radio', { name: /SCENARIO D/ }).click();
    await env.page.waitForTimeout(2800);
    assert.match(await sec('validator').innerText(), /Record integrity: stored sha256 [0-9a-f]{16}… vs recomputed [0-9a-f]{16}… → MISMATCH/);
  });
});

describe('flightsheet to receipt', () => {
  const dscr = () => sec('flightsheet').getByLabel('Claimed DSCR in the memo');
  const outcome = async () => (await sec('flightsheet').getByText(/^SYSTEM OUTCOME/).locator('xpath=following-sibling::span').innerText()).trim();
  const rhash = async () => (await sec('receipt').locator('div.break-all.text-gold2').innerText()).trim();

  it('2.07 passes all three tests', async () => {
    await dscr().fill('2.07');
    await env.page.waitForTimeout(300);
    assert.equal(await outcome(), 'PASS');
  });
  it('2.30 fails T-DSCR-01 and the receipt outcome and hash follow', async () => {
    await dscr().fill('2.07');
    await env.page.waitForTimeout(300);
    const before = await rhash();
    await dscr().fill('2.30');
    await env.page.waitForTimeout(300);
    assert.equal(await outcome(), 'FAIL');
    assert.match(await sec('flightsheet').innerText(), /T-DSCR-01[\s\S]*oracle rejects[\s\S]*FAIL/);
    assert.match(await sec('receipt').innerText(), /OUTCOME\s*FAIL/);
    assert.notEqual(await rhash(), before);
  });
  it('2.1 passes at one decimal place', async () => {
    await dscr().fill('2.1');
    await env.page.waitForTimeout(300);
    assert.equal(await outcome(), 'PASS');
  });
  it('non-numeric input is INVALID INPUT', async () => {
    await dscr().fill('abc');
    await env.page.waitForTimeout(300);
    assert.match(await sec('flightsheet').innerText(), /INVALID INPUT/);
    assert.equal(await outcome(), 'FAIL');
  });
  it('Readable and JSON views both show the Flightsheet', async () => {
    assert.match(await sec('flightsheet').innerText(), /AUTHORIZED APPROVER/);
    await sec('flightsheet').getByRole('tab', { name: 'JSON' }).click();
    assert.match(await sec('flightsheet').locator('pre').innerText(), /"task_id": "FS-DEMO-0007"/);
  });
  it('recompute says MATCH, tampering says MISMATCH, restoring says MATCH', async () => {
    await dscr().fill('2.07');
    await env.page.waitForTimeout(300);
    const r = sec('receipt');
    await r.getByRole('button', { name: 'Recompute hash' }).click();
    assert.match(await r.getByRole('status').innerText(), /^MATCH/);
    await r.getByRole('button', { name: 'Edit outcome field' }).click();
    assert.match(await r.innerText(), /OUTCOME\s*FAIL/);
    await r.getByRole('button', { name: 'Recompute hash' }).click();
    assert.match(await r.getByRole('status').innerText(), /^MISMATCH/);
    await r.getByRole('button', { name: 'Restore original field' }).click();
    await r.getByRole('button', { name: 'Recompute hash' }).click();
    assert.match(await r.getByRole('status').innerText(), /^MATCH/);
  });
  it('the downloaded receipt.json recomputes under an independent implementation', async () => {
    // Brave is snap-confined and cannot write into Playwright's temp dir, so capture the Blob handed to the download in-page.
    await env.page.evaluate(() => {
      const orig = URL.createObjectURL.bind(URL);
      window.__blobs = [];
      URL.createObjectURL = (b) => (window.__blobs.push(b), orig(b));
    });
    const [dl] = await Promise.all([env.page.waitForEvent('download'), sec('receipt').getByRole('button', { name: 'Download receipt.json' }).click()]);
    assert.equal(dl.suggestedFilename(), 'defendable-receipt-RUN-DEMO-20261019-0007.json');
    const text = await env.page.evaluate(() => window.__blobs.at(-1).text());
    const doc = JSON.parse(text);
    const { receipt_hash, ...body } = doc;
    assert.equal(sha(canon(body)), receipt_hash);
    assert.equal(doc.demonstration, true);
    assert.equal(doc.human_approval.status, 'PENDING');
    assert.equal(doc.tests.length, 3);
  });
});

describe('Make the Dial modal', () => {
  it('opens from the nav, validates, composes a request, and closes on Escape with focus restored', async () => {
    const open = env.page.getByRole('banner').getByRole('button', { name: 'Make the Dial' });
    await open.click();
    const dlg = env.page.getByRole('dialog');
    await dlg.waitFor(); // first open fetches the lazily loaded modal chunk
    assert.equal(await dlg.count(), 1);
    await dlg.getByRole('button', { name: 'Compose email' }).click();
    assert.match(await dlg.getByRole('alert').innerText(), /Enter your name and a valid email/);
    await dlg.getByLabel('Name').fill('Test Person');
    await dlg.getByLabel('Work email').fill('not-an-email');
    await dlg.getByRole('button', { name: 'Compose email' }).click();
    assert.match(await dlg.getByRole('alert').innerText(), /valid email/);
    await dlg.getByLabel('Work email').fill('test@example.com');
    await dlg.getByRole('radio', { name: /Technical Walkthrough/ }).click();
    await env.page.evaluate(() => {
      document.addEventListener('click', (e) => {
        const a = e.target instanceof Element ? e.target.closest('a[href^="mailto:"]') : null;
        if (a) { e.preventDefault(); window.__mailto = a.getAttribute('href'); }
      }, true);
    });
    await dlg.getByRole('button', { name: 'Compose email' }).click();
    const mail = new URL(await env.page.evaluate(() => window.__mailto));
    assert.equal(mail.protocol, 'mailto:');
    assert.equal(decodeURIComponent(mail.pathname), 'build@defendableos.com');
    assert.equal(mail.searchParams.get('subject'), 'Make the Dial: Technical Walkthrough');
    assert.match(mail.searchParams.get('body'), /Name: Test Person\nEmail: test@example\.com\nOrganization: -/);
    const txt = await dlg.innerText();
    assert.match(txt, /EMAIL DRAFT OPENED/);
    assert.match(txt, /"type": "Technical Walkthrough"/);
    assert.equal(await env.page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]')), true, 'focus left the dialog after composing');
    for (let i = 0; i < 6; i++) await env.page.keyboard.press('Tab');
    assert.equal(await env.page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]')), true, 'Tab escaped the dialog');
    await env.page.keyboard.press('Escape');
    await env.page.waitForTimeout(400);
    assert.equal(await env.page.getByRole('dialog').count(), 0);
    assert.equal(await env.page.evaluate(() => document.activeElement?.textContent?.trim()), 'Make the Dial');
  });
  it('traps Tab inside the dialog', async () => {
    await env.page.getByRole('banner').getByRole('button', { name: 'Make the Dial' }).click();
    await env.page.getByRole('dialog').waitFor();
    for (let i = 0; i < 14; i++) await env.page.keyboard.press('Tab');
    assert.equal(await env.page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]')), true);
    await env.page.keyboard.press('Escape');
  });
});

describe('phone width', () => {
  it('has no horizontal page scroll at 390px and keeps section navigation reachable', async () => {
    const m = await launch({ width: 390, height: 844 });
    const srv2 = await serve('out');
    try {
      await m.page.goto(srv2.base, { waitUntil: 'networkidle' });
      const w = await m.page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
      assert.ok(w.sw <= w.cw, `scrollWidth ${w.sw} > ${w.cw}`);
      const link = m.page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'ENGINE' });
      assert.ok((await link.boundingBox()).width > 30);
      assert.deepEqual(m.errors, []);
    } finally {
      await m.browser.close();
      await srv2.close();
    }
  });
});

describe('reduced motion', () => {
  it('shows every lab row immediately and stops the hero auto-advance', async () => {
    const m = await launch({ reducedMotion: 'reduce' });
    const srv2 = await serve('out');
    try {
      await m.page.goto(srv2.base, { waitUntil: 'networkidle' });
      await m.page.locator('#validator').getByRole('radio', { name: /SCENARIO B/ }).click();
      await m.page.waitForTimeout(250);
      const ops = await m.page.locator('#validator ol[aria-live] > li').evaluateAll((els) => els.map((e) => getComputedStyle(e).opacity));
      assert.equal(ops.length, 6);
      assert.ok(ops.every((o) => o === '1'), ops.join(','));
      const s1 = await m.page.locator('#top [aria-live="polite"]').innerText();
      await m.page.waitForTimeout(3200);
      assert.equal(await m.page.locator('#top [aria-live="polite"]').innerText(), s1);
    } finally {
      await m.browser.close();
      await srv2.close();
    }
  });
});

describe('section navigation (scrollspy)', () => {
  const link = (name) => env.page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name });
  it('marks the section under the reading line with aria-current and clears it on the hero', async () => {
    await env.page.evaluate(() => document.getElementById('validator').scrollIntoView({ behavior: 'instant' }));
    await env.page.waitForTimeout(500);
    assert.equal(await link('VALIDATOR').getAttribute('aria-current'), 'location');
    assert.equal(await link('ENGINE').getAttribute('aria-current'), null);
    await env.page.evaluate(() => document.getElementById('receipt').scrollIntoView({ behavior: 'instant' }));
    await env.page.waitForTimeout(500);
    assert.equal(await link('RECEIPT').getAttribute('aria-current'), 'location');
    await env.page.evaluate(() => window.scrollTo(0, 0));
    await env.page.waitForTimeout(500);
    assert.equal(await env.page.locator('nav[aria-label="Primary"] a[aria-current]').count(), 0);
  });
  it('clicking a nav link lands on that section', async () => {
    await link('FLIGHTSHEET').click();
    // smooth scrolling: wait until the section stops moving
    let prev = null;
    for (let i = 0; i < 40; i++) {
      await env.page.waitForTimeout(150);
      const t = await env.page.evaluate(() => Math.round(document.getElementById('flightsheet').getBoundingClientRect().top));
      if (t === prev) break;
      prev = t;
    }
    const top = prev;
    assert.ok(top >= -2 && top <= 90, `section top at ${top}px`);
  });
});

describe('FAQ', () => {
  it('opens the first answer by default and toggles others, all answers present in the DOM', async () => {
    const items = env.page.locator('#faq details');
    assert.equal(await items.count(), 10);
    assert.equal(await items.nth(0).getAttribute('open'), '');
    assert.equal(await items.nth(1).getAttribute('open'), null);
    await items.nth(1).locator('summary').click();
    assert.equal(await items.nth(1).getAttribute('open'), '');
    assert.match(await items.nth(1).innerText(), /REVIEW REQUIRED/);
    // a closed answer is still in the DOM text, so crawlers and screen-reader search see it
    assert.match(await env.page.locator('#faq').evaluate((e) => e.textContent), /not a cryptographic signature/);
  });
});

describe('copy receipt hash', () => {
  it('copies the exact receipt hash and confirms it', async () => {
    const m = await launch();
    const s = await serve('out');
    try {
      await m.ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: s.base });
      await m.page.goto(s.base, { waitUntil: 'networkidle' });
      const hash = (await m.page.locator('#receipt').getByText('RECEIPT_HASH · SHA-256').locator('xpath=ancestor::div[2]').locator('div.break-all').innerText()).trim();
      await m.page.locator('#receipt').getByRole('button', { name: 'Copy hash' }).click();
      assert.match(await m.page.locator('#receipt').getByText('Copied').innerText(), /Copied/);
      assert.equal(await m.page.evaluate(() => navigator.clipboard.readText()), hash);
    } finally {
      await m.browser.close();
      await s.close();
    }
  });
});

describe('Content-Security-Policy is enforced, not just declared', () => {
  it('blocks an injected inline script, and the policy forbids unsafe-inline for scripts', async () => {
    const m = await launch();
    const s = await serve('out');
    try {
      m.page.on('console', () => {});
      const violations = [];
      m.page.on('console', (msg) => msg.text().includes('Content Security Policy') && violations.push(msg.text()));
      await m.page.goto(s.base, { waitUntil: 'networkidle' });
      const ran = await m.page.evaluate(() => {
        const el = document.createElement('script');
        el.textContent = 'window.__injected = true';
        document.head.appendChild(el);
        return window.__injected === true;
      });
      assert.equal(ran, false, 'injected inline script executed: CSP is not blocking it');
      await m.page.waitForTimeout(200);
      assert.ok(violations.some((v) => /inline script/i.test(v)), `no CSP violation reported: ${violations.join(' | ')}`);
    } finally {
      await m.browser.close();
      await s.close();
    }
  });
});
