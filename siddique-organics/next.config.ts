import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    // Smaller files than JPEG/PNG for the big product + banner photos.
    formats: ["image/avif", "image/webp"],
    // Optimised images are cached for 30 days instead of the 60s default.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
