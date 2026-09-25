import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com", // or 'images.unsplash.com' depending on the exact URL
      },
    ],
  },
};

export default nextConfig;
