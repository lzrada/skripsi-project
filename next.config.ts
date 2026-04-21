import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pijppudcydoxcaggmpsy.supabase.co",
      },
    ],
  },
};

export default nextConfig;
