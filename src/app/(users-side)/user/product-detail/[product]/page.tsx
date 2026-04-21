"use client";

import { useState, use, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping, faBagShopping, faStar, faFire, faShield, faTruck, faRotateLeft, faChevronLeft, faChevronRight, faStore } from "@fortawesome/free-solid-svg-icons";
import { doc, getDoc, collection, query, limit, getDocs } from "firebase/firestore";
import { db } from "@/config/firebase";
import { Product } from "@/service/product.service";
import ProductCard from "@/components/ui/ProductCard";
import { addToCartService } from "@/service/cart.service";

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

export default function ProductDetailPage({ params }: { params: Promise<{ product: string }> }) {
  const { product: productId } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<"deskripsi" | "spesifikasi">("deskripsi");
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

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
          price: data.price,
          originalPrice: data.originalPrice,
          stock: data.stock,
          description: data.description ?? "",
          images: data.images ?? [],
        };
        setProduct(p);

        // Ambil produk terkait (kategori sama, max 4)
        const relSnap = await getDocs(query(collection(db, "products"), limit(8)));
        const rel: Product[] = relSnap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<Product, "id">) }))
          .filter((r) => r.id !== productId && r.category === data.category)
          .slice(0, 4);
        setRelated(rel);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product) return;
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
        condition: "baru",
        stock: product.stock,
        image: product.images?.[0] ?? "",
        qty,
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } finally {
      setAdding(false);
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
        <span className="text-gray-600 font-medium">{product.category}</span>
        <span>/</span>
        <span className="text-gray-600 font-medium line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Gambar */}
        <div className="space-y-3">
          <div className="w-full h-80 md:h-96 rounded-2xl overflow-hidden relative bg-gray-100">
            {product.images && product.images.length > 0 ? (
              <>
                <Image src={product.images[activeImage]} alt={product.name} fill className="object-cover" />
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImage((i) => (i - 1 + product.images!.length) % product.images!.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition"
                    >
                      <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setActiveImage((i) => (i + 1) % product.images!.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition"
                    >
                      <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3" />
                    </button>
                  </>
                )}
                {discountPercent && <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">-{discountPercent}%</span>}
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
                  className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition ${i === activeImage ? "border-[#1E2753]" : "border-transparent opacity-60 hover:opacity-100"}`}
                >
                  <Image src={img} alt={`Foto ${i + 1}`} width={64} height={64} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 leading-snug mb-2">{product.name}</h1>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1 text-gray-500">
                <FontAwesomeIcon icon={faStore} className="w-4 h-4 text-[#1E2753]" />
                <span>Stok {product.stock}</span>
              </div>
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
                <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold text-lg">
                  +
                </button>
              </div>
              <span className="text-xs text-gray-400">Stok tersedia: {product.stock}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/user/checkout" className="flex-1 py-3 bg-[#1E2753] text-white rounded-xl font-semibold text-sm hover:bg-[#2a3470] transition flex items-center justify-center gap-2">
              <FontAwesomeIcon icon={faBagShopping} className="w-4 h-4" />
              Beli Sekarang
            </Link>
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

      {/* Tab deskripsi */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100">
          {(["deskripsi", "spesifikasi"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-sm font-semibold capitalize transition-colors ${activeTab === tab ? "text-[#1E2753] border-b-2 border-[#1E2753]" : "text-gray-500 hover:text-gray-700"}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="p-6">
          {activeTab === "deskripsi" ? (
            <p className="text-sm text-gray-600 leading-relaxed">{product.description || "Tidak ada deskripsi."}</p>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex py-2 border-b border-gray-100">
                <span className="w-36 text-gray-500">Kategori</span>
                <span className="font-medium text-gray-800">{product.category}</span>
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
