import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono, Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { SITE } from '@/lib/seo/site';
import { Providers } from '@/state/providers';

const space = Space_Grotesk({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-space', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-inter', display: 'swap' });
const plex = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-plex', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: SITE.title,
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.founder, url: SITE.url }],
  creator: SITE.org,
  publisher: SITE.org,
  category: 'technology',
  alternates: { canonical: `${SITE.url}/` },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  openGraph: {
    title: `${SITE.name} — ${SITE.tagline}`,
    description: 'Sovereign AI verification infrastructure. Evidence → Execution → Verification → Verdict → Receipt.',
    url: SITE.url,
    siteName: SITE.name,
    locale: 'en_US',
    type: 'website',
    images: [{ url: SITE.ogImage, width: 1200, height: 630, alt: 'Defendable shield and wordmark' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: SITE.xHandle,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: [{ url: SITE.ogImage, alt: 'Defendable shield and wordmark' }],
  },
  formatDetection: { email: false, address: false, telephone: false },
};

export const viewport: Viewport = { themeColor: SITE.themeColor, width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${space.variable} ${inter.variable} ${plex.variable}`}>
      <body>
        {/* Cloudflare's Email Address Obfuscation mistakes strings like dv-validator@1.4.0 for emails and rewrites visible text.
            These markers exclude the page from it (raw comments, because React cannot render comment nodes). */}
        <span hidden dangerouslySetInnerHTML={{ __html: '<!--email_off-->' }} />
        <Providers>{children}</Providers>
        <span hidden dangerouslySetInnerHTML={{ __html: '<!--/email_off-->' }} />
      </body>
    </html>
  );
}
