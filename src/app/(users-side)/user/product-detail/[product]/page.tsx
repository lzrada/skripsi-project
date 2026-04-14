"use client";

import { useState, use } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping, faBagShopping, faHeart, faStar, faFire, faShield, faTruck, faRotateLeft, faChevronLeft, faChevronRight, faStore } from "@fortawesome/free-solid-svg-icons";
import ProductCard, { Product } from "@/components/ui/ProductCard";

// Data dummy — nanti diganti dari Firebase
const productData: Record<string, Product & { description: string; specs: Record<string, string> }> = {
  "1": {
    id: "1",
    name: 'Smart TV Samsung 43" 4K UHD',
    price: 4999000,
    originalPrice: 6500000,
    category: "Televisi",
    condition: "baru",
    stock: 5,
    sold: 120,
    rating: 4.8,
    badge: "sale",
    description:
      "Smart TV Samsung 43 inci dengan resolusi 4K UHD menghadirkan gambar yang jernih dan tajam. Dilengkapi dengan fitur Smart TV terbaru, Anda dapat menikmati berbagai konten streaming seperti Netflix, YouTube, dan lainnya langsung dari TV ini.",
    specs: {
      Merek: "Samsung",
      Tipe: "UA43AU7700",
      Ukuran: "43 inci",
      Resolusi: "4K UHD (3840 x 2160)",
      "Panel Type": "LED",
      "Smart TV": "Ya (Tizen OS)",
      WiFi: "Ya",
      HDMI: "3 Port",
      USB: "2 Port",
      Garansi: "1 Tahun Resmi",
    },
  },
  "2": {
    id: "2",
    name: "Kulkas 2 Pintu Sharp 280L",
    price: 3450000,
    category: "Kulkas",
    condition: "baru",
    stock: 8,
    sold: 85,
    rating: 4.7,
    badge: "best",
    description: "Kulkas 2 pintu Sharp dengan kapasitas 280 liter, cocok untuk keluarga. Dilengkapi teknologi J-Tech Inverter yang hemat listrik hingga 40% dibanding kulkas konvensional.",
    specs: {
      Merek: "Sharp",
      Tipe: "SJ-286MDP",
      Kapasitas: "280 Liter",
      Pintu: "2 Pintu",
      Teknologi: "J-Tech Inverter",
      "Hemat Listrik": "Hingga 40%",
      Warna: "Hitam / Silver",
      Garansi: "2 Tahun Resmi",
    },
  },
};

// Produk rekomendasi
const relatedProducts: Product[] = [
  {
    id: "3",
    name: "AC Daikin 1 PK Low Watt",
    price: 3850000,
    originalPrice: 4200000,
    category: "AC",
    condition: "baru",
    stock: 3,
    sold: 200,
    rating: 4.9,
    badge: "sale",
  },
  {
    id: "4",
    name: "Mesin Cuci Front Load LG 8kg",
    price: 4200000,
    category: "Mesin Cuci",
    condition: "baru",
    stock: 6,
    sold: 67,
    rating: 4.6,
    badge: "new",
  },
  {
    id: "5",
    name: "Kipas Angin Miyako 16 inci",
    price: 285000,
    category: "Kipas Angin",
    condition: "baru",
    stock: 20,
    sold: 340,
    rating: 4.5,
  },
  {
    id: "8",
    name: "Speaker Bluetooth Advance",
    price: 320000,
    originalPrice: 450000,
    category: "Audio",
    condition: "baru",
    stock: 15,
    sold: 220,
    rating: 4.5,
    badge: "sale",
  },
];

const categoryGradient: Record<string, string> = {
  Televisi: "from-slate-700 to-slate-900",
  Kulkas: "from-cyan-600 to-blue-800",
  AC: "from-sky-500 to-blue-700",
  "Mesin Cuci": "from-teal-600 to-emerald-800",
  "Kipas Angin": "from-indigo-500 to-violet-700",
  Audio: "from-pink-600 to-rose-800",
  Laptop: "from-gray-700 to-gray-900",
  HP: "from-emerald-600 to-teal-800",
};

