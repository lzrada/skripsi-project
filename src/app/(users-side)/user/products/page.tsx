"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { subscribeToProductsService, Product } from "@/service/product.service";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faArrowDownWideShort } from "@fortawesome/free-solid-svg-icons";

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);
}

type SortOption = "default" | "price-asc" | "price-desc" | "name-asc";

function ProductsContent() {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category") || "";
  const searchQuery = searchParams.get("search") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortOption>("default");

  useEffect(() => {
    const unsub = subscribeToProductsService((data) => {
      setProducts(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter kategori
    if (selectedCategory) result = result.filter((p) => p.category === selectedCategory);

    // Filter search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }

    // Sort
    if (sort === "price-asc") result.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") result.sort((a, b) => b.price - a.price);
    else if (sort === "name-asc") result.sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [products, selectedCategory, searchQuery, sort]);

  const pageTitle = searchQuery ? `Hasil pencarian: "${searchQuery}"` : selectedCategory ? `Kategori: ${selectedCategory}` : "Semua Produk";

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#1F2937]">{pageTitle}</h1>
            <p className="text-sm text-gray-500 mt-1">{loading ? "Memuat..." : `Menampilkan ${filteredProducts.length} produk`}</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {(selectedCategory || searchQuery) && (
              <Link href="/user/products" className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 transition-all">
                Lihat Semua
              </Link>
            )}
            {/* Sort */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
              <FontAwesomeIcon icon={faArrowDownWideShort} className="w-4 h-4 text-gray-400" />
              <select value={sort} onChange={(e) => setSort(e.target.value as SortOption)} className="text-sm text-gray-700 focus:outline-none bg-transparent cursor-pointer">
                <option value="default">Urutkan</option>
                <option value="price-asc">Harga: Termurah</option>
                <option value="price-desc">Harga: Termahal</option>
                <option value="name-asc">Nama: A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search info banner */}
        {searchQuery && !loading && (
          <div className="mb-5 flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <p className="text-sm text-blue-700">
              Ditemukan <span className="font-bold">{filteredProducts.length} produk</span> untuk kata kunci <span className="font-bold">"{searchQuery}"</span>
            </p>
          </div>
        )}

        {/* Grid */}
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
            <p className="text-4xl mb-3">🔍</p>
            <h2 className="text-lg font-semibold text-gray-700">{searchQuery ? "Produk tidak ditemukan" : "Belum ada produk"}</h2>
            <p className="text-sm text-gray-500 mt-2">{searchQuery ? `Tidak ada hasil untuk "${searchQuery}". Coba kata kunci lain.` : "Belum ada produk untuk kategori ini."}</p>
            {searchQuery && (
              <Link href="/user/products" className="mt-4 inline-block px-5 py-2.5 bg-[#1E2753] text-white rounded-xl text-sm font-semibold">
                Lihat Semua Produk
              </Link>
            )}
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
                    {discountPercent && !habis && <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">-{discountPercent}%</span>}
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
