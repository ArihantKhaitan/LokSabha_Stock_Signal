/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["yahoo-finance2"],
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
