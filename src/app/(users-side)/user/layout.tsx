import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../../globals.css";
import NavbarUser from "@/components/(user)/Navbar";
import FooterUser from "@/components/(user)/Footer-user";
import { ToastContainer } from "@/components/(user)/ui/Toast";
import WhatsAppButton from "@/components/(user)/ui/WhatsAppButton";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rizky Elektronik",
  description: "Toko Elektronik Terpercaya di Blitar",
};

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-gray-50 flex flex-col`}>
      <NavbarUser />

      <main id="main-content" className="flex-1 pt-35 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      <FooterUser />
      <ToastContainer />
      <WhatsAppButton />
    </div>
  );
}
