import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: { unoptimized: true },
  outputFileTracingIncludes: {
    '/api/spike/db': ['./fixtures/**/*'],
  },
};

export default nextConfig;
