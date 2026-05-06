"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { subscribeToProductsService } from "@/service/product.service";
import { Product } from "@/types/product";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faArrowDownWideShort, faSliders, faXmark } from "@fortawesome/free-solid-svg-icons";
import ProductCard from "@/components/ui/ProductCard";

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);
}

type SortOption = "default" | "price-asc" | "price-desc" | "name-asc";

const CATEGORIES = ["Televisi", "Kulkas", "AC", "Mesin Cuci", "Kipas Angin", "Audio", "Laptop", "HP"];

const PRICE_RANGES = [
  { label: "Semua Harga", min: 0, max: Infinity },
  { label: "< Rp 500.000", min: 0, max: 500000 },
  { label: "Rp 500rb – 1jt", min: 500000, max: 1000000 },
  { label: "Rp 1jt – 3jt", min: 1000000, max: 3000000 },
  { label: "Rp 3jt – 5jt", min: 3000000, max: 5000000 },
  { label: "> Rp 5jt", min: 5000000, max: Infinity },
];

// ─── Skeleton loader ────────────────────────────────────────────────────────
function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-gray-200" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-5 bg-gray-200 rounded w-1/3 mt-2" />
      </div>
    </div>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedCategory = searchParams.get("category") || "";
  const searchQuery = searchParams.get("search") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortOption>("default");
  const [filterOpen, setFilterOpen] = useState(false);

  // Filter state
  const [activeCategory, setActiveCategory] = useState(selectedCategory);
  const [priceRange, setPriceRange] = useState(0); // index dari PRICE_RANGES
  const [conditionFilter, setConditionFilter] = useState<"semua" | "baru" | "bekas">("semua");

  useEffect(() => {
    const unsub = subscribeToProductsService((data) => {
      setProducts(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Sync category dari URL setiap kali URL berubah
  useEffect(() => {
    setActiveCategory(selectedCategory);
  }, [selectedCategory]);

  // Helper: ganti kategori aktif + update URL supaya konsisten
  const handleCategoryChange = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat) {
      params.set("category", cat);
    } else {
      params.delete("category");
    }
    router.push(`/user/products?${params.toString()}`);
  };

  const activeRange = PRICE_RANGES[priceRange];

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (activeCategory) result = result.filter((p) => p.category === activeCategory);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }

    // Filter harga
    if (priceRange > 0) {
      result = result.filter((p) => p.price >= activeRange.min && p.price < activeRange.max);
    }

    // Filter kondisi
    if (conditionFilter !== "semua") {
      result = result.filter((p) => (p.condition?.toLowerCase() ?? "baru") === conditionFilter);
    }

    if (sort === "price-asc") result.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") result.sort((a, b) => b.price - a.price);
    else if (sort === "name-asc") result.sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [products, activeCategory, searchQuery, sort, priceRange, conditionFilter]);

  const hasFilter = activeCategory || priceRange > 0 || conditionFilter !== "semua";

  const resetFilters = () => {
    setPriceRange(0);
    setConditionFilter("semua");
    // Hapus parameter category dari URL supaya navbar dan filter konsisten
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    router.push(`/user/products?${params.toString()}`);
  };

  const pageTitle = searchQuery ? `Hasil: "${searchQuery}"` : activeCategory ? `Kategori: ${activeCategory}` : "Semua Produk";

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* ─── Header ─────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">{pageTitle}</h1>
            <p className="text-xs text-gray-400 mt-0.5">{loading ? "Memuat..." : `${filteredProducts.length} produk ditemukan`}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter toggle */}
            <button
              onClick={() => setFilterOpen((o) => !o)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${hasFilter ? "bg-[#1E2753] text-white border-[#1E2753]" : "bg-white border-gray-200 text-gray-600 hover:border-[#1E2753]"}`}
            >
              <FontAwesomeIcon icon={faSliders} className="w-3.5 h-3.5" />
              Filter {hasFilter && <span className="bg-white/30 text-xs px-1.5 rounded-full">aktif</span>}
            </button>

            {/* Sort */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
              <FontAwesomeIcon icon={faArrowDownWideShort} className="w-3.5 h-3.5 text-gray-400" />
              <select value={sort} onChange={(e) => setSort(e.target.value as SortOption)} className="text-sm text-gray-700 focus:outline-none bg-transparent cursor-pointer">
                <option value="default">Urutkan</option>
                <option value="price-asc">Harga: Termurah</option>
                <option value="price-desc">Harga: Termahal</option>
                <option value="name-asc">Nama: A-Z</option>
              </select>
            </div>

            {hasFilter && (
              <button onClick={resetFilters} className="flex items-center gap-1.5 px-3 py-2 bg-red-50 border border-red-100 rounded-xl text-xs font-medium text-red-500 hover:bg-red-100 transition-all">
                <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* ─── Filter Panel ────────────────────────────────────── */}
        {filterOpen && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-5 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Kategori */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Kategori</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCategoryChange("")}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${!activeCategory ? "bg-[#1E2753] text-white border-[#1E2753]" : "bg-white text-gray-600 border-gray-200 hover:border-[#1E2753]"}`}
                  >
                    Semua
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryChange(cat === activeCategory ? "" : cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${activeCategory === cat ? "bg-[#1E2753] text-white border-[#1E2753]" : "bg-white text-gray-600 border-gray-200 hover:border-[#1E2753]"}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Harga */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Rentang Harga</p>
                <div className="flex flex-col gap-2">
                  {PRICE_RANGES.map((range, idx) => (
                    <button
                      key={range.label}
                      onClick={() => setPriceRange(idx)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all ${priceRange === idx ? "bg-[#1E2753] text-white border-[#1E2753]" : "bg-white text-gray-600 border-gray-200 hover:border-[#1E2753]"}`}
                    >
                      <span className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${priceRange === idx ? "bg-white border-white" : "border-gray-300"}`} />
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Kondisi */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Kondisi Barang</p>
                <div className="flex flex-col gap-2">
                  {(["semua", "baru", "bekas"] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => setConditionFilter(c)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all capitalize ${conditionFilter === c ? "bg-[#1E2753] text-white border-[#1E2753]" : "bg-white text-gray-600 border-gray-200 hover:border-[#1E2753]"}`}
                    >
                      <span className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${conditionFilter === c ? "bg-white border-white" : "border-gray-300"}`} />
                      {c === "semua" ? "Semua Kondisi" : c === "baru" ? "Baru" : "Bekas / Second"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Search info banner ──────────────────────────────── */}
        {searchQuery && !loading && (
          <div className="mb-4 flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <p className="text-sm text-blue-700">
              Ditemukan <span className="font-bold">{filteredProducts.length} produk</span> untuk kata kunci <span className="font-bold">"{searchQuery}"</span>
            </p>
          </div>
        )}

        {/* ─── Grid ───────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center">
            <p className="text-4xl mb-3">🔍</p>
            <h2 className="text-lg font-semibold text-gray-700">{searchQuery ? "Produk tidak ditemukan" : "Belum ada produk"}</h2>
            <p className="text-sm text-gray-500 mt-1">{searchQuery ? `Tidak ada hasil untuk "${searchQuery}".` : "Coba ubah filter pencarian."}</p>
            <button onClick={resetFilters} className="mt-4 inline-block px-5 py-2.5 bg-[#1E2753] text-white rounded-xl text-sm font-semibold">
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
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
