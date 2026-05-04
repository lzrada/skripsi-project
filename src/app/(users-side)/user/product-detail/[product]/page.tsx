"use client";

import { useState, use, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping, faBagShopping, faShield, faTruck, faRotateLeft, faChevronLeft, faChevronRight, faStore, faStar, faStarHalfAlt, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarEmpty } from "@fortawesome/free-regular-svg-icons";
import { doc, getDoc, collection, query, limit, getDocs, where } from "firebase/firestore";
import { db } from "@/config/firebase";
import { Product, Review } from "@/types/product";
import ProductCard from "@/components/ui/ProductCard";
import { addToCartService } from "@/service/cart.service";
import WishlistButton from "@/components/ui/WishlistButton";
import { toast } from "@/components/ui/Toast";
import { subscribeToProductReviews, addReviewService, checkUserCanReviewService } from "@/service/review.service";

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

function formatDate(dateStr: any) {
  if (!dateStr) return "";
  const date = dateStr?.toDate ? dateStr.toDate() : new Date(dateStr);
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
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

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} type="button" onClick={() => onChange(i)} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(0)} className="p-0.5">
          <FontAwesomeIcon icon={faStar} className={`w-7 h-7 transition-colors ${i <= (hovered || value) ? "text-amber-400" : "text-gray-300"}`} />
        </button>
      ))}
    </div>
  );
}

