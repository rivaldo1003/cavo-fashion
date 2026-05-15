import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["localhost:3000", "*.ngrok-free.app", "*.vercel.app"],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.ngrok-free.app",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "192.168.*",
      },
      // 👇 TAMBAHKAN INI untuk production
      {
        protocol: "https",
        hostname: "cavoofficial.id",
      },
      {
        protocol: "https",
        hostname: "cavo-fashion.vercel.app",
      },
      {
        protocol: "https",
        hostname: "*.vercel.app",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/uploads/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
