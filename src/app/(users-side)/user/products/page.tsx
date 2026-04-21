"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { subscribeToProductsService, Product } from "@/service/product.service";

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToProductsService((data) => {
      setProducts(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#1F2937]">{selectedCategory ? `Kategori: ${selectedCategory}` : "Semua Produk"}</h1>
            <p className="text-sm text-gray-500 mt-1">Menampilkan {filteredProducts.length} produk</p>
          </div>
          {selectedCategory && (
            <Link href="/user/products" className="w-fit px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 transition-all">
              Lihat Semua Produk
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
                <div className="w-full h-40 bg-gray-200 rounded-xl mb-4" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
                <div className="h-5 bg-gray-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center">
            <p className="text-4xl mb-3">📦</p>
            <h2 className="text-lg font-semibold text-gray-700">Produk tidak ditemukan</h2>
            <p className="text-sm text-gray-500 mt-2">Belum ada produk untuk kategori ini</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredProducts.map((item) => {
              const habis = item.stock === 0;
              const discountPercent = item.originalPrice && item.originalPrice > item.price ? Math.round((1 - item.price / item.originalPrice) * 100) : null;

              return (
                <Link
                  key={item.id}
                  href={`/user/product-detail/${item.id}`}
                  className={`bg-white border border-gray-100 rounded-2xl overflow-hidden transition-all duration-300 group ${habis ? "opacity-60 pointer-events-none" : "hover:shadow-lg"}`}
                >
                  <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
                    <img src={item.images?.[0] || "https://placehold.co/600x400?text=No+Image"} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    {/* Badge diskon */}
                    {discountPercent && !habis && <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">-{discountPercent}%</span>}
                    {/* Badge stok habis */}
                    {habis && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-white text-gray-700 text-xs font-bold px-3 py-1 rounded-full">Stok Habis</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <span className="inline-flex px-2 py-1 rounded-lg bg-orange-50 text-[#E85D04] text-xs font-medium mb-2">{item.category}</span>
                    <h2 className="text-sm md:text-base font-semibold text-[#1F2937] line-clamp-2 min-h-[48px]">{item.name}</h2>
                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        {item.originalPrice && item.originalPrice > item.price && <p className="text-xs text-gray-400 line-through">{formatPrice(item.originalPrice)}</p>}
                        <p className="text-[#E85D04] font-bold text-base">{formatPrice(item.price)}</p>
                      </div>
                      {habis ? <span className="text-xs text-red-400 font-semibold">Habis</span> : <span className="text-xs text-gray-400">Stok {item.stock}</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsContent />
    </Suspense>
  );
}
