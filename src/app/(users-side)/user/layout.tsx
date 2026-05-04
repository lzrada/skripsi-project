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
    <div className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-gray-50 flex flex-col relative`}>
      {/* Navbar */}
      <NavbarUser />

      {/* Konten halaman */}
      <main id="main-content" className="flex-1 mt-24 md:mt-28 px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      <FooterUser />

      <ToastContainer />

      <WhatsAppButton />
    </div>
  );
}
