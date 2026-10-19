# defendable-os-app

The defendableos.com landing site: one page, eleven sections, built from the Claude Design handoff (`design_handoff_defendableos_landing`).

**Stack:** Next.js 16 (App Router, static export) · React 19 · TypeScript (strict) · Tailwind 4 · Motion · Zod · Three.js (hero engine only, loaded lazily).

Every demo on the page computes in the visitor's browser with deterministic fixtures: the validator lab, the dataset curator, the Flightsheet runner, and the self-hashing receipt. There is no backend and no data fetching.

## Commands

```bash
npm install
npm run dev          # http://localhost:3000
npm run typecheck    # tsc --noEmit
npm test             # vitest unit tests (verification core, curator gating, Flightsheet)
npm run build        # static export to ./out, then scripts/postbuild.mjs writes the CSP with exact script hashes
npm run seo          # audits the built output: head tags, structure, JSON-LD, llms.txt, robots, headers, content rules
npm run e2e          # serves ./out (applying out/_headers) and drives a real browser (see below)
npm run check        # all of the above, in order
```

**e2e** uses `playwright-core` with a locally installed Chromium-family browser (no browser download). It defaults to `/snap/bin/brave`; set `DEFENDABLE_BROWSER=/path/to/chrome` to use another. Run `npm run build` first.

## Layout

```
src/app/                       layout (fonts, metadata, JSON-LD), page, globals.css (design tokens)
src/components/<section>/      one folder per page section; ui/ holds the primitives
src/lib/schemas/               Zod schemas and inferred types
src/lib/provenance/            canonical JSON, SHA-256, receipt hash
src/lib/verification/          oracle.ts, validator.ts, meta.ts
src/lib/demo/                  fixtures: scenarios, Flightsheet, curator pipeline, page copy
src/state/providers.tsx        Flightsheet-to-receipt state and the Dial modal state
tests/unit/                    vitest
tests/seo/                     node:test + cheerio, audits ./out
tests/e2e/                     node:test + playwright-core
src/lib/seo/                   site facts, FAQ (single source), JSON-LD, llms.txt generators
scripts/postbuild.mjs          computes the strict CSP from the inline scripts Next emitted
brand-source/                  full-resolution logo originals (not deployed)
public/brand/                  optimized logos and the 1200x630 OG image
```

## Content rules (from the brief), and where they are enforced

- **No fabricated metrics, customers, certifications, funding or telemetry.** Samples are labelled as demonstration data; the `DEMO_LABELS` flag in `src/app/page.tsx` controls the labels.
- **A SHA-256 hash is never described as a signature.** `tests/unit/demo.test.ts` asserts the receipt never contains the word; the page states plainly that the receipt is not tamper-proof or certified.
- **Ecosystem products are PLANNED with no links** (e2e asserts 8 PLANNED and 0 anchors in that section).
- **The meta-validator uses an independent oracle.** `oracle.ts` and `validator.ts` import nothing from each other, `meta.ts` reaches the validator only through `runValidator` and `PIN`, and the oracle uses no floating point. All three are asserted in `tests/unit/verification.test.ts`.
- **Human approval is shown separately from system classification** (every result is labelled "approval PENDING").
- The Jetson Orin Nano-class edge device is described as **not** running LLMs, and zero egress is never promised.

## SEO and GEO (generative engine optimization)

Everything below is generated from one source so the visible page, the structured data and the machine-readable files cannot drift apart. `npm run seo` fails the build if they do.

| What | Where |
|---|---|
| Title, description, canonical, robots, Open Graph, Twitter cards | `src/app/layout.tsx`, facts in `src/lib/seo/site.ts` |
| Linked JSON-LD graph: Organization, Person, WebSite, WebPage, SoftwareApplication, FAQPage (no ratings, offers or reviews, because none exist) | `src/lib/seo/jsonld.ts` |
| Ten answer-first FAQs, shown on the page, in the FAQPage JSON-LD, and in `llms-full.txt`, from one list | `src/lib/seo/faq.ts`, `src/components/faq/FaqSection.tsx` |
| `/llms.txt` and `/llms-full.txt` (all site content as Markdown) generated at build | `src/lib/seo/llms.ts` |
| `robots.txt` naming the AI search and training crawlers explicitly | `src/app/robots.ts`; opt a crawler out in `src/lib/seo/site.ts` |
| Sitemap with an honest `lastmod` (content-updated date, not build time) | `src/app/sitemap.ts`, bump `SITE.updated` when content changes |
| Web manifest, favicon set, branded noindex 404, `/.well-known/security.txt` (expires 2027-10-01, renew it) | `src/app/`, `public/` |
| HSTS, COOP, nosniff, frame denial and a CSP with no `unsafe-inline` for scripts | `public/_headers` + `scripts/postbuild.mjs` |

