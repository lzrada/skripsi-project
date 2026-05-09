import type { Metadata } from "next";
import HeroBanner from "@/components/(user)/ui/HeroBanner";
import PromoCards from "@/components/(user)/dashboard/PromoCards";
import DashboardProductsClient from "@/components/(user)/dashboard/DashboardProductsClient";

export const metadata: Metadata = {
  title: "Beranda | Rizky Elektronik",
  description: "Belanja elektronik terpercaya: TV, AC, Kulkas, Mesin Cuci & lebih. Stok real-time, gratis ongkir Blitar.",
};

export default function DashboardUser() {
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 -mt-10 space-y-8 sm:space-y-10 pb-20 sm:pb-6">
      <HeroBanner />
      <PromoCards />
      <DashboardProductsClient />
    </div>
  );
}
