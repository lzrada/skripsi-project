"use client";

import Link from "next/link";
import { useState } from "react";
import { FiShoppingCart, FiZap } from "react-icons/fi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { categoryIcon, categoryGradient, defaultCategoryIcon, defaultGradient } from "@/constants/category";
import { addToCartService } from "@/service/cart.service";
import { toast } from "@/components/ui/Toast";
import WishlistButton from "@/components/ui/WishlistButton";
import Image from "next/image";

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  condition?: string;
  stock: number;
  sold?: number;
  rating?: number;
  description?: string;
  images?: string[];
}

interface ProductCardProps {
  product: Product;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);
}

function getUidFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  return (
    document.cookie
      .split("; ")
      .find((r) => r.startsWith("uid="))
      ?.split("=")[1] ?? null
  );
}

export default function ProductCard({ product }: ProductCardProps) {
  const gradient = categoryGradient[product.category] ?? defaultGradient;
  const icon = categoryIcon[product.category] ?? defaultCategoryIcon;
  const discountPercent = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : null;

  // ✅ FIX: case-insensitive comparison — admin simpan "Bekas", bukan "bekas"
  const isBekas = product.condition?.toLowerCase() === "bekas";
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;

  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const uid = getUidFromCookie();
    if (!uid) {
      toast.warning("Silakan login terlebih dahulu!");
      window.location.href = "/login";
      return;
    }
    if (isOutOfStock) {
      toast.error("Stok produk habis!");
      return;
    }
    setAdding(true);
    try {
      await addToCartService(uid, {
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        category: product.category,
        condition: product.condition ?? "Baru",
        stock: product.stock,
        image: product.images?.[0] ?? "",
        qty: 1,
      });
      setAdded(true);
      toast.success(`${product.name} ditambahkan ke keranjang! 🛒`);
      setTimeout(() => setAdded(false), 2000);
    } catch (err: any) {
      toast.error(err?.message ?? "Gagal menambahkan ke keranjang");
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const uid = getUidFromCookie();
    if (!uid) {
      toast.warning("Silakan login terlebih dahulu!");
      window.location.href = "/login";
      return;
    }
    if (isOutOfStock) {
      toast.error("Stok produk habis!");
      return;
    }
    try {
      await addToCartService(uid, {
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        category: product.category,
        condition: product.condition ?? "Baru",
        stock: product.stock,
        image: product.images?.[0] ?? "",
        qty: 1,
      });
      window.location.href = `/user/checkout?ids=${product.id}`;
    } catch (err: any) {
      toast.error(err?.message ?? "Terjadi kesalahan, coba lagi!");
    }
  };

  return (
    <div
      className={`group bg-white rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col ${
        isOutOfStock ? "border-gray-100 opacity-75" : "border-gray-100 hover:border-[#1E2753]/20 hover:shadow-lg hover:shadow-blue-900/8 hover:-translate-y-0.5"
      }`}
    >
      {/* ── Image Area ── */}
      <Link href={`/user/product-detail/${product.id}`} className="relative block">
        <div className={`h-44 bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}>
          {product.images?.[0] ? (
            <Image src={product.images[0]} alt={product.name} fill className={`object-cover transition-transform duration-500 ${isOutOfStock ? "" : "group-hover:scale-105"}`} />
          ) : (
            <FontAwesomeIcon icon={icon} className="w-14 h-14 text-white/25 group-hover:scale-110 transition-transform duration-300" />
          )}

          {/* Overlay badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discountPercent && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full leading-tight">-{discountPercent}%</span>}
            {isBekas && <span className="bg-amber-400 text-amber-900 text-[10px] font-semibold px-2 py-0.5 rounded-full leading-tight">Second</span>}
          </div>

          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white/90 text-gray-700 text-xs font-bold px-3 py-1 rounded-full">Stok Habis</span>
            </div>
          )}

          {/* Wishlist */}
          <div className="absolute top-2 right-2">
            <WishlistButton productId={product.id} productName={product.name} size="sm" />
          </div>
        </div>
      </Link>

      {/* ── Info ── */}
      <div className="p-3 flex flex-col flex-1">
        <Link href={`/user/product-detail/${product.id}`}>
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug hover:text-[#1E2753] transition-colors mb-2">{product.name}</h3>
        </Link>

        {/* Price */}
        <div className="mt-auto mb-2">
          {product.originalPrice && product.originalPrice > product.price && <p className="text-xs text-gray-400 line-through leading-none mb-0.5">{formatPrice(product.originalPrice)}</p>}
          <p className="text-base font-bold text-[#1E2753] leading-none">{formatPrice(product.price)}</p>
        </div>

        {/* Stock warning */}
        {isLowStock && <p className="text-[10px] text-red-500 font-semibold mb-1.5">⚡ Sisa {product.stock} lagi!</p>}

        {/* Action buttons */}
        {!isOutOfStock ? (
          <div className="flex gap-1.5">
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1 border-2 ${
                added ? "bg-green-500 border-green-500 text-white" : "border-[#1E2753] text-[#1E2753] hover:bg-[#1E2753] hover:text-white disabled:opacity-50"
              }`}
            >
              <FiShoppingCart className="text-xs flex-shrink-0" />
              <span className="truncate">{adding ? "..." : added ? "Ditambahkan!" : "Keranjang"}</span>
            </button>
            <button onClick={handleBuyNow} className="flex-1 py-2 rounded-xl text-xs font-bold bg-[#E85D04] text-white hover:bg-orange-600 transition-all duration-200 flex items-center justify-center gap-1">
              <FiZap className="text-xs flex-shrink-0" />
              <span>Beli</span>
            </button>
          </div>
        ) : (
          <div className="py-2 rounded-xl text-xs font-semibold text-center text-gray-400 bg-gray-50 border border-gray-100">Tidak tersedia</div>
        )}
      </div>
    </div>
  );
}
