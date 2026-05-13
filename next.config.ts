import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  compress: true,

  images: {
    formats: ["image/avif", "image/webp"],

    minimumCacheTTL: 60 * 60 * 24 * 7,

    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    remotePatterns: [
      {
        protocol: "https",
        hostname: "pijppudcydoxcaggmpsy.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
      {
        protocol: "https",
        hostname: "www.gravatar.com",
      },
    ],
  },

  async headers() {
    const isProd = process.env.NODE_ENV === "production";

    const scriptSrc = isProd
      ? [
          "script-src 'self' 'unsafe-inline'",
          "https://app.sandbox.midtrans.com",
          "https://api.midtrans.com",
          // Firebase Auth popup membutuhkan script dari Google
          "https://apis.google.com",
          "https://accounts.google.com",
        ].join(" ")
      : ["script-src 'self' 'unsafe-inline' 'unsafe-eval'", "https://app.sandbox.midtrans.com", "https://api.midtrans.com", "https://apis.google.com", "https://accounts.google.com"].join(" ");

    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              scriptSrc,
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https://*.supabase.co https://*.googleusercontent.com https://ui-avatars.com https://www.gravatar.com https://lh3.googleusercontent.com",
              // connect-src: tambah semua endpoint Firebase Auth + Google OAuth
              [
                "connect-src 'self'",
                "https://*.firebaseio.com",
                "https://*.googleapis.com",
                "https://securetoken.googleapis.com",
                "https://identitytoolkit.googleapis.com",
                "https://oauth2.googleapis.com",
                "https://*.supabase.co",
                "https://api.midtrans.com",
                "https://app.sandbox.midtrans.com",
                "wss://*.firebaseio.com",
              ].join(" "),
              // frame-src: tambah Google OAuth untuk popup
              "frame-src https://app.sandbox.midtrans.com https://api.midtrans.com https://accounts.google.com",
              // form-action: izinkan submit ke Google OAuth
              "form-action 'self' https://accounts.google.com",
            ].join("; "),
          },
        ],
      },

      {
        source: "/images/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
