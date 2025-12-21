import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript errors during builds
    ignoreBuildErrors: true,
  },

  // (Optional) — you can also enable strict mode or other Next.js flags here
  reactStrictMode: true,
};

export default nextConfig;
