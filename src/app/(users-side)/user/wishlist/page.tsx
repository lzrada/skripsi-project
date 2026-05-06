"use client";

import { useEffect, useState, useCallback } from "react";
import { getWishlistIds } from "@/service/wishlist.service";
import { getProductsByIdsService } from "@/service/product.service";
import { Product } from "@/types/product";
import ProductCard from "@/components/ui/ProductCard";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { FiHeart } from "react-icons/fi";

function getUid(): string | null {
  if (typeof document === "undefined") return null;
  return (
    document.cookie
      .split("; ")
      .find((r) => r.startsWith("uid="))
      ?.split("=")[1] ?? null
  );
}

function SkeletonCard() {
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

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const uid = getUid();

  const loadWishlist = useCallback(async () => {
    if (!uid) {
      setLoading(false);
      return;
    }
    const ids = getWishlistIds(uid);
    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    const results = await getProductsByIdsService(ids);
    setProducts(results);
    setLoading(false);
  }, [uid]);

  useEffect(() => {
    loadWishlist();

    // Reaktif saat produk di-toggle dari halaman ini atau ProductCard
    window.addEventListener("wishlistUpdated", loadWishlist);
    return () => window.removeEventListener("wishlistUpdated", loadWishlist);
  }, [loadWishlist]);

  if (!uid)
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 flex flex-col items-center gap-4">
        <FiHeart className="w-12 h-12 text-gray-200" />
        <p className="text-gray-600 font-semibold">Silakan login untuk melihat wishlist</p>
        <Link href="/login" className="px-6 py-3 bg-[#1E2753] text-white rounded-xl font-semibold text-sm">
          Login
        </Link>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/user/dashboard-user" className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition text-gray-500">
          <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Wishlist Saya</h1>
          <p className="text-xs text-gray-400">{loading ? "Memuat..." : `${products.length} produk disimpan`}</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
            <FiHeart className="w-10 h-10 text-red-300" />
          </div>
          <p className="font-semibold text-gray-600">Wishlist masih kosong</p>
          <p className="text-sm text-gray-400">Tap ikon ❤️ di produk untuk menyimpannya</p>
          <Link href="/user/products" className="mt-2 px-5 py-2.5 bg-[#1E2753] text-white rounded-xl text-sm font-semibold">
            Jelajahi Produk
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
