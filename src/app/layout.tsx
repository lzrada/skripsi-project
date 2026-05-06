// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";

// ── Font: Pakai Inter — lebih ringan & cocok untuk e-commerce Indonesia ──────
// Geist Mono tidak diperlukan untuk UI toko, hapus untuk mengurangi beban font
const inter = Inter({
  subsets: ["latin"],
  display: "swap", // Teks langsung muncul pakai font fallback, ganti saat Inter ready
  variable: "--font-inter",
  preload: true,
});

// ── SEO Metadata Lengkap ─────────────────────────────────────────────────────
// Sesuai skripsi: nama toko Rizky Elektronik, lokasi Blitar, produk elektronik
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"),
  title: {
    default: "Rizky Elektronik — Toko Elektronik Terpercaya Blitar",
    template: "%s | Rizky Elektronik",
  },
  description: "Toko elektronik online terpercaya di Blitar. Jual beli TV, AC, Kulkas, Mesin Cuci, dan elektronik lainnya. Stok real-time, pembayaran aman via Midtrans.",
  keywords: ["toko elektronik blitar", "beli elektronik online", "TV second blitar", "AC murah blitar", "kulkas second", "mesin cuci blitar", "rizky elektronik", "elektronik tulungagung", "elektronik kediri"],
  authors: [{ name: "Rizky Elektronik" }],
  creator: "Rizky Elektronik",
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Rizky Elektronik",
    title: "Rizky Elektronik — Toko Elektronik Terpercaya Blitar",
    description: "Belanja elektronik online terpercaya. TV, AC, Kulkas, Mesin Cuci — stok real-time & pembayaran aman.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// ── Viewport ─────────────────────────────────────────────────────────────────
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1E2753",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://pijppudcydoxcaggmpsy.supabase.co" />
        <link rel="preconnect" href="https://firestore.googleapis.com" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <div className="flex min-h-screen bg-gray-50">
          <div className="flex-1 overflow-x-hidden">{children}</div>
        </div>

        <Script src={process.env.NODE_ENV === "production" ? "https://app.midtrans.com/snap/snap.js" : "https://app.sandbox.midtrans.com/snap/snap.js"} data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY} strategy="lazyOnload" />
      </body>
    </html>
  );
}
