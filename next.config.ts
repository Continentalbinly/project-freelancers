import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Enable ESLint during builds
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Enable TypeScript errors during builds
    ignoreBuildErrors: false,
  },

  // Configure external image domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.qrserver.com',
        pathname: '/v1/create-qr-code/**',
      },
    ],
  },

  // (Optional) — you can also enable strict mode or other Next.js flags here
  reactStrictMode: true,
};

export default nextConfig;
