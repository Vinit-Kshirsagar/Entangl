import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['images.unsplash.com', 'api.dicebear.com'],
  },
  // Optimize for production builds
  typescript: {
    ignoreBuildErrors: false,
  },
  // Add experimental features for better performance
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;