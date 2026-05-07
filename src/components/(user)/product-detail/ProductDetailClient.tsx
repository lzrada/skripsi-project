"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping, faBagShopping, faShield, faTruck, faRotateLeft, faChevronLeft, faChevronRight, faStar, faStarHalfAlt, faStore } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarEmpty } from "@fortawesome/free-regular-svg-icons";
import { Product } from "@/types/product";
import WishlistButton from "@/components/ui/WishlistButton";
import ProductCard from "@/components/ui/ProductCard";
import { addToCartService } from "@/service/cart.service";
import { toast } from "@/components/ui/Toast";
import ReviewSection from "./ReviewSection";

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

export default function ProductDetailClient({ product, related }: { product: Product; related: Product[] }) {
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<"deskripsi" | "spesifikasi" | "ulasan">("deskripsi");
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const discountPercent = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : null;

  const handleAddToCart = async () => {
    const uid = getUidFromCookie();
    if (!uid) {
      toast.warning("Silakan login terlebih dahulu!");
      window.location.href = "/login";
      return;
    }
    if (product.stock <= 0) {
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
        image: product.images?.[0] ?? "",
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
    if (product.stock <= 0) {
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
        image: product.images?.[0] ?? "",
        qty,
      });
      window.location.href = `/user/checkout?ids=${product.id}`;
    } catch (error: any) {
      toast.error(error?.message ?? "Gagal memproses pembelian.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      <nav className="flex items-center gap-2 text-xs text-gray-400">
        <Link href="/user/dashboard-user" className="hover:text-[#1E2753]">
          Beranda
        </Link>
        <span>/</span>
        <Link href={`/user/products?category=${encodeURIComponent(product.category)}`} className="hover:text-[#1E2753]">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-gray-600 font-medium line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="w-full aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden relative bg-white border border-gray-100 shadow-sm">
            {product.images && product.images.length > 0 ? (
              <>
                <Image src={product.images[activeImage]} alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain p-3" />
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImage((i) => (i - 1 + product.images!.length) % product.images!.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center shadow-md border border-gray-100 transition"
                    >
                      <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setActiveImage((i) => (i + 1) % product.images!.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center shadow-md border border-gray-100 transition"
                    >
                      <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {product.images.map((_, i) => (
                        <button key={i} onClick={() => setActiveImage(i)} className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeImage ? "bg-[#1E2753] w-4" : "bg-gray-300"}`} />
                      ))}
                    </div>
                  </>
                )}
                {discountPercent && <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">-{discountPercent}%</span>}
                <div className="absolute top-3 right-3">
                  <WishlistButton productId={product.id} productName={product.name} size="md" />
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">📦</div>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition bg-white ${i === activeImage ? "border-[#1E2753]" : "border-gray-100 opacity-60 hover:opacity-100"}`}
                >
                  <Image src={img} alt={`Foto ${i + 1}`} width={80} height={80} className="object-contain w-full h-full p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info produk */}
        <div className="space-y-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 leading-snug mb-2">{product.name}</h1>
            <div className="flex items-center gap-3 text-sm flex-wrap">
              {(product.averageRating ?? 0) > 0 && (
                <div className="flex items-center gap-1.5">
                  <StarDisplay rating={product.averageRating ?? 0} />
                  <span className="text-xs text-gray-500">
                    {product.averageRating?.toFixed(1)} ({product.totalReviews} ulasan)
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1 text-gray-500">
                <FontAwesomeIcon icon={faStore} className="w-4 h-4 text-[#1E2753]" />
                <span>Stok {product.stock}</span>
              </div>
              {product.condition && (
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${product.condition.toLowerCase() === "baru" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                  {product.condition.toLowerCase() === "baru" ? "Baru" : "Bekas / Second"}
                </span>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            {product.originalPrice && <p className="text-sm text-gray-400 line-through mb-1">{formatPrice(product.originalPrice)}</p>}
            <p className="text-3xl font-bold text-[#1E2753]">{formatPrice(product.price)}</p>
            {discountPercent && <span className="inline-block mt-1 bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">Hemat {formatPrice(product.originalPrice! - product.price)}</span>}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: faShield, label: "Garansi Toko", color: "text-blue-500" },
              { icon: faTruck, label: "Gratis Ongkir", color: "text-green-500" },
              { icon: faRotateLeft, label: "Bisa Retur", color: "text-orange-500" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-1 p-2 bg-gray-50 rounded-xl text-center">
                <FontAwesomeIcon icon={item.icon} className={`w-5 h-5 ${item.color}`} />
                <span className="text-[10px] text-gray-600 font-medium">{item.label}</span>
              </div>
            ))}
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Jumlah</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold text-lg">
                  −
                </button>
                <span className="w-12 text-center font-semibold text-gray-800">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  disabled={product.stock === 0}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold text-lg disabled:opacity-40"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-gray-400">Stok tersedia: {product.stock}</span>
            </div>
          </div>

          {product.stock === 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-sm font-semibold text-red-600">Stok habis</p>
              <p className="text-xs text-red-400 mt-0.5">Produk ini sedang tidak tersedia.</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="flex-1 py-3 bg-[#1E2753] text-white rounded-xl font-semibold text-sm hover:bg-[#2a3470] transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faBagShopping} className="w-4 h-4" /> Beli Sekarang
            </button>
            <button
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 border-2 ${added ? "bg-green-500 border-green-500 text-white" : "border-[#1E2753] text-[#1E2753] hover:bg-[#1E2753] hover:text-white disabled:opacity-50"}`}
            >
              <FontAwesomeIcon icon={faCartShopping} className="w-4 h-4" />
              {adding ? "..." : added ? "Ditambahkan!" : "Keranjang"}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100">
          {(["deskripsi", "spesifikasi", "ulasan"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-sm font-semibold capitalize transition-colors ${activeTab === tab ? "text-[#1E2753] border-b-2 border-[#1E2753]" : "text-gray-500 hover:text-gray-700"}`}
            >
              {tab === "ulasan" ? `Ulasan (${product.totalReviews ?? 0})` : tab}
            </button>
          ))}
        </div>
        <div className="p-6">
          {activeTab === "deskripsi" && <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{product.description || "Tidak ada deskripsi."}</p>}
          {activeTab === "spesifikasi" && (
            <div className="space-y-2 text-sm">
              {[
                ["Kategori", product.category],
                ["Kondisi", product.condition ?? "Baru"],
                ["Stok", `${product.stock} unit`],
                ["Jumlah Foto", `${product.images?.length ?? 0} foto`],
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

      {related.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-4">Produk Terkait</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
