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
npm run build        # static export to ./out
npm run e2e          # builds nothing; serves ./out and drives a real browser (see below)
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
tests/e2e/                     node:test + playwright-core
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

**Mobile performance is the known weak spot.** The cost is main-thread JavaScript (hydrating the interactive sections), not images or layout. Already done: Three.js loads at idle and is tree-shaken (534 KB, not in the initial bundle); the Dial modal with Motion and Zod loads on first use. Next steps if this matters: hydrate below-the-fold demos on visibility, and measure real-user Core Web Vitals after launch.

## Open items

- **Founder profile:** the text supplied with the design was truncated. `FounderSection` shows only what the brief confirmed (name, role, 30 years CRE, focus, location). Confirm the full profile before adding anything.
- **Contact email:** the brief said `build@defedableos.com` and the design corrected it to `build@defendableos.com`. It is set in one place, `CONTACT_EMAIL` in `src/lib/demo/content.ts`. Confirm it.
- **Privacy policy:** the footer says "pending publication". Replace it with a link when the page exists.
- **Dial form:** it composes a `mailto:` draft. Swap in a form endpoint or a scheduling link when one exists.
- **Licence:** no licence file is included; add one deliberately.
- Optional: an example receipt PDF.
