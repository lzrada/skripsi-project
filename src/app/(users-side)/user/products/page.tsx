"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/config/firebase";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  description: string;
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const result: Product[] = snapshot.docs.map((doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          name: data.name || "",
          price: data.price || 0,
          category: data.category || "",
          images: data.images || [],
          stock: data.stock || 0,
          description: data.description || "",
        };
      });

      setProducts(result);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products;

    return products.filter((item) => item.category === selectedCategory);
  }, [products, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#1F2937]">{selectedCategory ? `Kategori ${selectedCategory}` : "Semua Produk"}</h1>

            <p className="text-sm text-gray-500 mt-1">Menampilkan {filteredProducts.length} produk</p>
          </div>

          <Link href="/user/products" className="w-fit px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 transition-all duration-300">
            Lihat Semua Produk
          </Link>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
                <div className="w-full h-40 bg-gray-200 rounded-xl mb-4" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
                <div className="h-5 bg-gray-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center">
            <h2 className="text-lg font-semibold text-gray-700">Produk tidak ditemukan</h2>
            <p className="text-sm text-gray-500 mt-2">Belum ada produk untuk kategori ini</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredProducts.map((item) => (
              <Link key={item.id} href={`/user/product-detail/${item.id}`} className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 group">
                <div className="w-full h-48 bg-gray-100 overflow-hidden">
                  <img src={item.images?.[0] || "https://placehold.co/600x400?text=No+Image"} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>

                <div className="p-4">
                  <span className="inline-flex px-2 py-1 rounded-lg bg-orange-50 text-[#E85D04] text-xs font-medium mb-3">{item.category}</span>
                  <h2 className="text-sm md:text-base font-semibold text-[#1F2937] line-clamp-2 min-h-12">{item.name}</h2>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-[#E85D04] font-bold text-base">Rp {item.price.toLocaleString("id-ID")}</p>

                    <span className="text-xs text-gray-500">Stok {item.stock}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
