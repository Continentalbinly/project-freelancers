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

  // (Optional) — you can also enable strict mode or other Next.js flags here
  reactStrictMode: true,
};

export default nextConfig;
