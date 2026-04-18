"use client";

import { use } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faLocationDot, faMoneyBill, faWallet, faTruck, faCreditCard, faBox, faHeadset, faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { categoryIcon, categoryGradient, defaultCategoryIcon, defaultGradient } from "@/constants/category";
import { type Order, statusConfig } from "@/types/order";
import OrderTracking from "@/components/(user)/orders/OrderTracking";

// Dummy data — nanti diganti fetch Firestore by id
const dummyOrders: Record<string, Order> = {
  "RZK-10234": {
    id: "RZK-10234",
    date: "2025-04-15",
    status: "Menunggu Konfirmasi",
    paymentMethod: "Transfer Bank",
    address: "Jl. Mawar No. 5, RT 02/RW 03, Blitar",
    phone: "0812-3456-7890",
    recipientName: "Budi Santoso",
    note: "Titip di depan pagar",
    items: [
      { id: "1", name: 'Smart TV Samsung 43" 4K UHD', price: 4999000, qty: 1, category: "Televisi" },
      { id: "5", name: "Kipas Angin Miyako 16 inci", price: 285000, qty: 2, category: "Kipas Angin" },
    ],
    total: 5569000,
  },
  "RZK-10198": {
    id: "RZK-10198",
    date: "2025-04-10",
    status: "Dikirim",
    paymentMethod: "E-Wallet",
    address: "Jl. Mawar No. 5, RT 02/RW 03, Blitar",
    phone: "0812-3456-7890",
    recipientName: "Budi Santoso",
    items: [{ id: "3", name: "AC Daikin 1 PK Low Watt", price: 3850000, qty: 1, category: "AC" }],
    total: 3850000,
  },
  "RZK-10145": {
    id: "RZK-10145",
    date: "2025-03-28",
    status: "Selesai",
    paymentMethod: "COD",
    address: "Jl. Mawar No. 5, RT 02/RW 03, Blitar",
    phone: "0812-3456-7890",
    recipientName: "Budi Santoso",
    items: [{ id: "2", name: "Kulkas 2 Pintu Sharp 280L", price: 3450000, qty: 1, category: "Kulkas" }],
    total: 3450000,
  },
  "RZK-10089": {
    id: "RZK-10089",
    date: "2025-03-10",
    status: "Dibatalkan",
    paymentMethod: "Transfer Bank",
    address: "Jl. Mawar No. 5, RT 02/RW 03, Blitar",
    phone: "0812-3456-7890",
    recipientName: "Budi Santoso",
    items: [{ id: "8", name: "Speaker Bluetooth Advance", price: 320000, qty: 1, category: "Audio" }],
    total: 320000,
  },
};

const paymentIcon: Record<string, IconDefinition> = {
  "Transfer Bank": faMoneyBill,
  "E-Wallet": faWallet,
  COD: faTruck,
  "Kartu Kredit / Debit": faCreditCard,
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const decodedId = decodeURIComponent(id);
  const order = dummyOrders[decodedId];

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 flex flex-col items-center gap-4 text-gray-400">
        <FontAwesomeIcon icon={faBox} className="w-12 h-12 text-gray-200" />
        <p className="font-semibold text-gray-600">Pesanan tidak ditemukan</p>
        <Link href="/user/orders" className="px-5 py-2.5 bg-[#1E2753] text-white rounded-xl text-sm font-semibold hover:bg-[#2a3470] transition-colors">
          Kembali ke Pesanan
        </Link>
      </div>
    );
  }

  const status = statusConfig[order.status];
  const subtotal = order.items.reduce((acc, i) => acc + i.price * i.qty, 0);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/user/orders" className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500">
          <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Detail Pesanan</h1>
          <p className="text-xs text-gray-400">
            #{order.id} • {formatDate(order.date)}
          </p>
        </div>
        <span className={`ml-auto flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${status.bg} ${status.color}`}>
          <FontAwesomeIcon icon={status.icon} className="w-3 h-3" />
          {status.label}
        </span>
      </div>

      {/* Tracking */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm font-bold text-gray-800 mb-5">Status Pesanan</p>
        <OrderTracking status={order.status} />
      </div>

      {/* Alamat */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-3">
          <FontAwesomeIcon icon={faLocationDot} className="w-4 h-4 text-[#E85D04]" />
          <p className="text-sm font-bold text-gray-800">Alamat Pengiriman</p>
        </div>
        <p className="text-sm font-semibold text-gray-700">{order.recipientName}</p>
        <p className="text-xs text-gray-500 mt-0.5">{order.phone}</p>
        <p className="text-xs text-gray-500 mt-0.5">{order.address}</p>
        {order.note && <p className="text-xs text-gray-400 mt-1 italic">Catatan: {order.note}</p>}
      </div>

      {/* Produk */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm font-bold text-gray-800 mb-4">Produk Dipesan</p>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${categoryGradient[item.category] ?? defaultGradient} flex items-center justify-center flex-shrink-0`}>
                <FontAwesomeIcon icon={categoryIcon[item.category] ?? defaultCategoryIcon} className="w-5 h-5 text-white/80" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 line-clamp-1">{item.name}</p>
                <p className="text-xs text-gray-400">
                  x{item.qty} • {formatPrice(item.price)}
                </p>
              </div>
              <p className="text-sm font-bold text-[#1E2753] flex-shrink-0">{formatPrice(item.price * item.qty)}</p>
            </div>
          ))}
        </div>

        {/* Rincian harga */}
        <div className="border-t border-gray-100 mt-4 pt-4 space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Subtotal ({order.items.length} produk)</span>
            <span className="font-medium text-gray-700">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Ongkos Kirim</span>
            <span className="font-medium text-green-600">Gratis</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-gray-800 pt-2 border-t border-gray-100">
            <span>Total Pembayaran</span>
            <span className="text-[#1E2753]">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Pembayaran */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm font-bold text-gray-800 mb-3">Informasi Pembayaran</p>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
            <FontAwesomeIcon icon={paymentIcon[order.paymentMethod] ?? faMoneyBill} className="w-4 h-4 text-[#1E2753]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">{order.paymentMethod}</p>
            <p className="text-xs text-gray-400">{order.status === "Menunggu Konfirmasi" ? "Menunggu konfirmasi pembayaran" : "Pembayaran dikonfirmasi"}</p>
          </div>
        </div>
      </div>

      {/* Tombol aksi */}
      <div className="flex gap-3 pb-4">
        <a
          href="https://wa.me/62"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:border-[#1E2753] hover:text-[#1E2753] transition-all"
        >
          <FontAwesomeIcon icon={faHeadset} className="w-4 h-4" />
          Hubungi CS
        </a>

        {order.status === "Selesai" && (
          <Link href="/user/dashboard-user" className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1E2753] text-white rounded-xl text-sm font-semibold hover:bg-[#2a3470] transition-all">
            <FontAwesomeIcon icon={faRotateLeft} className="w-4 h-4" />
            Beli Lagi
          </Link>
        )}
      </div>
    </div>
  );
}
