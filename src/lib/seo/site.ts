/** Canonical facts about the site, used by metadata, JSON-LD, robots, sitemap, manifest and llms.txt. One place, so they cannot disagree. */
export const SITE = {
  url: 'https://defendableos.com',
  name: 'DefendableOS',
  org: 'Swarm & Bee AI',
  founder: 'Donovan Mackey',
  founderTitle: 'Founder & Builder',
  title: 'DefendableOS — Proof of Execution for Agentic AI',
  description: 'DefendableOS is sovereign AI verification infrastructure: exact checks, an independent oracle, human approval, and a hash receipt that proves what your AI did.',
  tagline: 'AI makes the claim. Defendable demands the proof.',
  locality: 'Jupiter',
  region: 'FL',
  country: 'US',
  x: 'https://x.com/defendableos',
  xHandle: '@defendableos',
  ogImage: '/brand/og-image.png',
  logo: '/brand/defendable-shield.png',
  themeColor: '#07090B',
  /** Bump when the page content genuinely changes: it feeds sitemap lastmod, llms-full.txt and security.txt expectations. */
  updated: '2026-10-19',
} as const;

/** Absolute URL for a site path. */
export const abs = (path = '/') => new URL(path, SITE.url).toString();

/**
 * Crawler policy. The goal is to be findable and citable by search engines and AI answer engines, so all are allowed.
 * To opt a crawler out, move it to BLOCKED_CRAWLERS. Search/retrieval bots and training bots are listed separately on purpose.
 */
export const AI_RETRIEVAL_CRAWLERS = ['OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User'];
export const AI_TRAINING_CRAWLERS = ['GPTBot', 'ClaudeBot', 'Google-Extended', 'Applebot-Extended', 'CCBot'];
export const BLOCKED_CRAWLERS: string[] = [];
