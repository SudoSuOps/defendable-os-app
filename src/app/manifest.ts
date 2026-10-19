import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/seo/site';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} — Proof of Execution`,
    short_name: SITE.name,
    description: SITE.description,
    start_url: '/',
    scope: '/',
    display: 'browser',
    background_color: SITE.themeColor,
    theme_color: SITE.themeColor,
    icons: [
      { src: '/icon.png', sizes: '192x192', type: 'image/png' },
      { src: '/brand/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  };
}
