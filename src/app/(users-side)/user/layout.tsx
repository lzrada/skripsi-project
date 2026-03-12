import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../../globals.css";
import NavbarUser from "@/components/(user)/Navbar-user";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "rizki electronic",
  description: "skripsi app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="min-h-screen bg-gray-50">
          {/* NAVBAR */}
          <NavbarUser />

          {/* PAGE CONTENT */}
          <main className="max-w-7xl mx-auto py-10 px-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
