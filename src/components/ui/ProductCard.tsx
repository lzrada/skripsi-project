"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiShoppingCart, FiCheck } from "react-icons/fi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faStar } from "@fortawesome/free-solid-svg-icons";
import { categoryIcon, categoryGradient, defaultCategoryIcon, defaultGradient } from "@/constants/category";
import { addToCartService } from "@/service/cart.service";
import { toast } from "@/components/ui/Toast";
import WishlistButton from "@/components/ui/WishlistButton";

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

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();

  const gradient = categoryGradient[product.category] ?? defaultGradient;
  const icon = categoryIcon[product.category] ?? defaultCategoryIcon;

  const discountPct = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : null;

  const isBekas = product.condition?.toLowerCase() === "bekas";
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;

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
        stock: product.stock,
        image: product.images?.[0] ?? "",
        qty: 1,
      });

      setAdded(true);
      toast.success(`${product.name} ditambahkan ke keranjang! 🛒`);
      setTimeout(() => setAdded(false), 2000);
    } catch (err: any) {
      toast.error(err?.message ?? "Gagal menambahkan ke keranjang.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div
      onClick={() => router.push(`/user/product-detail/${product.id}`)}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#1E2753]/20 hover:shadow-lg transition-all duration-200 flex flex-col cursor-pointer"
    >
      {/* ── Gambar ── */}
      <div className="relative overflow-hidden">
        {product.images?.[0] ? (
          <div className="relative w-full aspect-square bg-gray-50">
            <Image src={product.images[0]} alt={product.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-contain p-3 group-hover:scale-105 transition-transform duration-300" />
          </div>
        ) : (
          <div className={`w-full aspect-square bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <FontAwesomeIcon icon={icon} className="w-10 h-10 text-white/60" />
          </div>
        )}

        {/* Badge diskon */}
        {discountPct && <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">-{discountPct}%</span>}

        {/* Badge kondisi */}
        {isBekas && <span className="absolute top-2 right-8 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">2nd</span>}

        {/* Stok habis overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
            <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1.5 rounded-full">Stok Habis</span>
          </div>
        )}

        {/* Wishlist */}
        <div className="absolute top-1.5 right-1.5 z-10" onClick={(e) => e.stopPropagation()}>
          <WishlistButton productId={product.id} productName={product.name} size="sm" />
        </div>
      </div>

      {/* ── Info ── */}
      <div className="p-3 flex flex-col flex-1 gap-1">
        <p className="text-[10px] font-semibold text-[#1E2753]/60 uppercase tracking-wide">{product.category}</p>

        <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug flex-1">{product.name}</h3>

        {/* Rating */}
        {(product.averageRating ?? 0) > 0 && (
          <div className="flex items-center gap-1">
            <FontAwesomeIcon icon={faStar} className="w-2.5 h-2.5 text-amber-400" />
            <span className="text-[10px] text-gray-500 font-medium">{product.averageRating?.toFixed(1)}</span>
            {(product.totalReviews ?? 0) > 0 && <span className="text-[10px] text-gray-400">({product.totalReviews})</span>}
          </div>
        )}

        {/* Harga */}
        <div className="mt-1">
          {product.originalPrice && product.originalPrice > product.price && <p className="text-[10px] text-gray-400 line-through">{formatPrice(product.originalPrice)}</p>}
          <p className="text-sm font-bold text-[#1E2753]">{formatPrice(product.price)}</p>
        </div>

        {/* Stok low warning */}
        {isLowStock && <p className="text-[10px] text-orange-500 font-semibold">Sisa {product.stock} lagi!</p>}

        {/* Tombol */}
        <div className="flex gap-1.5 mt-2">
          <Link
            href={`/user/product-detail/${product.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 py-2 text-xs font-semibold text-center text-[#1E2753] border-2 border-[#1E2753] rounded-xl hover:bg-[#1E2753] hover:text-white transition-colors"
          >
            Detail
          </Link>

          <button
            onClick={handleAddToCart}
            disabled={adding || isOutOfStock}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1 ${
              added ? "bg-green-500 text-white" : isOutOfStock ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-[#1E2753] text-white hover:bg-[#2a3470]"
            } disabled:opacity-60`}
          >
            {adding ? <FontAwesomeIcon icon={faSpinner} className="w-3 h-3 animate-spin" /> : added ? <FiCheck className="w-3 h-3" /> : <FiShoppingCart className="w-3 h-3" />}
            {adding ? "" : added ? "Ditambah!" : "Keranjang"}
          </button>
        </div>
      </div>
    </div>
  );
}
