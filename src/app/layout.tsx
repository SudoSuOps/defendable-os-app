import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono, Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Providers } from '@/state/providers';

const space = Space_Grotesk({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-space', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-inter', display: 'swap' });
const plex = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-plex', display: 'swap' });

const SITE = 'https://defendableos.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: 'DefendableOS — Proof of Execution for Agentic AI',
  description: 'DefendableOS turns agent execution, proprietary datasets, mathematical verification, and human oversight into portable proof.',
  openGraph: {
    title: 'DefendableOS — AI makes the claim. Defendable demands the proof.',
    description: 'Sovereign AI verification infrastructure. Evidence → Execution → Verification → Verdict → Receipt.',
    url: SITE,
    siteName: 'DefendableOS',
    images: [{ url: '/brand/og-image.png', width: 1200, height: 630, alt: 'Defendable' }],
    type: 'website',
  },
  twitter: { card: 'summary_large_image', images: ['/brand/og-image.png'] },
};

export const viewport: Viewport = { themeColor: '#07090B', width: 'device-width', initialScale: 1 };

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'DefendableOS',
  applicationCategory: 'BusinessApplication',
  url: SITE,
  publisher: { '@type': 'Organization', name: 'Swarm & Bee AI', founder: { '@type': 'Person', name: 'Donovan Mackey' } },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${space.variable} ${inter.variable} ${plex.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
