"use client";

import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faBoxOpen, faBagShopping } from "@fortawesome/free-solid-svg-icons";
import { type Order, type OrderStatus } from "@/types/order";
import OrderCard from "@/components/(user)/orders/OrderCard";
import CancelModal from "@/components/(user)/orders/CancelModal";

const dummyOrders: Order[] = [
  {
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
  {
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
  {
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
  {
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
];

const tabs: { label: string; value: OrderStatus | "Semua" }[] = [
  { label: "Semua", value: "Semua" },
  { label: "Menunggu", value: "Menunggu Konfirmasi" },
  { label: "Diproses", value: "Diproses" },
  { label: "Dikirim", value: "Dikirim" },
  { label: "Selesai", value: "Selesai" },
  { label: "Dibatalkan", value: "Dibatalkan" },
];

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

      {/* List */}
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

      {cancelTarget && <CancelModal orderId={cancelTarget} onConfirm={confirmCancel} onClose={() => setCancelTarget(null)} />}
    </div>
  );
}
