import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRecycle, faTruckFast, faShield } from "@fortawesome/free-solid-svg-icons";
import HeroBanner from "@/components/ui/HeroBanner";
import CategoryGrid from "@/components/ui/CategoryGrid";
import SearchBar from "@/components/(user)/dashboard/SearchBar";
import ProductSection from "@/components/(user)/dashboard/ProductSection";

const promoCards = [
  {
    title: "Barang Elektronik Berkualitas",
    desc: "Produk original & second terawat dengan harga bersahabat",
    icon: faRecycle,
    color: "from-amber-500 to-orange-600",
  },
  {
    title: "Gratis Ongkir Blitar & Sekitarnya",
    desc: "Pengiriman gratis untuk area Blitar, Tulungagung & Kediri",
    icon: faTruckFast,
    color: "from-emerald-500 to-teal-600",
  },
  {
    title: "Garansi Toko Rizky",
    desc: "Setiap produk dilengkapi garansi resmi dari toko",
    icon: faShield,
    color: "from-[#1E2753] to-[#2d3a8c]",
  },
];

export default function DashboardUser() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 -mt-10 space-y-10">
      <HeroBanner />

      {/* <SearchBar /> */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {promoCards.map((p) => (
          <div key={p.title} className={`bg-gradient-to-br ${p.color} rounded-2xl p-5 flex items-center gap-4`}>
            <FontAwesomeIcon icon={p.icon} className="text-4xl text-black/30 shrink-0" />
            <div>
              <p className="text-white font-bold text-sm">{p.title}</p>
              <p className="text-white/70 text-xs mt-0.5">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <CategoryGrid />

      <ProductSection />
    </div>
  );
}
