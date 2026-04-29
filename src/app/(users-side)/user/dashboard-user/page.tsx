"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFire, faTag, faTableCells, faTruckFast, faRecycle, faShield } from "@fortawesome/free-solid-svg-icons";
import HeroBanner from "@/components/ui/HeroBanner";
import CategoryGrid from "@/components/ui/CategoryGrid";
import ProductCard from "@/components/ui/ProductCard";
import { subscribeToProductsService } from "@/service/product.service";
import { Product } from "@/types/product";
const tabs = ["Semua", "Promo"];

// ─── Skeleton Components ────────────────────────────────────────────────────

function SkeletonProductCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-100" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-200 rounded-lg w-3/4" />
        <div className="h-3 bg-gray-200 rounded-lg w-1/2" />
        <div className="h-5 bg-gray-200 rounded-lg w-2/5 mt-2" />
        <div className="flex gap-1.5 mt-2">
          <div className="h-8 bg-gray-200 rounded-xl flex-1" />
          <div className="h-8 bg-gray-200 rounded-xl flex-1" />
        </div>
      </div>
    </div>
  );
}

function SkeletonSection({ title, count = 4 }: { title: string; count?: number }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
        <div className="h-5 bg-gray-200 rounded-lg w-32 animate-pulse" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(count)].map((_, i) => (
          <SkeletonProductCard key={i} />
        ))}
      </div>
    </section>
  );
}

function SkeletonPromoCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-2xl h-20 bg-gray-200 animate-pulse" />
      ))}
    </div>
  );
}

// ─── Dashboard ──────────────────────────────────────────────────────────────

export default function DashboardUser() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState("Semua");
  const [visibleCount, setVisibleCount] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToProductsService((data) => {
      setProducts(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const inStockProducts = products.filter((p) => p.stock > 0);
  const filtered = activeTab === "Promo" ? inStockProducts.filter((p) => p.originalPrice && p.originalPrice > p.price) : inStockProducts;

  const flashSale = inStockProducts.filter((p) => p.originalPrice && p.originalPrice > p.price).slice(0, 4);
  const bestSeller = inStockProducts.slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      {/* Hero Banner — tampil langsung, tidak perlu data */}
      <HeroBanner />

      {/* Promo cards */}
      {loading ? (
        <SkeletonPromoCards />
      ) : (
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
      )}

      {/* Category grid */}
      <CategoryGrid />

      {/* Flash Sale */}
      {loading ? (
        <SkeletonSection title="Flash Sale" count={4} />
      ) : flashSale.length > 0 ? (
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
      ) : null}

      {/* Produk Terbaru */}
      {loading ? (
        <SkeletonSection title="Produk Terbaru" count={4} />
      ) : bestSeller.length > 0 ? (
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
      ) : null}

      {/* CTA banner
      <div className="bg-gradient-to-r from-[#1E2753] to-[#E85D04] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-white font-bold text-lg">Mau jual barang elektronik bekas?</p>
          <p className="text-white/70 text-sm mt-1">Kami terima barang dengan harga terbaik!</p>
        </div>
        <a href="https://wa.me/62" target="_blank" rel="noopener noreferrer" className="bg-white text-[#1E2753] font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-yellow-300 transition-colors whitespace-nowrap">
          Hubungi Kami
        </a>
      </div> */}

      {/* Semua Produk */}
      <section id="produk">
        <div className="flex items-center gap-2 mb-4">
          <FontAwesomeIcon icon={faTableCells} className="w-5 h-5 text-[#1E2753]" />
          <h2 className="text-lg font-bold text-gray-800">Semua Produk</h2>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setVisibleCount(10);
              }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${activeTab === tab ? "bg-[#1E2753] text-white border-[#1E2753]" : "bg-white text-gray-600 border-gray-200 hover:border-[#1E2753]"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <SkeletonProductCard key={i} />
            ))}
          </div>
        ) : filtered.length > 0 ? (
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
            <p className="font-medium">Tidak ada produk ditemukan</p>
          </div>
        )}
      </section>
    </div>
  );
}
