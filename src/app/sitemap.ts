import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/seo/site';

export const dynamic = 'force-static';

/** One page. lastmod is the content-updated date, not the build time. Google ignores changefreq and priority, so they are omitted. Section anchors are listed in llms.txt, not here: Google ignores fragments in sitemaps. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${SITE.url}/`, lastModified: SITE.updated, images: [`${SITE.url}${SITE.ogImage}`] }];
}
