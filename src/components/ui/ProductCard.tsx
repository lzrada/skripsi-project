// src/components/ui/ProductCard.tsx
//
// Perubahan dari versi lama:
//  - Tombol "Keranjang" & "Beli" diganti jadi icon button — lebih compact & modern
//  - Hover state lebih smooth: image zoom + subtle card lift
//  - Price section lebih rapi dengan diskon persen yang menonjol
//  - Badge stacking lebih rapi
//  - Loading state pakai spinner, bukan text "..."
//  - Struktur JSX lebih flat dan mudah dibaca

"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { FiShoppingCart, FiZap, FiCheck } from "react-icons/fi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { categoryIcon, categoryGradient, defaultCategoryIcon, defaultGradient } from "@/constants/category";
import { addToCartService } from "@/service/cart.service";
import { toast } from "@/components/ui/Toast";
import WishlistButton from "@/components/ui/WishlistButton";

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function requireAuth(): string | null {
  const uid = getUid();
  if (!uid) {
    toast.warning("Silakan login terlebih dahulu!");
    window.location.href = "/login";
    return null;
  }
  return uid;
}

// ─── Komponen ────────────────────────────────────────────────────────────────

export default function ProductCard({ product }: ProductCardProps) {
  const gradient = categoryGradient[product.category] ?? defaultGradient;
  const icon = categoryIcon[product.category] ?? defaultCategoryIcon;

  const discountPct = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : null;

  const isBekas = product.condition?.toLowerCase() === "bekas";
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;

  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  // ── Tambah ke keranjang ──────────────────────────────────────
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const uid = requireAuth();
    if (!uid || isOutOfStock) return;

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

  // ── Beli sekarang ────────────────────────────────────────────
  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const uid = requireAuth();
    if (!uid || isOutOfStock) return;

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
    <article
      className={`group relative bg-white rounded-2xl overflow-hidden border flex flex-col
        transition-all duration-300
        ${isOutOfStock ? "border-gray-100 opacity-70" : "border-gray-100 hover:border-[#1E2753]/15 hover:shadow-[0_8px_30px_rgba(30,39,83,0.10)] hover:-translate-y-0.5"}`}
    >
      {/* ── Gambar ── */}
      <Link href={`/user/product-detail/${product.id}`} className="relative block overflow-hidden">
        <div className={`h-44 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
          {/* Produk image atau placeholder icon */}
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
              className={`object-cover transition-transform duration-500
                ${!isOutOfStock ? "group-hover:scale-[1.06]" : ""}`}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <FontAwesomeIcon
                icon={icon}
                className={`w-14 h-14 text-white/20
                  ${!isOutOfStock ? "group-hover:scale-110 transition-transform duration-300" : ""}`}
              />
            </div>
          )}

          {/* Overlay gelap saat stok habis */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white/90 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-full">Stok Habis</span>
            </div>
          )}

          {/* Badges — kiri atas */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discountPct && (
              <span
                className="bg-red-500 text-white text-[10px] font-bold
                px-1.5 py-0.5 rounded-md leading-tight"
              >
                -{discountPct}%
              </span>
            )}
            {isBekas && (
              <span
                className="bg-amber-400 text-amber-900 text-[10px] font-semibold
                px-1.5 py-0.5 rounded-md leading-tight"
              >
                2nd
              </span>
            )}
          </div>

          {/* Wishlist — kanan atas */}
          <div className="absolute top-2 right-2">
            <WishlistButton productId={product.id} productName={product.name} size="sm" />
          </div>
        </div>
      </Link>

      {/* ── Info produk ── */}
      <div className="p-3 flex flex-col flex-1 gap-1.5">
        {/* Nama */}
        <Link href={`/user/product-detail/${product.id}`}>
          <h3
            className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug
            hover:text-[#1E2753] transition-colors"
          >
            {product.name}
          </h3>
        </Link>

        {/* Harga */}
        <div className="mt-auto">
          {product.originalPrice && product.originalPrice > product.price && <p className="text-xs text-gray-400 line-through leading-none">{formatPrice(product.originalPrice)}</p>}
          <p className="text-base font-bold text-[#1E2753] leading-tight">{formatPrice(product.price)}</p>
        </div>

        {/* Stok menipis */}
        {isLowStock && <p className="text-[10px] text-red-500 font-semibold">⚡ Sisa {product.stock} lagi!</p>}

        {/* Action buttons */}
        {!isOutOfStock ? (
          <div className="flex gap-1.5 mt-1">
            {/* Tombol keranjang */}
            <button
              onClick={handleAddToCart}
              disabled={adding}
              title="Tambah ke keranjang"
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center
                justify-center gap-1.5 border-2 transition-all duration-200
                ${added ? "bg-green-500 border-green-500 text-white" : "border-[#1E2753] text-[#1E2753] hover:bg-[#1E2753] hover:text-white disabled:opacity-40"}`}
            >
              {adding ? <FontAwesomeIcon icon={faSpinner} className="w-3 h-3 animate-spin" /> : added ? <FiCheck className="w-3.5 h-3.5" /> : <FiShoppingCart className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{added ? "Ditambahkan" : "Keranjang"}</span>
            </button>

            {/* Tombol beli langsung */}
            <button
              onClick={handleBuyNow}
              title="Beli sekarang"
              className="flex-1 py-2 rounded-xl text-xs font-bold
                bg-[#E85D04] text-white hover:bg-[#c74d03]
                flex items-center justify-center gap-1.5
                transition-colors duration-200"
            >
              <FiZap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Beli</span>
            </button>
          </div>
        ) : (
          <div
            className="mt-1 py-2 rounded-xl text-xs font-semibold text-center
            text-gray-400 bg-gray-50 border border-gray-100"
          >
            Tidak tersedia
          </div>
        )}
      </div>
    </article>
  );
}
