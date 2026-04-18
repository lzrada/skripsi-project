// src/app/(users-side)/user/orders/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faChevronLeft,
  faChevronDown,
  faChevronUp,
  faBoxOpen,
  faCircleCheck,
  faTruck,
  faGear,
  faClock,
  faCircleXmark,
  faRotateLeft,
  faBagShopping,
  faBox,
  faTv,
  faSnowflake,
  faWind,
  faRotate,
  faFan,
  faVolumeHigh,
  faLaptop,
  faMobileScreen,
} from "@fortawesome/free-solid-svg-icons";

// ── Types ────────────────────────────────────────────────────────────
type OrderStatus = "Menunggu Konfirmasi" | "Diproses" | "Dikirim" | "Selesai" | "Dibatalkan";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  category: string;
}

interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  address: string;
}

// ── Dummy data — nanti diganti dari Firestore ────────────────────────
const dummyOrders: Order[] = [
  {
    id: "RZK-10234",
    date: "2025-04-15",
    status: "Menunggu Konfirmasi",
    paymentMethod: "Transfer Bank",
    address: "Jl. Mawar No. 5, Blitar",
    items: [
      { id: "1", name: 'Smart TV Samsung 43" 4K UHD', price: 4999000, qty: 1, category: "Televisi" },
      { id: "5", name: "Kipas Angin Miyako 16 inci", price: 285000, qty: 2, category: "Kipas Angin" },
    ],
    total: 5569000,
  },
  {
    id: "RZK-10198",
    date: "2025-04-10",
    status: "Dikirim",
    paymentMethod: "E-Wallet",
    address: "Jl. Mawar No. 5, Blitar",
    items: [{ id: "3", name: "AC Daikin 1 PK Low Watt", price: 3850000, qty: 1, category: "AC" }],
    total: 3850000,
  },
  {
    id: "RZK-10145",
    date: "2025-03-28",
    status: "Selesai",
    paymentMethod: "COD",
    address: "Jl. Mawar No. 5, Blitar",
    items: [{ id: "2", name: "Kulkas 2 Pintu Sharp 280L", price: 3450000, qty: 1, category: "Kulkas" }],
    total: 3450000,
  },
  {
    id: "RZK-10089",
    date: "2025-03-10",
    status: "Dibatalkan",
    paymentMethod: "Transfer Bank",
    address: "Jl. Mawar No. 5, Blitar",
    items: [{ id: "8", name: "Speaker Bluetooth Advance", price: 320000, qty: 1, category: "Audio" }],
    total: 320000,
  },
];

