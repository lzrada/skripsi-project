"use client";

import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFire, faTag, faTableCells } from "@fortawesome/free-solid-svg-icons";
import HeroBanner from "@/components/ui/HeroBanner";
import CategoryGrid from "@/components/ui/CategoryGrid";
import ProductCard, { Product } from "@/components/ui/ProductCard";

const products: Product[] = [
  {
    id: "1",
    name: 'Smart TV Samsung 43" 4K UHD',
    price: 4999000,
    originalPrice: 6500000,
    category: "Televisi",
    condition: "baru",
    stock: 5,
    sold: 120,
    rating: 4.8,
    badge: "sale",
  },
  {
    id: "2",
    name: "Kulkas 2 Pintu Sharp 280L",
    price: 3450000,
    category: "Kulkas",
    condition: "baru",
    stock: 8,
    sold: 85,
    rating: 4.7,
    badge: "best",
  },
  {
    id: "3",
    name: "AC Daikin 1 PK Low Watt",
    price: 3850000,
    originalPrice: 4200000,
    category: "AC",
    condition: "baru",
    stock: 3,
    sold: 200,
    rating: 4.9,
    badge: "sale",
  },
  {
    id: "4",
    name: "Mesin Cuci Front Load LG 8kg",
    price: 4200000,
    category: "Mesin Cuci",
    condition: "baru",
    stock: 6,
    sold: 67,
    rating: 4.6,
    badge: "new",
  },
  {
    id: "5",
    name: "Kipas Angin Miyako 16 inci",
    price: 285000,
    category: "Kipas Angin",
    condition: "baru",
    stock: 20,
    sold: 340,
    rating: 4.5,
  },
  {
    id: "6",
    name: 'TV LED Polytron 32" HD',
    price: 2150000,
    originalPrice: 2500000,
    category: "Televisi",
    condition: "bekas",
    stock: 2,
    sold: 45,
    rating: 4.3,
    badge: "sale",
  },
  {
    id: "7",
    name: "Kulkas 1 Pintu Aqua 105L",
    price: 1250000,
    category: "Kulkas",
    condition: "baru",
    stock: 12,
    sold: 156,
    rating: 4.4,
  },
  {
    id: "8",
    name: "Speaker Bluetooth Advance",
    price: 320000,
    originalPrice: 450000,
    category: "Audio",
    condition: "baru",
    stock: 15,
    sold: 220,
    rating: 4.5,
    badge: "sale",
  },
  {
    id: "9",
    name: "AC Panasonic 1/2 PK Standard",
    price: 2950000,
    category: "AC",
    condition: "baru",
    stock: 4,
    sold: 98,
    rating: 4.6,
  },
  {
    id: "10",
    name: "Mesin Cuci Top Load Samsung 7kg",
    price: 2750000,
    category: "Mesin Cuci",
    condition: "bekas",
    stock: 1,
    sold: 33,
    rating: 4.2,
    badge: "limited",
  },
];

const tabs = ["Semua", "Baru", "Second", "Promo"];

export default function DashboardUser() {
  const [activeTab, setActiveTab] = useState("Semua");

  const flashSale = products.filter((p) => p.badge === "sale").slice(0, 4);
  const bestSeller = products.filter((p) => p.sold >= 100).slice(0, 4);

  const filtered = products.filter((p) => {
    if (activeTab === "Baru") return p.condition === "baru";
    if (activeTab === "Second") return p.condition === "bekas";
    if (activeTab === "Promo") return p.badge === "sale";
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      {/* HERO BANNER */}
      <HeroBanner />

      {/* PROMO STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            title: "Barang Second Berkualitas",
            desc: "Harga bersahabat, kondisi terawat",
            emoji: "♻️",
            color: "from-amber-500 to-orange-600",
          },
          {
            title: "Gratis Ongkir Blitar",
            desc: "Pembelian apapun, ongkir GRATIS",
            emoji: "🚚",
            color: "from-emerald-500 to-teal-600",
          },
          {
            title: "Garansi Toko",
            desc: "Setiap produk bergaransi resmi",
            emoji: "🛡️",
            color: "from-[#1E2753] to-[#2d3a8c]",
          },
        ].map((p) => (
          <div key={p.title} className={`bg-linear-to-br ${p.color} rounded-2xl p-5 flex items-center gap-4`}>
            <span className="text-4xl">{p.emoji}</span>
            <div>
              <p className="text-white font-bold text-sm">{p.title}</p>
              <p className="text-white/70 text-xs mt-0.5">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* KATEGORI */}
      <CategoryGrid />

      {/* FLASH SALE */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faFire} className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-bold text-gray-800">Flash Sale</h2>
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">DISKON</span>
          </div>
          <Link href="#" className="text-sm text-[#1E2753] font-semibold hover:underline">
            Lihat Semua
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {flashSale.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* TERLARIS */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faTag} className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-gray-800">Terlaris</h2>
          </div>
          <Link href="#" className="text-sm text-[#1E2753] font-semibold hover:underline">
            Lihat Semua
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {bestSeller.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* BANNER CTA */}
      <div className="bg-linear-to-r from-[#1E2753] to-[#E85D04] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-white font-bold text-lg">Mau jual barang elektronik bekas?</p>
          <p className="text-white/70 text-sm mt-1">Kami terima barang dengan harga terbaik!</p>
        </div>

        <a href="https://wa.me/62" target="_blank" rel="noopener noreferrer" className="bg-white text-[#1E2753] font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-yellow-300 transition-colors whitespace-nowrap">
          Hubungi Kami
        </a>
      </div>

      {/* SEMUA PRODUK */}
      <section id="produk">
        <div className="flex items-center gap-2 mb-4">
          <FontAwesomeIcon icon={faTableCells} className="w-5 h-5 text-[#1E2753]" />
          <h2 className="text-lg font-bold text-gray-800">Semua Produk</h2>
        </div>

        {/* Filter tab */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                activeTab === tab ? "bg-[#1E2753] text-white border-[#1E2753]" : "bg-white text-gray-600 border-gray-200 hover:border-[#1E2753] hover:text-[#1E2753]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📦</p>
            <p className="font-medium">Tidak ada produk ditemukan</p>
          </div>
        )}

        {/* Load more */}
        <div className="flex justify-center mt-8">
          <button className="px-8 py-2.5 border-2 border-[#1E2753] text-[#1E2753] rounded-xl font-semibold text-sm hover:bg-[#1E2753] hover:text-white transition-all duration-200">Muat Lebih Banyak</button>
        </div>
      </section>
    </div>
  );
}
