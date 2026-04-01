"use client";

import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faLocationDot, faPlus, faTruck, faShield, faMoneyBill, faCreditCard, faWallet, faChevronDown, faChevronUp, faCircleCheck } from "@fortawesome/free-solid-svg-icons";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  category: string;
}

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

const orderItems: OrderItem[] = [
  { id: "1", name: 'Smart TV Samsung 43" 4K UHD', price: 4999000, qty: 1, category: "Televisi" },
  { id: "3", name: "AC Daikin 1 PK Low Watt", price: 3850000, qty: 1, category: "AC" },
  { id: "5", name: "Kipas Angin Miyako 16 inci", price: 285000, qty: 2, category: "Kipas Angin" },
];

const paymentMethods = [
  {
    id: "transfer",
    label: "Transfer Bank",
    desc: "BCA, BRI, BNI, Mandiri",
    icon: faMoneyBill,
    color: "text-blue-500",
  },
  {
    id: "kartu",
    label: "Kartu Kredit / Debit",
    desc: "Visa, Mastercard",
    icon: faCreditCard,
    color: "text-purple-500",
  },
  {
    id: "ewallet",
    label: "E-Wallet",
    desc: "GoPay, OVO, Dana, ShopeePay",
    icon: faWallet,
    color: "text-green-500",
  },
  {
    id: "cod",
    label: "Bayar di Tempat (COD)",
    desc: "Hanya wilayah Blitar & sekitarnya",
    icon: faTruck,
    color: "text-orange-500",
  },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

export default function CheckoutPage() {
  const [selectedPayment, setSelectedPayment] = useState("transfer");
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [form, setForm] = useState({
    nama: "",
    telepon: "",
    alamat: "",
    kota: "",
    kodePos: "",
    catatan: "",
  });

  const subtotal = orderItems.reduce((acc, i) => acc + i.price * i.qty, 0);
  const ongkir = 0;
  const total = subtotal + ongkir;

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOrder = () => {
    if (!form.nama || !form.telepon || !form.alamat) {
      alert("Lengkapi data pengiriman terlebih dahulu!");
      return;
    }
    setIsSuccess(true);
  };

  // Halaman sukses
  if (isSuccess) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 flex flex-col items-center text-center gap-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <FontAwesomeIcon icon={faCircleCheck} className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Pesanan Berhasil!</h1>
        <p className="text-sm text-gray-500 max-w-xs">Pesananmu sedang diproses. Kami akan segera menghubungi kamu untuk konfirmasi.</p>
        <div className="w-full bg-gray-50 rounded-2xl p-4 text-left space-y-2 mt-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">No. Pesanan</span>
            <span className="font-bold text-gray-800">#RZK-{Math.floor(Math.random() * 90000) + 10000}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total Bayar</span>
            <span className="font-bold text-[#1E2753]">{formatPrice(total)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Metode Bayar</span>
            <span className="font-bold text-gray-800">{paymentMethods.find((p) => p.id === selectedPayment)?.label}</span>
          </div>
        </div>
        <div className="flex gap-3 w-full mt-2">
          <Link href="/user/dashboard-user" className="flex-1 py-3 border-2 border-[#1E2753] text-[#1E2753] rounded-xl font-semibold text-sm text-center hover:bg-gray-50 transition-colors">
            Kembali Belanja
          </Link>
          <Link href="/user/orders" className="flex-1 py-3 bg-[#1E2753] text-white rounded-xl font-semibold text-sm text-center hover:bg-[#2a3470] transition-colors">
            Lihat Pesanan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/user/cart" className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500">
          <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Checkout</h1>
          <p className="text-xs text-gray-400">{orderItems.length} produk</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kiri — form & pembayaran */}
        <div className="lg:col-span-2 space-y-4">
          {/* Alamat pengiriman */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faLocationDot} className="w-4 h-4 text-[#E85D04]" />
                <p className="text-sm font-bold text-gray-800">Alamat Pengiriman</p>
              </div>
              <button className="flex items-center gap-1 text-xs text-[#1E2753] font-semibold hover:underline">
                <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
                Tambah Alamat
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">
                  Nama Lengkap <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="nama"
                  value={form.nama}
                  onChange={handleInput}
                  placeholder="Masukkan nama lengkap"
                  className="w-full border-2 border-gray-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E2753] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">
                  No. Telepon <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  name="telepon"
                  value={form.telepon}
                  onChange={handleInput}
                  placeholder="08xx-xxxx-xxxx"
                  className="w-full border-2 border-gray-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E2753] transition-colors"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-gray-600 mb-1 block">
                  Alamat Lengkap <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="alamat"
                  value={form.alamat}
                  onChange={handleInput}
                  placeholder="Nama jalan, No. rumah, RT/RW"
                  className="w-full border-2 border-gray-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E2753] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Kota / Kabupaten</label>
                <input
                  type="text"
                  name="kota"
                  value={form.kota}
                  onChange={handleInput}
                  placeholder="Contoh: Blitar"
                  className="w-full border-2 border-gray-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E2753] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Kode Pos</label>
                <input
                  type="text"
                  name="kodePos"
                  value={form.kodePos}
                  onChange={handleInput}
                  placeholder="Contoh: 66181"
                  className="w-full border-2 border-gray-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E2753] transition-colors"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Catatan (opsional)</label>
                <textarea
                  name="catatan"
                  value={form.catatan}
                  onChange={handleInput}
                  placeholder="Contoh: Titip di depan pagar"
                  rows={2}
                  className="w-full border-2 border-gray-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E2753] transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Pengiriman */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <FontAwesomeIcon icon={faTruck} className="w-4 h-4 text-[#1E2753]" />
              <p className="text-sm font-bold text-gray-800">Metode Pengiriman</p>
            </div>
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-green-700">Pengiriman Toko</p>
                <p className="text-xs text-green-600">Estimasi 1-2 hari • Wilayah Blitar & sekitarnya</p>
              </div>
              <span className="text-sm font-bold text-green-600">GRATIS</span>
            </div>
          </div>

          {/* Metode pembayaran */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <FontAwesomeIcon icon={faShield} className="w-4 h-4 text-[#1E2753]" />
              <p className="text-sm font-bold text-gray-800">Metode Pembayaran</p>
            </div>
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center gap-4 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${selectedPayment === method.id ? "border-[#1E2753] bg-blue-50" : "border-gray-100 hover:border-gray-200"}`}
                >
                  <input type="radio" name="payment" value={method.id} checked={selectedPayment === method.id} onChange={() => setSelectedPayment(method.id)} className="accent-[#1E2753]" />
                  <div className={`w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0`}>
                    <FontAwesomeIcon icon={method.icon} className={`w-4 h-4 ${method.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{method.label}</p>
                    <p className="text-xs text-gray-400">{method.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Kanan — ringkasan */}
        <div className="space-y-4">
          {/* Detail produk */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <button onClick={() => setShowOrderDetail(!showOrderDetail)} className="w-full flex items-center justify-between">
              <p className="text-sm font-bold text-gray-800">Detail Produk ({orderItems.length})</p>
              <FontAwesomeIcon icon={showOrderDetail ? faChevronUp : faChevronDown} className="w-3 h-3 text-gray-400" />
            </button>

            {showOrderDetail && (
              <div className="mt-3 space-y-3">
                {orderItems.map((item) => {
                  const gradient = categoryGradient[item.category] ?? "from-gray-600 to-gray-800";
                  const emoji = categoryEmoji[item.category] ?? "📦";
                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-xl">{emoji}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-700 line-clamp-1">{item.name}</p>
                        <p className="text-xs text-gray-400">x{item.qty}</p>
                      </div>
                      <p className="text-xs font-bold text-[#1E2753] flex-shrink-0">{formatPrice(item.price * item.qty)}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Ringkasan bayar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
            <p className="text-sm font-bold text-gray-800">Ringkasan Pembayaran</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal Produk</span>
                <span className="font-medium text-gray-700">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Ongkos Kirim</span>
                <span className="font-medium text-green-600">Gratis</span>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
              <span className="text-sm font-bold text-gray-800">Total Pembayaran</span>
              <span className="text-lg font-bold text-[#1E2753]">{formatPrice(total)}</span>
            </div>

            <button onClick={handleOrder} className="w-full py-3 bg-[#1E2753] text-white rounded-xl font-bold text-sm hover:bg-[#2a3470] transition-colors">
              Buat Pesanan
            </button>

            <p className="text-[10px] text-gray-400 text-center leading-relaxed">Dengan menekan tombol di atas, kamu menyetujui syarat & ketentuan yang berlaku di Rizky Elektronik.</p>
          </div>

          {/* Jaminan */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2">
            {[
              { icon: faShield, text: "Pembayaran aman via Midtrans", color: "text-blue-500" },
              { icon: faTruck, text: "Gratis ongkir wilayah Blitar", color: "text-green-500" },
              { icon: faCircleCheck, text: "Garansi uang kembali", color: "text-orange-500" },
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
