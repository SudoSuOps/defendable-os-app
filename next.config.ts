import type { NextConfig } from 'next';

// Static export: the site has no server runtime. Cloudflare Pages serves ./out.
const config: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: false,
  reactStrictMode: true,
};

export default config;
