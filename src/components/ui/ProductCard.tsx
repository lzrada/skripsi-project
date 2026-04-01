import Link from "next/link";
import { FiHeart, FiShoppingCart, FiStar } from "react-icons/fi";
import { HiOutlineFire } from "react-icons/hi";

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  condition: "baru" | "bekas";
  stock: number;
  sold: number;
  rating: number;
  badge?: "sale" | "new" | "best" | "limited";
}

interface ProductCardProps {
  product: Product;
}

const badgeConfig = {
  sale: { label: "DISKON", bg: "bg-red-500" },
  new: { label: "BARU", bg: "bg-green-500" },
  best: { label: "TERLARIS", bg: "bg-amber-500" },
  limited: { label: "STOK TERBATAS", bg: "bg-purple-600" },
};

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

export default function ProductCard({ product }: ProductCardProps) {
  const gradient = categoryGradient[product.category] ?? "from-gray-600 to-gray-800";
  const emoji = categoryEmoji[product.category] ?? "📦";

  const discountPercent = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : null;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 hover:-translate-y-1 transition-all duration-300 flex flex-col">
      {/* Gambar / placeholder */}
      <Link href={`/user/product-detail/${product.id}`} className="relative block">
        <div className={`h-48 bg-linear-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}>
          {/* Emoji produk */}
          <span className="text-6xl opacity-60 group-hover:scale-110 transition-transform duration-300">{emoji}</span>

          {/* Badge atas kiri */}
          {product.badge && <span className={`absolute top-2 left-2 ${badgeConfig[product.badge].bg} text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}>{badgeConfig[product.badge].label}</span>}

          {/* Kondisi atas kanan */}
          <span className={`absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${product.condition === "baru" ? "bg-white/20 text-white" : "bg-amber-400/80 text-amber-900"}`}>
            {product.condition === "baru" ? "Baru" : "Second"}
          </span>

          {/* Persen diskon bawah kiri */}
          {discountPercent && <span className="absolute bottom-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">-{discountPercent}%</span>}
        </div>

        {/* Tombol wishlist — muncul saat hover */}
        <button className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md hover:text-red-500 transition-all duration-200 mt-6">
          <FiHeart className="text-sm" />
        </button>
      </Link>

      {/* Info produk */}
      <div className="p-3 flex flex-col flex-1">
        <Link href={`/user/product-detail/${product.id}`}>
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug hover:text-[#1E2753] transition-colors mb-1">{product.name}</h3>
        </Link>

        {/* Rating & terjual */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-0.5">
            <FiStar className="text-yellow-400 text-xs fill-yellow-400" />
            <span className="text-xs text-gray-500 font-medium">{product.rating}</span>
          </div>
          <span className="text-gray-300 text-xs">|</span>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <HiOutlineFire className="text-orange-400" />
            <span>Terjual {product.sold}</span>
          </div>
        </div>

        {/* Harga */}
        <div className="mt-auto">
          {product.originalPrice && <p className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</p>}
          <p className="text-base font-bold text-[#1E2753]">{formatPrice(product.price)}</p>
        </div>

        {/* Peringatan stok */}
        {product.stock <= 3 && <p className="text-[10px] text-red-500 font-medium mt-1">Sisa {product.stock} lagi!</p>}

        {/* Tombol keranjang */}
        <button className="mt-2 w-full py-2 border-2 border-[#1E2753] text-[#1E2753] rounded-xl text-xs font-semibold hover:bg-[#1E2753] hover:text-white transition-all duration-200 flex items-center justify-center gap-1.5">
          <FiShoppingCart className="text-sm" />
          Keranjang
        </button>
      </div>
    </div>
  );
}
