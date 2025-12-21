import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ✅ Enable ESLint during builds (fix errors first)
    ignoreDuringBuilds: false,
  },

  // (Optional) — you can also enable strict mode or other Next.js flags here
  reactStrictMode: true,
};

export default nextConfig;
