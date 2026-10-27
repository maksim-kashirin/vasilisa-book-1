import type { NextConfig } from 'next';

const assetPrefix = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '');

const nextConfig: NextConfig = {
  output: 'export',
  assetPrefix: assetPrefix || undefined,
  trailingSlash: true,
};

export default nextConfig;