const categoryEmoji: Record<string, string> = {
  Televisi: "📺",
  Kulkas: "🧊",
  AC: "❄️",
  "Mesin Cuci": "🌀",
  "Kipas Angin": "💨",
  Audio: "🔊",
  Laptop: "💻",
  HP: "📱",
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

export default function ProductDetailPage({ params }: { params: Promise<{ product: string }> }) {
  const resolvedParams = use(params);

  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<"deskripsi" | "spesifikasi">("deskripsi");
  const [wishlist, setWishlist] = useState(false);

  // Ambil data produk, fallback ke produk pertama jika tidak ditemukan
  const product = productData[resolvedParams.product] ?? productData["1"];

  const gradient = categoryGradient[product.category] ?? "from-gray-600 to-gray-800";
  const emoji = categoryEmoji[product.category] ?? "📦";

  const discountPercent = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : null;

  const handleQty = (type: "inc" | "dec") => {
    if (type === "inc" && qty < product.stock) setQty(qty + 1);
    if (type === "dec" && qty > 1) setQty(qty - 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      {/* BREADCRUMB */}
      <nav className="flex items-center gap-2 text-xs text-gray-400">
        <Link href="/user/dashboard-user" className="hover:text-[#1E2753] transition-colors">
          Beranda
        </Link>
        <span>/</span>
        <Link href="#" className="hover:text-[#1E2753] transition-colors">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-gray-600 font-medium line-clamp-1">{product.name}</span>
      </nav>

      {/* MAIN DETAIL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Gambar produk */}
        <div className="space-y-3">
          <div className={`w-full h-80 md:h-96 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}>
            <span className="text-9xl opacity-50">{emoji}</span>
            {discountPercent && <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">-{discountPercent}%</span>}
            <span className={`absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded-full ${product.condition === "baru" ? "bg-white/20 text-white" : "bg-amber-400/80 text-amber-900"}`}>
              {product.condition === "baru" ? "Baru" : "Second"}
            </span>
          </div>

          {/* Thumbnail dummy */}
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-16 h-16 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center opacity-60 cursor-pointer hover:opacity-100 border-2 transition-all ${i === 1 ? "border-[#1E2753] opacity-100" : "border-transparent"}`}
              >
                <span className="text-2xl">{emoji}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Info produk */}
        <div className="space-y-4">
          {/* Nama & rating */}
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 leading-snug mb-2">{product.name}</h1>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1">
                <FontAwesomeIcon icon={faStar} className="w-4 h-4 text-yellow-400" />
                <span className="font-semibold text-gray-700">{product.rating}</span>
              </div>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-1 text-gray-500">
                <FontAwesomeIcon icon={faFire} className="w-4 h-4 text-orange-400" />
                <span>Terjual {product.sold}</span>
              </div>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-1 text-gray-500">
                <FontAwesomeIcon icon={faStore} className="w-4 h-4 text-[#1E2753]" />
                <span>Stok {product.stock}</span>
              </div>
            </div>
          </div>

          {/* Harga */}
          <div className="bg-gray-50 rounded-xl p-4">
            {product.originalPrice && <p className="text-sm text-gray-400 line-through mb-1">{formatPrice(product.originalPrice)}</p>}
            <p className="text-3xl font-bold text-[#1E2753]">{formatPrice(product.price)}</p>
            {discountPercent && <span className="inline-block mt-1 bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">Hemat {formatPrice(product.originalPrice! - product.price)}</span>}
          </div>

          {/* Keunggulan */}
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

          {/* Quantity */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Jumlah</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => handleQty("dec")} className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors font-bold text-lg">
                  −
                </button>
                <span className="w-12 text-center font-semibold text-gray-800">{qty}</span>
                <button onClick={() => handleQty("inc")} className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors font-bold text-lg">
                  +
                </button>
              </div>
              <span className="text-xs text-gray-400">Stok tersedia: {product.stock}</span>
            </div>
          </div>

          {/* Tombol aksi */}
          <div className="flex gap-3">
            <button className="flex-1 py-3 bg-[#1E2753] text-white rounded-xl font-semibold text-sm hover:bg-[#2a3470] transition-colors flex items-center justify-center gap-2">
              <FontAwesomeIcon icon={faBagShopping} className="w-4 h-4" />
              Beli Sekarang
            </button>
            <button className="flex-1 py-3 border-2 border-[#1E2753] text-[#1E2753] rounded-xl font-semibold text-sm hover:bg-[#1E2753] hover:text-white transition-all flex items-center justify-center gap-2">
              <FontAwesomeIcon icon={faCartShopping} className="w-4 h-4" />
              Keranjang
            </button>
            <button
              onClick={() => setWishlist(!wishlist)}
              className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${wishlist ? "border-red-500 bg-red-50 text-red-500" : "border-gray-200 text-gray-400 hover:border-red-400 hover:text-red-400"}`}
            >
              <FontAwesomeIcon icon={faHeart} className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* TAB DESKRIPSI & SPESIFIKASI */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Tab header */}
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

        {/* Tab konten */}
        <div className="p-6">
          {activeTab === "deskripsi" ? (
            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {Object.entries(product.specs).map(([key, val]) => (
                <div key={key} className="flex py-3 text-sm">
                  <span className="w-40 text-gray-500 flex-shrink-0">{key}</span>
                  <span className="text-gray-800 font-medium">{val}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* PRODUK TERKAIT */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Produk Terkait</h2>
          <Link href="/user/dashboard-user" className="text-sm text-[#1E2753] font-semibold hover:underline">
            Lihat Semua
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {relatedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
