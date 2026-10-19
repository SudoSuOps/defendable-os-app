import type { MetadataRoute } from 'next';
import { AI_RETRIEVAL_CRAWLERS, AI_TRAINING_CRAWLERS, BLOCKED_CRAWLERS, SITE } from '@/lib/seo/site';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  const allowed = [...AI_RETRIEVAL_CRAWLERS, ...AI_TRAINING_CRAWLERS].filter((c) => !BLOCKED_CRAWLERS.includes(c));
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      // Named explicitly so the intent is unambiguous to AI crawlers that look for their own entry.
      ...allowed.map((userAgent) => ({ userAgent, allow: '/' })),
      ...BLOCKED_CRAWLERS.map((userAgent) => ({ userAgent, disallow: '/' })),
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
