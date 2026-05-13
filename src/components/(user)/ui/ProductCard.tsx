// src/components/ui/ProductCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiShoppingCart, FiCheck, FiEye } from "react-icons/fi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faStar, faFire, faTag } from "@fortawesome/free-solid-svg-icons";
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

// ── Stock badge: tampil seperti e-commerce modern ─────────────────────────
function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) {
    return (
      <div className="flex items-center gap-1 mt-1">
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
          Habis
        </span>
      </div>
    );
  }
  if (stock <= 3) {
    return (
      <div className="flex items-center gap-1 mt-1">
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
          <FontAwesomeIcon icon={faFire} className="w-2.5 h-2.5" />
          Hampir Habis! Sisa {stock}
        </span>
      </div>
    );
  }
  if (stock <= 10) {
    return (
      <div className="flex items-center gap-1 mt-1">
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
          Stok terbatas ({stock})
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 mt-1">
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
        Tersedia
      </span>
    </div>
  );
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
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
      className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#1E2753]/30 hover:shadow-xl shadow-sm transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* ── Gambar ── */}
      <div className="relative overflow-hidden bg-gray-50">
        {product.images?.[0] ? (
          <div className="relative w-full aspect-square">
            <Image src={product.images[0]} alt={product.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className="object-contain p-3 group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          </div>
        ) : (
          <div className={`w-full aspect-square bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <FontAwesomeIcon icon={icon} className="w-12 h-12 text-white/50" />
          </div>
        )}

        {/* ── Overlay tombol Quick View (muncul saat hover) ── */}
        <div className="absolute inset-0 bg-[#1E2753]/0 group-hover:bg-[#1E2753]/5 transition-colors duration-300 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100">
          <Link
            href={`/user/product-detail/${product.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-[#1E2753] text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg border border-white hover:bg-[#1E2753] hover:text-white transition-all duration-200 translate-y-2 group-hover:translate-y-0"
          >
            <FiEye className="w-3 h-3" />
            Lihat Detail
          </Link>
        </div>

        {/* ── Badge Diskon ── */}
        {discountPct && discountPct > 0 && (
          <div className="absolute top-2 left-2 z-10">
            <span className="flex items-center gap-0.5 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-sm">
              <FontAwesomeIcon icon={faTag} className="w-2.5 h-2.5" />-{discountPct}%
            </span>
          </div>
        )}

        {/* ── Badge Kondisi Second ── */}
        {isBekas && (
          <div className="absolute top-2 left-2 z-10" style={{ top: discountPct ? "2.2rem" : undefined }}>
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm">Second</span>
          </div>
        )}

        {/* ── Stok Habis Overlay ── */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center z-10">
            <div className="bg-gray-800 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">Stok Habis</div>
          </div>
        )}

        {/* ── Wishlist ── */}
        <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
          <WishlistButton productId={product.id} productName={product.name} size="sm" />
        </div>
      </div>

      {/* ── Info ── */}
      <div className="p-3 flex flex-col flex-1">
        {/* Kategori */}
        <p className="text-[10px] font-semibold text-[#1E2753]/50 uppercase tracking-widest mb-1">{product.category}</p>

        {/* Nama */}
        <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug flex-1 mb-2">{product.name}</h3>

        {/* Rating */}
        {(product.averageRating ?? 0) > 0 && (
          <div className="flex items-center gap-1 mb-1.5">
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
        <div className="mb-1">
          {product.originalPrice && product.originalPrice > product.price && <p className="text-[10px] text-gray-400 line-through leading-none mb-0.5">{formatPrice(product.originalPrice)}</p>}
          <p className="text-sm font-black text-[#1E2753] leading-none">{formatPrice(product.price)}</p>
        </div>

        {/* Stock Badge */}
        <StockBadge stock={liveStock} />

        {/* Tombol Keranjang */}
        <button
          onClick={handleAddToCart}
          disabled={adding || isOutOfStock}
          className={`mt-3 w-full py-2 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${
            added ? "bg-emerald-500 text-white scale-95" : isOutOfStock ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-[#1E2753] text-white hover:bg-[#2a3470] active:scale-95"
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
              <FiShoppingCart className="w-3.5 h-3.5" />+ Keranjang
            </>
          )}
        </button>
      </div>
    </div>
  );
}
