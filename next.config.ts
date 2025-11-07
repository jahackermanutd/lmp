import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Suppress middleware deprecation warning for auth middleware
    // Authentication middleware is still a valid use case
  },
};

export default nextConfig;
