"use client";

import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faCartShopping, faChevronLeft, faTag, faTruck, faShield, faTicket } from "@fortawesome/free-solid-svg-icons";

interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  condition: "baru" | "bekas";
  stock: number;
  qty: number;
}

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

const initialCart: CartItem[] = [
  {
    id: "1",
    name: 'Smart TV Samsung 43" 4K UHD',
    price: 4999000,
    originalPrice: 6500000,
    category: "Televisi",
    condition: "baru",
    stock: 5,
    qty: 1,
  },
  {
    id: "3",
    name: "AC Daikin 1 PK Low Watt",
    price: 3850000,
    originalPrice: 4200000,
    category: "AC",
    condition: "baru",
    stock: 3,
    qty: 1,
  },
  {
    id: "5",
    name: "Kipas Angin Miyako 16 inci",
    price: 285000,
    category: "Kipas Angin",
    condition: "baru",
    stock: 20,
    qty: 2,
  },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCart);
  const [selectedIds, setSelectedIds] = useState<string[]>(initialCart.map((i) => i.id));
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  // Update qty
  const updateQty = (id: string, type: "inc" | "dec") => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (type === "inc" && item.qty < item.stock) return { ...item, qty: item.qty + 1 };
        if (type === "dec" && item.qty > 1) return { ...item, qty: item.qty - 1 };
        return item;
      }),
    );
  };

  // Hapus item
  const removeItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    setSelectedIds((prev) => prev.filter((i) => i !== id));
  };

  // Toggle select item
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  // Select all
  const toggleSelectAll = () => {
    if (selectedIds.length === cartItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cartItems.map((i) => i.id));
    }
  };

  // Hitung total
  const selectedItems = cartItems.filter((i) => selectedIds.includes(i.id));
  const subtotal = selectedItems.reduce((acc, i) => acc + i.price * i.qty, 0);
  const ongkir = subtotal > 0 ? 0 : 0; // gratis ongkir
  const diskonKupon = couponApplied ? 50000 : 0;
  const total = subtotal + ongkir - diskonKupon;

  const handleCoupon = () => {
    if (coupon.toLowerCase() === "rizky50") {
      setCouponApplied(true);
    } else {
      alert("Kode kupon tidak valid!");
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center gap-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
          <FontAwesomeIcon icon={faCartShopping} className="w-10 h-10 text-gray-300" />
        </div>
        <p className="text-xl font-bold text-gray-700">Keranjang kamu kosong</p>
        <p className="text-sm text-gray-400">Yuk mulai belanja produk elektronik favoritmu!</p>
        <Link href="/user/dashboard-user" className="mt-2 px-6 py-3 bg-[#1E2753] text-white rounded-xl font-semibold text-sm hover:bg-[#2a3470] transition-colors">
          Mulai Belanja
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/user/dashboard-user" className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500">
          <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Keranjang Belanja</h1>
          <p className="text-xs text-gray-400">{cartItems.length} produk</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kiri — daftar produk */}
        <div className="lg:col-span-2 space-y-3">
          {/* Select all */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-center justify-between">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={selectedIds.length === cartItems.length} onChange={toggleSelectAll} className="w-4 h-4 accent-[#1E2753] cursor-pointer" />
              <span className="text-sm font-semibold text-gray-700">Pilih Semua ({cartItems.length})</span>
            </label>
            {selectedIds.length > 0 && (
              <button
                onClick={() => {
                  setCartItems((prev) => prev.filter((i) => !selectedIds.includes(i.id)));
                  setSelectedIds([]);
                }}
                className="text-xs text-red-500 hover:underline font-medium"
              >
                Hapus Dipilih
              </button>
            )}
          </div>

          {/* Cart items */}
          {cartItems.map((item) => {
            const gradient = categoryGradient[item.category] ?? "from-gray-600 to-gray-800";
            const emoji = categoryEmoji[item.category] ?? "📦";
            const isSelected = selectedIds.includes(item.id);

            return (
              <div key={item.id} className={`bg-white rounded-2xl border shadow-sm p-4 transition-all duration-200 ${isSelected ? "border-[#1E2753]" : "border-gray-100"}`}>
                <div className="flex gap-4">
                  {/* Checkbox */}
                  <div className="flex items-start pt-1">
                    <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(item.id)} className="w-4 h-4 accent-[#1E2753] cursor-pointer" />
                  </div>

                  {/* Gambar */}
                  <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-3xl">{emoji}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">{item.name}</p>
                        <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.condition === "baru" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"}`}>
                          {item.condition === "baru" ? "Baru" : "Second"}
                        </span>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 mt-0.5">
                        <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Harga & qty */}
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        {item.originalPrice && <p className="text-xs text-gray-400 line-through">{formatPrice(item.originalPrice)}</p>}
                        <p className="text-base font-bold text-[#1E2753]">{formatPrice(item.price)}</p>
                      </div>

                      {/* Qty counter */}
                      <div className="flex items-center border-2 border-gray-100 rounded-xl overflow-hidden">
                        <button onClick={() => updateQty(item.id, "dec")} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors font-bold">
                          −
                        </button>
                        <span className="w-10 text-center text-sm font-semibold text-gray-800">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, "inc")} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors font-bold">
                          +
                        </button>
                      </div>
                    </div>

                    {/* Subtotal per item */}
                    <p className="text-xs text-gray-400 mt-1 text-right">
                      Subtotal: <span className="font-semibold text-gray-600">{formatPrice(item.price * item.qty)}</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Info gratis ongkir */}
          <div className="bg-green-50 border border-green-100 rounded-2xl px-4 py-3 flex items-center gap-3">
            <FontAwesomeIcon icon={faTruck} className="w-4 h-4 text-green-500 flex-shrink-0" />
            <p className="text-xs text-green-700 font-medium">
              Selamat! Kamu mendapat <span className="font-bold">gratis ongkir</span> untuk wilayah Blitar & sekitarnya.
            </p>
          </div>
        </div>

        {/* Kanan — ringkasan */}
        <div className="space-y-4">
          {/* Kupon */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <FontAwesomeIcon icon={faTicket} className="w-4 h-4 text-[#E85D04]" />
              <p className="text-sm font-bold text-gray-800">Kode Kupon</p>
            </div>
            {couponApplied ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                <div>
                  <p className="text-xs font-bold text-green-700">RIZKY50 berhasil dipakai!</p>
                  <p className="text-xs text-green-600">Hemat {formatPrice(50000)}</p>
                </div>
                <button
                  onClick={() => {
                    setCouponApplied(false);
                    setCoupon("");
                  }}
                  className="text-xs text-red-500 hover:underline"
                >
                  Hapus
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="Masukkan kode kupon"
                  className="flex-1 border-2 border-gray-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1E2753] transition-colors"
                />
                <button onClick={handleCoupon} className="px-3 py-2 bg-[#1E2753] text-white rounded-xl text-xs font-semibold hover:bg-[#2a3470] transition-colors">
                  Pakai
                </button>
              </div>
            )}
          </div>

          {/* Ringkasan belanja */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
            <p className="text-sm font-bold text-gray-800">Ringkasan Belanja</p>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Total Harga ({selectedItems.length} produk)</span>
                <span className="font-medium text-gray-700">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Ongkos Kirim</span>
                <span className="font-medium text-green-600">Gratis</span>
              </div>
              {couponApplied && (
                <div className="flex justify-between text-gray-500">
                  <span>Diskon Kupon</span>
                  <span className="font-medium text-red-500">-{formatPrice(diskonKupon)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
              <span className="text-sm font-bold text-gray-800">Total Pembayaran</span>
              <span className="text-lg font-bold text-[#1E2753]">{formatPrice(total)}</span>
            </div>

            <Link
              href="/user/checkout"
              className={`block w-full py-3 rounded-xl text-center font-bold text-sm transition-all duration-200 ${selectedIds.length > 0 ? "bg-[#1E2753] text-white hover:bg-[#2a3470]" : "bg-gray-100 text-gray-400 pointer-events-none"}`}
            >
              Checkout ({selectedIds.length} produk)
            </Link>
          </div>

          {/* Jaminan */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2">
            {[
              { icon: faShield, text: "Transaksi aman & terpercaya", color: "text-blue-500" },
              { icon: faTruck, text: "Gratis ongkir wilayah Blitar", color: "text-green-500" },
              { icon: faTag, text: "Harga terbaik dijamin", color: "text-orange-500" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <FontAwesomeIcon icon={item.icon} className={`w-4 h-4 ${item.color} flex-shrink-0`} />
                <span className="text-xs text-gray-500">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
