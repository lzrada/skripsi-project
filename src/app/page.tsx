import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import NavbarUser from "@/components/(user)/Navbar";
import FooterUser from "@/components/(user)/Footer-user";
import { ToastContainer } from "@/components/(user)/ui/Toast";
import HeroBanner from "@/components/(user)/ui/HeroBanner";
import PromoCards from "@/components/(user)/dashboard/PromoCards";
import DashboardProductsClient from "@/components/(user)/dashboard/DashboardProductsClient";

export const metadata: Metadata = {
  title: "Beranda | Rizqi Elektronik",
  description: "Belanja elektronik terpercaya: TV, AC, Kulkas, Mesin Cuci & lebih. Stok real-time, gratis ongkir Blitar.",
};

export default async function Home() {
  const cookieStore = await cookies();
  const role = cookieStore.get("userRole")?.value;

  if (role === "admin") {
    redirect("/admin/dashboard-admin");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavbarUser />

      <main id="main-content" className="flex-1" style={{ paddingTop: "var(--navbar-h, 112px)" }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-8 sm:space-y-10 pb-20 sm:pb-6">
          <HeroBanner />
          <DashboardProductsClient />
          <PromoCards />
        </div>
      </main>

      <FooterUser />
      <ToastContainer />
    </div>
  );
}
