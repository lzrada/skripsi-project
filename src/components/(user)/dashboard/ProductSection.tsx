"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFire, faTag, faTableCells, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import ProductCard from "@/components/ui/ProductCard";
import { subscribeToProductsService } from "@/service/product.service";
import { Product } from "@/types/product";

const tabs = ["Semua", "Promo"];

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

function SkeletonSection({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {[...Array(count)].map((_, i) => (
        <SkeletonProductCard key={i} />
      ))}
    </div>
  );
}

export default function ProductSection() {
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

  const inStock = products.filter((p) => p.stock > 0);
  const flashSale = inStock.filter((p) => p.originalPrice && p.originalPrice > p.price).slice(0, 4);
  const terbaru = inStock.slice(0, 4);
  const filtered = activeTab === "Promo" ? inStock.filter((p) => p.originalPrice && p.originalPrice > p.price) : inStock;

  return (
    <div className="space-y-10">
      {/* Flash Sale */}
      {loading ? (
        <section>
          <div className="h-5 bg-gray-200 rounded w-32 animate-pulse mb-4" />
          <SkeletonSection count={4} />
        </section>
      ) : (
        flashSale.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faFire} className="w-5 h-5 text-red-500" />
                <h2 className="text-lg font-bold text-gray-800">Flash Sale</h2>
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">DISKON</span>
              </div>
              <Link href="/user/products" className="text-xs text-[#1E2753] font-semibold flex items-center gap-1 hover:underline">
                Lihat Semua <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {flashSale.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )
      )}

      {/* Produk Terbaru */}
      {loading ? (
        <section>
          <div className="h-5 bg-gray-200 rounded w-36 animate-pulse mb-4" />
          <SkeletonSection count={4} />
        </section>
      ) : (
        terbaru.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faTag} className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold text-gray-800">Produk Terbaru</h2>
              </div>
              <Link href="/user/products" className="text-xs text-[#1E2753] font-semibold flex items-center gap-1 hover:underline">
                Lihat Semua <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {terbaru.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )
      )}

      {/* Semua Produk */}
      <section id="produk">
        <div className="flex items-center gap-2 mb-4">
          <FontAwesomeIcon icon={faTableCells} className="w-5 h-5 text-[#1E2753]" />
          <h2 className="text-lg font-bold text-gray-800">Semua Produk</h2>
        </div>

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
            <p className="text-sm mt-1">Coba tab lain atau cari produk berbeda</p>
          </div>
        )}
      </section>
    </div>
  );
}