// ── Helpers ──────────────────────────────────────────────────────────
const categoryIcon: Record<string, IconDefinition> = {
  Televisi: faTv,
  Kulkas: faSnowflake,
  AC: faWind,
  "Mesin Cuci": faRotate,
  "Kipas Angin": faFan,
  Audio: faVolumeHigh,
  Laptop: faLaptop,
  HP: faMobileScreen,
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

const statusConfig: Record<OrderStatus, { label: string; color: string; bg: string; icon: IconDefinition }> = {
  "Menunggu Konfirmasi": { label: "Menunggu Konfirmasi", color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: faClock },
  Diproses: { label: "Diproses", color: "text-blue-600", bg: "bg-blue-50 border-blue-200", icon: faGear },
  Dikirim: { label: "Dikirim", color: "text-purple-600", bg: "bg-purple-50 border-purple-200", icon: faTruck },
  Selesai: { label: "Selesai", color: "text-green-600", bg: "bg-green-50 border-green-200", icon: faCircleCheck },
  Dibatalkan: { label: "Dibatalkan", color: "text-red-500", bg: "bg-red-50 border-red-200", icon: faCircleXmark },
};

const tabs: { label: string; value: OrderStatus | "Semua" }[] = [
  { label: "Semua", value: "Semua" },
  { label: "Menunggu", value: "Menunggu Konfirmasi" },
  { label: "Diproses", value: "Diproses" },
  { label: "Dikirim", value: "Dikirim" },
  { label: "Selesai", value: "Selesai" },
  { label: "Dibatalkan", value: "Dibatalkan" },
];

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

// ── Komponen Card per Order ──────────────────────────────────────────
function OrderCard({ order, onCancel }: { order: Order; onCancel: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const status = statusConfig[order.status];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-700">#{order.id}</span>
          <span className="text-gray-300 text-xs">•</span>
          <span className="text-xs text-gray-400">{formatDate(order.date)}</span>
        </div>
        <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${status.bg} ${status.color}`}>
          <FontAwesomeIcon icon={status.icon} className="w-3 h-3" />
          {status.label}
        </span>
      </div>

      {/* Items */}
      <div className="px-4 py-3 space-y-2">
        {(expanded ? order.items : order.items.slice(0, 1)).map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${categoryGradient[item.category] ?? "from-gray-600 to-gray-800"} flex items-center justify-center flex-shrink-0`}>
              <FontAwesomeIcon icon={categoryIcon[item.category] ?? faBox} className="w-5 h-5 text-white/80" />
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

        {/* Toggle expand */}
        {order.items.length > 1 && (
          <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-xs text-[#1E2753] font-medium hover:underline">
            <FontAwesomeIcon icon={expanded ? faChevronUp : faChevronDown} className="w-3 h-3" />
            {expanded ? "Sembunyikan" : `+${order.items.length - 1} produk lainnya`}
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs text-gray-400">Total Pembayaran</p>
          <p className="text-base font-bold text-[#1E2753]">{formatPrice(order.total)}</p>
        </div>

        <div className="flex gap-2">
          <Link href={`/user/orders/${order.id}`} className="px-3 py-2 border-2 border-[#1E2753] text-[#1E2753] rounded-xl text-xs font-semibold hover:bg-[#1E2753] hover:text-white transition-all">
            Lihat Detail
          </Link>

          {order.status === "Menunggu Konfirmasi" && (
            <button onClick={() => onCancel(order.id)} className="px-3 py-2 border-2 border-red-400 text-red-500 rounded-xl text-xs font-semibold hover:bg-red-500 hover:text-white transition-all">
              Batalkan
            </button>
          )}

          {order.status === "Selesai" && (
            <Link href="/user/dashboard-user" className="flex items-center gap-1.5 px-3 py-2 bg-[#1E2753] text-white rounded-xl text-xs font-semibold hover:bg-[#2a3470] transition-all">
              <FontAwesomeIcon icon={faRotateLeft} className="w-3 h-3" />
              Beli Lagi
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Modal Konfirmasi Cancel ──────────────────────────────────────────
function CancelModal({ orderId, onConfirm, onClose }: { orderId: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faCircleXmark} className="w-7 h-7 text-red-500" />
            </div>
            <p className="text-gray-800 font-bold text-lg">Batalkan Pesanan?</p>
            <p className="text-sm text-gray-500">
              Pesanan <span className="font-semibold text-gray-700">#{orderId}</span> akan dibatalkan. Tindakan ini tidak bisa diurungkan.
            </p>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={onClose} className="flex-1 py-2.5 border-2 border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
              Kembali
            </button>
            <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors">
              Ya, Batalkan
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main Page ────────────────────────────────────────────────────────
export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<OrderStatus | "Semua">("Semua");
  const [orders, setOrders] = useState<Order[]>(dummyOrders);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);

  const filtered = activeTab === "Semua" ? orders : orders.filter((o) => o.status === activeTab);

  const confirmCancel = () => {
    setOrders((prev) => prev.map((o) => (o.id === cancelTarget ? { ...o, status: "Dibatalkan" as OrderStatus } : o)));
    setCancelTarget(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/user/dashboard-user" className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500">
          <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Pesanan Saya</h1>
          <p className="text-xs text-gray-400">{orders.length} pesanan</p>
        </div>
      </div>

      {/* Tab filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
        {tabs.map((tab) => {
          const count = tab.value === "Semua" ? orders.length : orders.filter((o) => o.status === tab.value).length;

          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                activeTab === tab.value ? "bg-[#1E2753] text-white border-[#1E2753]" : "bg-white text-gray-500 border-gray-200 hover:border-[#1E2753] hover:text-[#1E2753]"
              }`}
            >
              {tab.label}
              {count > 0 && <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab.value ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* List order */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} onCancel={setCancelTarget} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <FontAwesomeIcon icon={faBoxOpen} className="w-12 h-12 text-gray-200" />
          <p className="font-semibold">Belum ada pesanan</p>
          <Link href="/user/dashboard-user" className="flex items-center gap-2 mt-2 px-5 py-2.5 bg-[#1E2753] text-white rounded-xl text-sm font-semibold hover:bg-[#2a3470] transition-colors">
            <FontAwesomeIcon icon={faBagShopping} className="w-4 h-4" />
            Mulai Belanja
          </Link>
        </div>
      )}

      {/* Modal cancel */}
      {cancelTarget && <CancelModal orderId={cancelTarget} onConfirm={confirmCancel} onClose={() => setCancelTarget(null)} />}
    </div>
  );
}
