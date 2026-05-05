import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../../globals.css";
import NavbarUser from "@/components/(user)/Navbar-user";
import FooterUser from "@/components/(user)/Footer-user";
import { ToastContainer } from "@/components/ui/Toast";
import WhatsAppButton from "@/components/ui/WhatsAppButton";

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
    <div className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-gray-50 flex flex-col`}>
      {/* Navbar fixed — tinggi ~104px (topbar 32px + main 64px + category 40px) */}
      <NavbarUser />

      {/*
        Spacer untuk konten agar tidak tertutup navbar fixed.
        - Mobile (tidak ada topbar login): 64px navbar + 40px category = 104px
        - Desktop dengan topbar login: 32px + 64px + 40px = 136px
        Pakai pt yang cukup aman untuk semua kondisi.
      */}
      <main id="main-content" className="flex-1 pt-[140px] px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      <FooterUser />
      <ToastContainer />
      <WhatsAppButton />
    </div>
  );
}
