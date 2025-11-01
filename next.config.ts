import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ✅ Ignore ESLint errors and warnings during production build
    ignoreDuringBuilds: true,
  },

  // (Optional) — you can also enable strict mode or other Next.js flags here
  reactStrictMode: true,
};

export default nextConfig;
