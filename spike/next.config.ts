import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only the Docker build is standalone; the Vercel build keeps the default (architecture §2.1).
  output: process.env.NEXT_OUTPUT === 'standalone' ? 'standalone' : undefined,
  cacheComponents: true,
  partialPrefetching: true,
  images: { unoptimized: true },
};

export default nextConfig;