export default function ProductDetailPage({ params }: { params: Promise<{ product: string }> }) {
  const { product: productId } = use(params);

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<"deskripsi" | "spesifikasi" | "ulasan">("deskripsi");
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [canReview, setCanReview] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const snap = await getDoc(doc(db, "products", productId));
        if (!snap.exists()) {
          setLoading(false);
          return;
        }
        const data = snap.data();

        const p: Product = {
          id: snap.id,
          name: data.name,
          category: data.category,
          condition: data.condition ?? "baru",
          price: data.price,
          originalPrice: data.originalPrice,
          stock: data.stock,
          reorderPoint: data.reorderPoint ?? 5,
          description: data.description ?? "",
          images: data.images ?? [],
          averageRating: data.averageRating ?? 0,
          totalReviews: data.totalReviews ?? 0,
        };
        setProduct(p);

        const relSnap = await getDocs(query(collection(db, "products"), where("category", "==", data.category), limit(6)));
        const rel: Product[] = relSnap.docs
          .filter((d) => d.id !== productId)
          .slice(0, 4)
          .map((d) => ({ id: d.id, ...(d.data() as Omit<Product, "id">) }));
        setRelated(rel);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  useEffect(() => {
    const unsub = subscribeToProductReviews(productId, setReviews);
    return () => unsub();
  }, [productId]);

  useEffect(() => {
    const uid = getUidFromCookie();
    if (!uid) return;
    checkUserCanReviewService(uid, productId).then((result) => {
      if (result.canReview) {
        setCanReview(true);
      } else if (result.reason?.includes("sudah memberikan ulasan")) {
        setAlreadyReviewed(true);
      }
    });
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product) return;
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
    if (!product) return;
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

  const handleSubmitReview = async () => {
    const uid = getUidFromCookie();
    if (!uid) {
      toast.warning("Silakan login terlebih dahulu!");
      return;
    }
    if (reviewRating === 0) {
      toast.warning("Pilih rating bintang terlebih dahulu.");
      return;
    }
    if (reviewComment.trim().length < 5) {
      toast.warning("Ulasan minimal 5 karakter.");
      return;
    }
    setSubmittingReview(true);
    try {
      const userSnap = await getDoc(doc(db, "users", uid));
      const userData = userSnap.data();
      await addReviewService(productId, uid, userData?.fullName ?? "Pengguna", userData?.photoURL ?? undefined, reviewRating, reviewComment);
      toast.success("Ulasan berhasil dikirim!");
      setReviewRating(0);
      setReviewComment("");
      setCanReview(false);
      setAlreadyReviewed(true);
    } catch (err: any) {
      toast.error(err?.message ?? "Gagal mengirim ulasan.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Memuat produk...</p>
      </div>
    );

  if (!product)
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 flex flex-col items-center gap-4 text-gray-400">
        <p className="font-semibold text-gray-600">Produk tidak ditemukan</p>
        <Link href="/user/dashboard-user" className="px-5 py-2.5 bg-[#1E2753] text-white rounded-xl text-sm font-semibold">
          Kembali ke Beranda
        </Link>
      </div>
    );

  const discountPercent = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : null;

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
        <div className="space-y-3">
          <div className="w-full aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden relative bg-white border border-gray-100 shadow-sm">
            {product.images && product.images.length > 0 ? (
              <>
                <Image src={product.images[activeImage]} alt={product.name} fill className="object-contain p-3" />
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImage((i) => (i - 1 + product.images!.length) % product.images!.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center text-gray-600 shadow-md border border-gray-100 transition"
                    >
                      <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setActiveImage((i) => (i + 1) % product.images!.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center text-gray-600 shadow-md border border-gray-100 transition"
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
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition bg-white flex items-center justify-center ${
                    i === activeImage ? "border-[#1E2753] shadow-sm" : "border-gray-100 opacity-60 hover:opacity-100 hover:border-gray-300"
                  }`}
                >
                  <Image src={img} alt={`Foto ${i + 1}`} width={80} height={80} className="object-contain w-full h-full p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

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
              className="flex-1 py-3 bg-[#1E2753] text-white rounded-xl font-semibold text-sm hover:bg-[#2a3470] transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FontAwesomeIcon icon={faBagShopping} className="w-4 h-4" />
              Beli Sekarang
            </button>
            <button
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 border-2 ${
                added ? "bg-green-500 border-green-500 text-white" : "border-[#1E2753] text-[#1E2753] hover:bg-[#1E2753] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
            >
              <FontAwesomeIcon icon={faCartShopping} className="w-4 h-4" />
              {adding ? "..." : added ? "Ditambahkan!" : "Keranjang"}
            </button>
          </div>
        </div>
      </div>

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
              <div className="flex py-2 border-b border-gray-100">
                <span className="w-36 text-gray-500">Kategori</span>
                <span className="font-medium text-gray-800">{product.category}</span>
              </div>
              <div className="flex py-2 border-b border-gray-100">
                <span className="w-36 text-gray-500">Kondisi</span>
                <span className="font-medium text-gray-800 capitalize">{product.condition ?? "Baru"}</span>
              </div>
              <div className="flex py-2 border-b border-gray-100">
                <span className="w-36 text-gray-500">Stok</span>
                <span className="font-medium text-gray-800">{product.stock} unit</span>
              </div>
              <div className="flex py-2">
                <span className="w-36 text-gray-500">Jumlah Foto</span>
                <span className="font-medium text-gray-800">{product.images?.length ?? 0} foto</span>
              </div>
            </div>
          )}

          {activeTab === "ulasan" && (
            <div className="space-y-6">
              {/* ── Ringkasan Rating ── */}
              {(product.averageRating ?? 0) > 0 && (
                <div className="flex items-center gap-6 p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-100">
                  <div className="text-center flex-shrink-0">
                    <p className="text-5xl font-black text-amber-500">{product.averageRating?.toFixed(1)}</p>
                    <StarDisplay rating={product.averageRating ?? 0} size="md" />
                    <p className="text-xs text-gray-400 mt-1">dari {product.totalReviews} ulasan</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = reviews.filter((r) => r.rating === star).length;
                      const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-3 flex-shrink-0">{star}</span>
                          <FontAwesomeIcon icon={faStar} className="w-2.5 h-2.5 text-amber-400 flex-shrink-0" />
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div className="h-1.5 bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] text-gray-400 w-4 flex-shrink-0">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Form Tulis Ulasan (hanya pembeli yang sudah selesai) ── */}
              {canReview && (
                <div className="border-2 border-[#1E2753]/10 bg-blue-50/30 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#1E2753] rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faStar} className="w-3.5 h-3.5 text-yellow-300" />
                    </div>
                    <p className="text-sm font-bold text-gray-800">Tulis Ulasanmu</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-2">
                      Rating <span className="text-red-400">*</span>
                    </p>
                    <StarInput value={reviewRating} onChange={setReviewRating} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-2">
                      Komentar <span className="text-red-400">*</span>
                    </p>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Bagikan pengalamanmu — kondisi barang, kualitas, kesesuaian dengan deskripsi..."
                      rows={4}
                      className="w-full text-sm border-2 border-gray-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:border-[#1E2753] transition bg-white"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Minimal 5 karakter · {reviewComment.length} karakter</p>
                  </div>
                  <button
                    onClick={handleSubmitReview}
                    disabled={submittingReview || reviewRating === 0 || reviewComment.trim().length < 5}
                    className="w-full py-3 bg-[#1E2753] text-white rounded-xl text-sm font-semibold hover:bg-[#2a3470] transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submittingReview && <FontAwesomeIcon icon={faSpinner} className="w-3.5 h-3.5 animate-spin" />}
                    {submittingReview ? "Mengirim..." : "Kirim Ulasan"}
                  </button>
                </div>
              )}

              {alreadyReviewed && (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FontAwesomeIcon icon={faStar} className="w-3.5 h-3.5 text-green-500" />
                  </div>
                  <p className="text-sm text-green-700 font-medium">Kamu sudah memberikan ulasan untuk produk ini. Terima kasih! 🙏</p>
                </div>
              )}

              {!canReview && !alreadyReviewed && (
                <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FontAwesomeIcon icon={faShield} className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-700 font-semibold">Ulasan Terverifikasi</p>
                    <p className="text-xs text-gray-500 mt-0.5">Hanya pembeli yang telah menyelesaikan pesanan yang dapat memberikan ulasan.</p>
                  </div>
                </div>
              )}

              {/* ── Daftar Ulasan ── */}
              {reviews.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-4xl mb-3">💬</p>
                  <p className="text-sm font-semibold text-gray-600">Belum ada ulasan</p>
                  <p className="text-xs text-gray-400 mt-1">Jadilah yang pertama mengulas produk ini</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r.id} className="flex gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="w-10 h-10 rounded-full bg-[#1E2753] flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden ring-2 ring-white">
                        {r.userPhoto ? <Image src={r.userPhoto} alt={r.userName} width={40} height={40} className="object-cover w-full h-full" /> : (r.userName?.[0]?.toUpperCase() ?? "U")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div>
                            <p className="text-sm font-bold text-gray-800">{r.userName}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <StarDisplay rating={r.rating} />
                              <span className="text-[10px] bg-green-100 text-green-600 font-semibold px-1.5 py-0.5 rounded-full">Pembelian Terverifikasi</span>
                            </div>
                          </div>
                          <p className="text-[10px] text-gray-400 shrink-0 mt-0.5">{formatDate(r.createdAt)}</p>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
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
