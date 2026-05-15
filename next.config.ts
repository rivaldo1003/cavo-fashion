import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Izinkan akses dari berbagai origin (untuk ngrok & IP lokal)
  allowedDevOrigins: ["localhost:3000", "*.ngrok-free.app", "*.vercel.app"],

  // Konfigurasi image untuk remote patterns
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
    ],
  },
};

export default nextConfig;
