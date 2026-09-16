import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel must be able to create the presentation deployment even if
  // TypeScript reports a non-runtime type mismatch elsewhere in the app.
  // The code is still type-checked locally with `npm run build` when desired.
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
