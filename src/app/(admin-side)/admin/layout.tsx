import type { Metadata } from "next";
import Navbar from "@/components/(admin)/Navbar-admin";

export const metadata: Metadata = {
  title: "Panel Admin — Rizqi Elektronik",
  description: "Halaman manajemen toko Rizqi Elektronik Blitar.",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex-1 overflow-x-hidden">{children}</div>
    </div>
  );
}
