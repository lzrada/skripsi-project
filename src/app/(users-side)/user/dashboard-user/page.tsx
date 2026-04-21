"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFire, faTag, faTableCells, faTruckFast, faRecycle, faShield } from "@fortawesome/free-solid-svg-icons";
import HeroBanner from "@/components/ui/HeroBanner";
import CategoryGrid from "@/components/ui/CategoryGrid";
import ProductCard from "@/components/ui/ProductCard";
import { subscribeToProductsService, Product } from "@/service/product.service";

const tabs = ["Semua", "Promo"];

export default function DashboardUser() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState("Semua");
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    const unsub = subscribeToProductsService((data) => setProducts(data));
    return () => unsub();
  }, []);

  const filtered = activeTab === "Promo" ? products.filter((p) => p.originalPrice && p.originalPrice > p.price) : products;

  const flashSale = products.filter((p) => p.originalPrice && p.originalPrice > p.price).slice(0, 4);

  const bestSeller = products.slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      <HeroBanner />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: "Barang Second Berkualitas", desc: "Harga bersahabat, kondisi terawat", icon: faRecycle, color: "from-amber-500 to-orange-600" },
          { title: "Gratis Ongkir Blitar", desc: "Pembelian apapun, ongkir GRATIS", icon: faTruckFast, color: "from-emerald-500 to-teal-600" },
          { title: "Garansi Toko", desc: "Setiap produk bergaransi resmi", icon: faShield, color: "from-[#1E2753] to-[#2d3a8c]" },
        ].map((p) => (
          <div key={p.title} className={`bg-gradient-to-br ${p.color} rounded-2xl p-5 flex items-center gap-4`}>
            <FontAwesomeIcon icon={p.icon} className="text-4xl text-black/30" />
            <div>
              <p className="text-white font-bold text-sm">{p.title}</p>
              <p className="text-white/70 text-xs mt-0.5">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <CategoryGrid />

      {flashSale.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faFire} className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-bold text-gray-800">Flash Sale</h2>
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">DISKON</span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {flashSale.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {bestSeller.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <FontAwesomeIcon icon={faTag} className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-gray-800">Produk Terbaru</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {bestSeller.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <div className="bg-gradient-to-r from-[#1E2753] to-[#E85D04] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-white font-bold text-lg">Mau jual barang elektronik bekas?</p>
          <p className="text-white/70 text-sm mt-1">Kami terima barang dengan harga terbaik!</p>
        </div>
        <a href="https://wa.me/62" target="_blank" rel="noopener noreferrer" className="bg-white text-[#1E2753] font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-yellow-300 transition-colors whitespace-nowrap">
          Hubungi Kami
        </a>
      </div>

      <section id="produk">
        <div className="flex items-center gap-2 mb-4">
          <FontAwesomeIcon icon={faTableCells} className="w-5 h-5 text-[#1E2753]" />
          <h2 className="text-lg font-bold text-gray-800">Semua Produk</h2>
        </div>
        <div className="flex gap-2 mb-5 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${activeTab === tab ? "bg-[#1E2753] text-white border-[#1E2753]" : "bg-white text-gray-600 border-gray-200 hover:border-[#1E2753]"}`}
            >
              {tab}
            </button>
          ))}
        </div>
        {filtered.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filtered.slice(0, visibleCount).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            {visibleCount < filtered.length && (
              <div className="flex justify-center mt-8">
                <button onClick={() => setVisibleCount((v) => v + 10)} className="px-8 py-2.5 border-2 border-[#1E2753] text-[#1E2753] rounded-xl font-semibold text-sm hover:bg-[#1E2753] hover:text-white transition-all duration-200">
                  Muat Lebih Banyak
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📦</p>
            <p className="font-medium">{products.length === 0 ? "Memuat produk..." : "Tidak ada produk ditemukan"}</p>
          </div>
        )}
      </section>
    </div>
  );
}
