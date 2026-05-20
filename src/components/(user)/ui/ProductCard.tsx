// src/components/ui/ProductCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiShoppingCart, FiCheck, FiEye } from "react-icons/fi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faStar, faTag, faFire } from "@fortawesome/free-solid-svg-icons";
import { categoryIcon, categoryGradient, defaultCategoryIcon, defaultGradient } from "@/constants/category";
import { addToCartService } from "@/service/cart.service";
import { toast } from "@/components/(user)/ui/Toast";
import WishlistButton from "@/components/(user)/ui/WishlistButton";

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  condition?: string;
  stock: number;
  sold?: number;
  averageRating?: number;
  totalReviews?: number;
  description?: string;
  images?: string[];
}

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

function getUid(): string | null {
  if (typeof document === "undefined") return null;
  return (
    document.cookie
      .split("; ")
      .find((r) => r.startsWith("uid="))
      ?.split("=")[1] ?? null
  );
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
        Habis
      </span>
    );
  }
  if (stock <= 3) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
        <FontAwesomeIcon icon={faFire} className="w-2.5 h-2.5" />
        Hampir Habis! Sisa {stock}
      </span>
    );
  }
  if (stock <= 10) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
        Stok terbatas ({stock})
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
      Tersedia
    </span>
  );
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const router = useRouter();
  if (!product) return null;

  const liveStock = product.stock;

  const gradient = categoryGradient[product.category] ?? defaultGradient;
  const icon = categoryIcon[product.category] ?? defaultCategoryIcon;

  const discountPct = product.originalPrice && product.originalPrice > product.price ? Math.round((1 - product.price / product.originalPrice) * 100) : null;

  const isBekas = product.condition?.toLowerCase() === "bekas";
  const isOutOfStock = liveStock === 0;

  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const uid = getUid();
    if (!uid) {
      toast.warning("Silakan login terlebih dahulu!");
      window.location.href = "/login";
      return;
    }
    if (isOutOfStock) return;

    setAdding(true);
    try {
      await addToCartService(uid, {
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        category: product.category,
        condition: product.condition ?? "Baru",
        stock: liveStock,
        image: product.images?.[0] ?? "",
        qty: 1,
      });
      setAdded(true);
      toast.success(`${product.name} ditambahkan ke keranjang! 🛒`);
      setTimeout(() => setAdded(false), 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menambahkan ke keranjang.";
      toast.error(msg);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div
      onClick={() => router.push(`/user/product-detail/${product.id}`)}
      className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#1E2753]/20 hover:shadow-2xl shadow-sm transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* ── Area Gambar ── */}
      <div className="relative overflow-hidden bg-gray-50">
        {product.images?.[0] ? (
          <div className="relative w-full aspect-square">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 480px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
              loading={priority ? "eager" : "lazy"}
              priority={priority}
            />
          </div>
        ) : (
          <div className={`w-full aspect-square bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <FontAwesomeIcon icon={icon} className="w-10 h-10 sm:w-12 sm:h-12 text-white/50" />
          </div>
        )}

        {/* Overlay hover — Lihat Detail */}
        <div className="hidden sm:flex absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 items-center justify-center opacity-0 group-hover:opacity-100">
          <Link
            href={`/user/product-detail/${product.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 bg-white text-[#1E2753] text-[11px] font-bold px-4 py-2 rounded-full shadow-xl border border-white hover:bg-[#1E2753] hover:text-white transition-all duration-200 translate-y-3 group-hover:translate-y-0"
          >
            <FiEye className="w-3.5 h-3.5" />
            Lihat Detail
          </Link>
        </div>

        {/* Badge Diskon */}
        {discountPct && discountPct > 0 && (
          <div className="absolute top-2 left-2 z-10">
            <span className="flex items-center gap-0.5 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow">
              <FontAwesomeIcon icon={faTag} className="w-2.5 h-2.5" />-{discountPct}%
            </span>
          </div>
        )}

        {/* Badge Second — geser kalau ada diskon */}
        {isBekas && (
          <div className="absolute z-10" style={{ top: discountPct ? "2rem" : "0.5rem", left: "0.5rem" }}>
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow">Second</span>
          </div>
        )}

        {/* Stok Habis Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center z-10">
            <div className="bg-gray-800 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">Stok Habis</div>
          </div>
        )}

        {/* Wishlist */}
        <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
          <WishlistButton productId={product.id} productName={product.name} size="sm" />
        </div>
      </div>

      {/* ── Info Produk ── */}
      <div className="p-3 flex flex-col flex-1 gap-1">
        {/* Kategori */}
        <p className="text-[9px] font-semibold text-[#1E2753]/40 uppercase tracking-widest">{product.category}</p>

        {/* Nama Produk */}
        <h3 className="text-xs sm:text-[13px] font-semibold text-gray-800 line-clamp-2 leading-snug flex-1">{product.name}</h3>

        {/* Rating */}
        {(product.averageRating ?? 0) > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((i) => (
                <FontAwesomeIcon key={i} icon={faStar} className={`w-2.5 h-2.5 ${i <= Math.round(product.averageRating ?? 0) ? "text-amber-400" : "text-gray-200"}`} />
              ))}
            </div>
            <span className="text-[10px] text-gray-500 font-medium">{product.averageRating?.toFixed(1)}</span>
            {(product.totalReviews ?? 0) > 0 && <span className="text-[10px] text-gray-400">({product.totalReviews})</span>}
          </div>
        )}

        {/* Harga */}
        <div>
          {product.originalPrice && product.originalPrice > product.price && <p className="text-[10px] text-gray-400 line-through leading-none">{formatPrice(product.originalPrice)}</p>}
          <p className="text-sm sm:text-base font-black text-[#1E2753] leading-tight">{formatPrice(product.price)}</p>
        </div>

        {/* Stok + Terjual */}
        <div className="flex items-center justify-between flex-wrap gap-1">
          <StockBadge stock={liveStock} />
          {(product.sold ?? 0) > 0 && <span className="text-[10px] text-gray-400 font-medium">{product.sold} terjual</span>}
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
          {/* Tombol Detail */}
          <Link
            href={`/user/product-detail/${product.id}`}
            className="flex-1 py-2 text-[11px] sm:text-xs font-bold rounded-xl border-2 border-[#1E2753] text-[#1E2753] hover:bg-[#1E2753] hover:text-white transition-all duration-200 flex items-center justify-center gap-1.5"
          >
            Detail
          </Link>

          {/* Tombol Keranjang */}
          <button
            onClick={handleAddToCart}
            disabled={adding || isOutOfStock}
            className={`flex-1 py-2 text-[11px] sm:text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${
              added ? "bg-emerald-500 text-white" : isOutOfStock ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-[#1E2753] text-white hover:bg-[#2a3470] active:scale-95"
            } disabled:opacity-60`}
          >
            {adding ? (
              <FontAwesomeIcon icon={faSpinner} className="w-3 h-3 animate-spin" />
            ) : added ? (
              <>
                <FiCheck className="w-3.5 h-3.5" />
                Ditambahkan!
              </>
            ) : (
              <>
                <FiShoppingCart className="w-3.5 h-3.5" />
                Keranjang
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
