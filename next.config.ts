import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "image.tmdb.org",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",       // YouTube thumbnails
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",   // YouTube thumbnails (alternative)
      },
      {
        protocol: "https",
        hostname: "**.vk.com",         // VK rasmlar
      },
      {
        protocol: "https",
        hostname: "**.vkvideo.ru",      // VK Video rasmlar
      },
      {
        protocol: "https",
        hostname: "**.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "**",                // Boshqa barcha https manzillar
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default nextConfig;
