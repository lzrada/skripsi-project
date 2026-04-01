import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../../globals.css";
import NavbarUser from "@/components/(user)/Navbar-user";
import FooterUser from "@/components/(user)/Footer-user";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rizky Elektronik",
  description: "Toko Elektronik Terpercaya di Blitar",
};

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          {/* Navbar */}
          <NavbarUser />

          {/* Konten halaman */}
          <main className="flex-1">{children}</main>

          {/* Footer */}
          <FooterUser />
        </div>
      </body>
    </html>
  );
}
