"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping, faBagShopping, faShield, faTruck, faRotateLeft, faChevronLeft, faChevronRight, faStar, faStarHalfAlt, faStore, faFire, faTag } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarEmpty } from "@fortawesome/free-regular-svg-icons";
import { Product } from "@/types/product";
import WishlistButton from "@/components/(user)/ui/WishlistButton";
import ProductCard from "@/components/(user)/ui/ProductCard";
import { addToCartService } from "@/service/cart.service";
import { toast } from "@/components/(user)/ui/Toast";
import ReviewSection from "./ReviewSection";
import ProductDescription from "@/components/(user)/ui/ProductDescription";


function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
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

function StarDisplay({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sizeClass = size === "md" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <FontAwesomeIcon key={i} icon={rating >= i ? faStar : rating >= i - 0.5 ? faStarHalfAlt : faStarEmpty} className={`${sizeClass} ${rating >= i - 0.5 ? "text-amber-400" : "text-gray-300"}`} />
      ))}
    </div>
  );
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-red-500 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
        Stok Habis
      </span>
    );
  if (stock <= 3)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full">
        <FontAwesomeIcon icon={faFire} className="w-3 h-3" />
        Hampir Habis! Sisa {stock}
      </span>
    );
  if (stock <= 10)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
        Stok terbatas ({stock})
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
      Tersedia ({stock})
    </span>
  );
}

