"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { FiShoppingCart, FiStar } from "react-icons/fi";
import { HiOutlineFire } from "react-icons/hi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { categoryIcon, categoryGradient, defaultCategoryIcon, defaultGradient } from "@/constants/category";
import { addToCartService } from "@/service/cart.service";
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

const badgeConfig: Record<string, { label: string; bg: string }> = {
  sale: { label: "DISKON", bg: "bg-red-500" },
  new: { label: "BARU", bg: "bg-green-500" },
  best: { label: "TERLARIS", bg: "bg-amber-500" },
  limited: { label: "STOK TERBATAS", bg: "bg-purple-600" },
};

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
  const isOnSale = !!discountPercent;
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    const uid = getUidFromCookie();
    if (!uid) {
      window.location.href = "/login";
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
        condition: product.condition ?? "baru",
        stock: product.stock,
        image: product.images?.[0] ?? "",
        qty: 1,
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <Link href={`/user/product-detail/${product.id}`} className="relative block">
        <div className={`h-48 bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}>
          {product.images?.[0] ? (
            <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
          ) : (
            <FontAwesomeIcon icon={icon} className="w-16 h-16 text-white/30 group-hover:scale-110 transition-transform duration-300" />
          )}
          {isOnSale && <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">DISKON</span>}
          {product.condition === "bekas" && <span className="absolute top-2 right-2 bg-amber-400/80 text-amber-900 text-[10px] font-semibold px-2 py-0.5 rounded-full">Second</span>}
          {discountPercent && <span className="absolute bottom-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">-{discountPercent}%</span>}
        </div>
      </Link>

      <div className="p-3 flex flex-col flex-1">
        <Link href={`/user/product-detail/${product.id}`}>
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug hover:text-[#1E2753] transition-colors mb-1">{product.name}</h3>
        </Link>
        {(product.rating || product.sold) && (
          <div className="flex items-center gap-2 mb-2">
            {product.rating && (
              <div className="flex items-center gap-0.5">
                <FiStar className="text-yellow-400 text-xs fill-yellow-400" />
                <span className="text-xs text-gray-500 font-medium">{product.rating}</span>
              </div>
            )}
            {product.rating && product.sold && <span className="text-gray-300 text-xs">|</span>}
            {product.sold && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <HiOutlineFire className="text-orange-400" />
                <span>Terjual {product.sold}</span>
              </div>
            )}
          </div>
        )}
        <div className="mt-auto">
          {product.originalPrice && <p className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</p>}
          <p className="text-base font-bold text-[#1E2753]">{formatPrice(product.price)}</p>
        </div>
        {product.stock <= 3 && product.stock > 0 && <p className="text-[10px] text-red-500 font-medium mt-1">Sisa {product.stock} lagi!</p>}
        {product.stock === 0 && <p className="text-[10px] text-gray-400 font-medium mt-1">Stok habis</p>}
        <button
          onClick={handleAddToCart}
          disabled={adding || product.stock === 0}
          className={`mt-2 w-full py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 border-2 ${
            added ? "bg-green-500 border-green-500 text-white" : "border-[#1E2753] text-[#1E2753] hover:bg-[#1E2753] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          }`}
        >
          <FiShoppingCart className="text-sm" />
          {adding ? "Menambahkan..." : added ? "Ditambahkan!" : "Keranjang"}
        </button>
      </div>
    </div>
  );
}
