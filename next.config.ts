import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["yahoo-finance2"],
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