export default function ProductDetailClient({ product, related }: { product: Product; related: Product[] }) {
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<"deskripsi" | "spesifikasi" | "ulasan">("deskripsi");
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const images = product.images ?? [];
  const isOutOfStock = product.stock <= 0;
  const discountPercent = product.originalPrice && product.originalPrice > product.price ? Math.round((1 - product.price / product.originalPrice) * 100) : null;

  const handleAddToCart = async () => {
    const uid = getUidFromCookie();
    if (!uid) {
      toast.warning("Silakan login terlebih dahulu!");
      window.location.href = "/login";
      return;
    }
    if (isOutOfStock) {
      toast.error("Maaf, stok produk ini sudah habis.");
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
        image: images[0] ?? "",
        qty,
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

  const handleBuyNow = async () => {
    const uid = getUidFromCookie();
    if (!uid) {
      toast.warning("Silakan login terlebih dahulu!");
      window.location.href = "/login";
      return;
    }
    if (isOutOfStock) {
      toast.error("Maaf, stok produk ini sudah habis.");
      return;
    }
    try {
      await addToCartService(uid, {
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        category: product.category,
        condition: product.condition ?? "baru",
        stock: product.stock,
        image: images[0] ?? "",
        qty,
      });
      window.location.href = `/user/checkout?ids=${product.id}`;
    } catch (error: any) {
      toast.error(error?.message ?? "Gagal memproses pembelian.");
    }
  };

  const TRUST = [
    {
      icon: faShield,
      label: "Garansi Toko",
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      icon: faTruck,
      label: "Gratis Ongkir",
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      icon: faRotateLeft,
      label: "Bisa Retur",
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
  ];

  const TABS = [
    { key: "deskripsi" as const, label: "Deskripsi" },
    { key: "spesifikasi" as const, label: "Spesifikasi" },
    {
      key: "ulasan" as const,
      label: `Ulasan (${product.totalReviews ?? 0})`,
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-[#F9FAFB] pb-28 sm:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-4 flex-wrap">
            <Link href="/user/dashboard-user" className="hover:text-[#1E2753] transition-colors">
              Beranda
            </Link>
            <span>/</span>
            <Link href="/user/products" className="hover:text-[#1E2753] transition-colors">
              Produk
            </Link>
            <span>/</span>
            <Link href={`/user/products?category=${encodeURIComponent(product.category)}`} className="hover:text-[#1E2753] transition-colors">
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-gray-600 font-medium line-clamp-1 max-w-40 sm:max-w-none">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-8">
            <div className="space-y-3">
              <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm w-full" style={{ paddingBottom: "75%" }}>
                {images.length > 0 ? (
                  <>
                    <Image src={images[activeImage]} alt={product.name} fill sizes="(max-width: 560px) 100vw, 50vw" className="object-contain p-6 sm:p-8" priority style={{ top: 0, left: 0, width: "100%", height: "100%" }} />

                    {images.length > 1 && (
                      <>
                        <button
                          onClick={() => setActiveImage((i) => (i - 1 + images.length) % images.length)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full shadow flex items-center justify-center hover:bg-white transition"
                        >
                          <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3 text-gray-600" />
                        </button>
                        <button
                          onClick={() => setActiveImage((i) => (i + 1) % images.length)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full shadow flex items-center justify-center hover:bg-white transition"
                        >
                          <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3 text-gray-600" />
                        </button>
                      </>
                    )}

                    {/* Badge diskon */}
                    {discountPercent && discountPercent > 0 && (
                      <div className="absolute top-3 left-3 z-10">
                        <span className="flex items-center gap-1 bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-xl shadow">
                          <FontAwesomeIcon icon={faTag} className="w-3 h-3" />-{discountPercent}%
                        </span>
                      </div>
                    )}

                    {/* Wishlist */}
                    <div className="absolute top-3 right-3 z-10">
                      <WishlistButton productId={product.id} productName={product.name} size="md" />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">📦</div>
                )}
              </div>

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 overflow-hidden bg-white transition-all ${i === activeImage ? "border-[#1E2753] shadow-md" : "border-gray-100 opacity-60 hover:opacity-100"}`}
                    >
                      <Image src={img} alt={`${product.name} ${i + 1}`} width={64} height={64} className="object-contain p-1 w-full h-full" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Kolom kanan: info produk ── */}
            <div className="space-y-3.5">
              {/* Nama produk */}
              <div>
                <Link href={`/user/products?category=${encodeURIComponent(product.category)}`} className="text-xs font-bold text-[#1E2753]/50 uppercase tracking-widest hover:text-[#1E2753] transition-colors">
                  {product.category}
                </Link>
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 mt-1 leading-snug">{product.name}</h1>
              </div>

              {/* Rating */}
              {(product.averageRating ?? 0) > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <StarDisplay rating={product.averageRating ?? 0} size="sm" />
                  <span className="text-sm font-bold text-gray-700">{product.averageRating?.toFixed(1)}</span>
                  {(product.totalReviews ?? 0) > 0 && <span className="text-xs text-gray-400">({product.totalReviews} ulasan)</span>}
                </div>
              )}

              {/* Harga */}
              <div className="bg-gray-50 rounded-2xl p-3">
                {product.originalPrice && product.originalPrice > product.price && <p className="text-sm text-gray-400 line-through mb-0.5">{formatPrice(product.originalPrice)}</p>}
                <p className="text-3xl sm:text-4xl font-black text-[#1E2753]">{formatPrice(product.price)}</p>
                {discountPercent && discountPercent > 0 && <p className="text-sm text-emerald-600 font-semibold mt-1">Hemat {formatPrice((product.originalPrice ?? product.price) - product.price)}</p>}
              </div>

              {/* Kondisi + stok badge */}
              <div className="flex items-center gap-2 flex-wrap">
                {product.condition && <span className={`text-xs font-bold px-3 py-1 rounded-full ${product.condition.toLowerCase() === "bekas" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>{product.condition}</span>}
                <StockBadge stock={product.stock} />
                {/* Terjual — tampil jika ada data */}
                {(product.sold ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
                    <FontAwesomeIcon icon={faFire} className="w-3 h-3" />
                    {(product.sold ?? 0) >= 1000 ? `${((product.sold ?? 0) / 1000).toFixed(1).replace(".", ",")}rb` : product.sold}+ terjual
                  </span>
                )}
              </div>

              {/* Info toko */}
              <div className="flex items-center gap-3 p-3.5 bg-white border border-gray-100 rounded-2xl">
                <div className="w-10 h-10 bg-[#1E2753] rounded-xl flex items-center justify-center shrink-0">
                  <FontAwesomeIcon icon={faStore} className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Rizky Elektronik</p>
                  <p className="text-xs text-gray-400">Toko resmi · Blitar, Jawa Timur</p>
                </div>
              </div>

              {/* Trust badges mobile */}
              <div className="grid grid-cols-3 gap-2 md:hidden">
                {TRUST.map((t) => (
                  <div key={t.label} className={`flex flex-col items-center gap-1 p-2.5 ${t.bg} rounded-xl`}>
                    <FontAwesomeIcon icon={t.icon} className={`w-4 h-4 ${t.color}`} />
                    <span className="text-[10px] font-semibold text-gray-600 text-center leading-tight">{t.label}</span>
                  </div>
                ))}
              </div>

              {/* Qty + tombol aksi — hanya desktop/tablet */}
              <div className="hidden sm:block space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-600">Jumlah:</span>
                  <div className="flex items-center border-2 border-gray-100 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      disabled={qty <= 1 || isOutOfStock}
                      className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition font-bold text-lg"
                    >
                      −
                    </button>
                    <span className="w-10 text-center text-sm font-bold text-gray-800">{qty}</span>
                    <button
                      onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                      disabled={qty >= product.stock || isOutOfStock}
                      className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition font-bold text-lg"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-gray-400">Maks. {product.stock}</span>
                </div>

                {/* Tombol desktop */}
                <div className="flex gap-3">
                  <button
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    className={`flex-1 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all bg-linear-to-r from-orange-500 to-red-500 text-white hover:from-orange-400 hover:to-red-400 shadow-md shadow-orange-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100 `}
                  >
                    <FontAwesomeIcon icon={faBagShopping} className="w-4 h-4" />
                    Beli Sekarang
                  </button>
                  <button
                    onClick={handleAddToCart}
                    disabled={adding || isOutOfStock}
                    className={`flex-1 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border-2 transition-all ${
                      added ? "bg-emerald-500 border-emerald-500 text-white" : isOutOfStock ? "bg-gray-100 border-gray-100 text-gray-400 cursor-not-allowed" : "border-[#1E2753] text-[#1E2753] hover:bg-[#1E2753] hover:text-white"
                    }`}
                  >
                    <FontAwesomeIcon icon={faCartShopping} className="w-4 h-4" />
                    {adding ? "Menambahkan..." : added ? "Ditambahkan ✓" : "Keranjang"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Tab: deskripsi / spesifikasi / ulasan ── */}
          <div className="mt-6 sm:mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Tab header */}
            <div className="flex border-b border-gray-100 overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 min-w-22.5 py-3.5 text-sm font-bold whitespace-nowrap transition-colors ${activeTab === tab.key ? "text-[#1E2753] border-b-2 border-[#1E2753] bg-[#1E2753]/5" : "text-gray-400 hover:text-gray-600"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab konten */}
            <div className="p-4 sm:p-6">
             {activeTab === "deskripsi" && (
  <ProductDescription text={product.description ?? ""} />
)}
 
              {activeTab === "spesifikasi" && (
                <div className="space-y-2 text-sm">
                  {[
                    ["Kategori", product.category],
                    ["Kondisi", product.condition ?? "Baru"],
                    ["Stok", `${product.stock} unit`],
                    ["Jumlah Foto", `${images.length} foto`],
                  ].map(([label, value]) => (
                    <div key={label} className="flex py-2 border-b border-gray-100 last:border-0">
                      <span className="w-36 text-gray-500">{label}</span>
                      <span className="font-medium text-gray-800 capitalize">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "ulasan" && <ReviewSection productId={product.id} totalReviews={product.totalReviews ?? 0} averageRating={product.averageRating ?? 0} />}
            </div>
          </div>

          {/* ── Produk terkait ── */}
          {related.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Produk Terkait</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {related.slice(0, 5).map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Sticky bottom action bar — mobile only (sm ke bawah) ── */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.10)] px-4 py-3">
        {/* Qty + total harga */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Jumlah:</span>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1 || isOutOfStock}
                className="w-7 h-7 flex items-center justify-center text-gray-600 text-sm hover:bg-gray-50 disabled:opacity-30 transition font-bold"
              >
                −
              </button>
              <span className="w-7 text-center text-xs font-bold text-gray-800">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                disabled={qty >= product.stock || isOutOfStock}
                className="w-7 h-7 flex items-center justify-center text-gray-600 text-sm hover:bg-gray-50 disabled:opacity-30 transition font-bold"
              >
                +
              </button>
            </div>
          </div>
          <p className="text-base font-black text-[#1E2753]">{formatPrice(product.price * qty)}</p>
        </div>

        {/* Tombol aksi */}
        <div className="flex gap-2.5">
          <button
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
              isOutOfStock ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-[#1E2753] text-white hover:bg-[#2a3470]"
            }`}
          >
            <FontAwesomeIcon icon={faBagShopping} className="w-4 h-4" />
            Beli Sekarang
          </button>
          <button
            onClick={handleAddToCart}
            disabled={adding || isOutOfStock}
            className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 border-2 transition-all active:scale-95 ${
              added ? "bg-emerald-500 border-emerald-500 text-white" : isOutOfStock ? "bg-gray-100 border-gray-100 text-gray-400 cursor-not-allowed" : "border-[#1E2753] text-[#1E2753]"
            }`}
          >
            <FontAwesomeIcon icon={faCartShopping} className="w-4 h-4" />
            {adding ? "..." : added ? "✓ Ditambah" : "Keranjang"}
          </button>
        </div>
      </div>
    </>
  );
}