The e2e suite runs the browser **under the enforced CSP** and asserts that an injected inline script is blocked.

## Cloudflare settings that sit outside this repo

These affect search and AI visibility and cannot be set from the code:

1. **Redirect `www` to the apex.** `www.defendableos.com` currently serves the same page with a 200. The canonical tag consolidates it, but a 301 Redirect Rule (`www.defendableos.com/*` to `https://defendableos.com/$1`) is the clean fix.
2. **Turn off Email Address Obfuscation** (Scrape Shield). It rewrites `build@defendableos.com` in the HTML into a `cdn-cgi/l/email-protection` link, so crawlers and AI engines cannot read the contact address.
3. **Check AI-crawler settings** (AI Crawl Control, "Block AI bots", managed `robots.txt`). If any is on, it overrides the allow rules in `robots.txt`.
4. **Verify the site** in Google Search Console and Bing Webmaster Tools and submit `https://defendableos.com/sitemap.xml`. Bing also feeds several AI search products.
5. **HSTS** is set for one year without `includeSubDomains` or `preload`. Add those only after every `*.defendableos.com` host serves HTTPS.
6. If Cloudflare Web Analytics is enabled, add `static.cloudflareinsights.com` to `script-src` and `cloudflareinsights.com` to `connect-src` in `scripts/postbuild.mjs`.

## Deploy (Cloudflare Pages)

| Setting | Value |
|---|---|
| Framework preset | None (static export) |
| Build command | `npm run build` |
| Build output directory | `out` |
| Node version | 22 (`NODE_VERSION=22`) |

`public/_headers` sets security headers and long-lived caching for hashed assets. The site needs no environment variables or secrets. **This repository is public: never commit `.env` files, tokens, or anything from the eval repositories (answer keys, dataset rows, model-facing prompts, ledger data).**

## Measured, not claimed

Lighthouse 12.8 against the static export, headless Brave on a small local machine, two runs per profile (2026-10-19). These are lab numbers from one machine, not field data.

| Profile | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| Desktop | 85, 93 | 100 | 100 | 100 | 1.1 to 1.2 s | 160 to 280 ms | 0 |
| Mobile (simulated slow 4G, 4x CPU) | 48, 52 | 100 | 100 | 100 | 5.9 to 6.0 s | 1.5 to 1.8 s | 0 |

**Mobile performance is the known weak spot.** The cost is main-thread JavaScript, not images or layout: the page is only 818 DOM nodes, but React hydration is one 1.3 s task under Lighthouse's 4x CPU slowdown, plus about 330 ms for the 3D scene. The test host benchmarks well above Lighthouse's reference (index 1915), so this is not a slow-machine artifact.

Kept: Three.js loads at idle and is tree-shaken (534 KB, outside the initial bundle); the Dial modal with Motion and Zod loads on first use. Tried and **rejected because the measured change was within noise**: `content-visibility: auto` on sections, and Suspense boundaries for selective hydration. Not tried: hiding or deferring the hero 3D scene until interaction, which would improve the lab number by degrading what visitors see. A real fix is architectural (fewer client components, more server rendering) and should be guided by real-user Core Web Vitals after launch.

## Open items

- **Founder profile:** the text supplied with the design was truncated. `FounderSection` shows only what the brief confirmed (name, role, 30 years CRE, focus, location). Confirm the full profile before adding anything.
- **Contact email:** the brief said `build@defedableos.com` and the design corrected it to `build@defendableos.com`. It is set in one place, `CONTACT_EMAIL` in `src/lib/demo/content.ts`. Confirm it.
- **Privacy policy:** the footer says "pending publication". Replace it with a link when the page exists.
- **Dial form:** it composes a `mailto:` draft. Swap in a form endpoint or a scheduling link when one exists.
- **Licence:** no licence file is included; add one deliberately.
- Optional: an example receipt PDF.
