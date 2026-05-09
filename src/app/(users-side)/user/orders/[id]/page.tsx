"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faBoxOpen, faBagShopping } from "@fortawesome/free-solid-svg-icons";
import { type Order, type OrderStatus } from "@/types/order";
import OrderCard from "@/components/(user)/orders/OrderCard";
import CancelModal from "@/components/(user)/orders/CancelModal";
import { subscribeToUserOrdersService, cancelOrderService, cancelAndRefundOrderService } from "@/service/order.service";
import { toast } from "@/components/(user)/ui/Toast";

const tabs: { label: string; value: OrderStatus | "Semua" }[] = [
  { label: "Semua", value: "Semua" },
  { label: "Menunggu", value: "Menunggu Konfirmasi" },
  { label: "Diproses", value: "Diproses" },
  { label: "Dikirim", value: "Dikirim" },
  { label: "Selesai", value: "Selesai" },
  { label: "Dibatalkan", value: "Dibatalkan" },
];

function getUid(): string | null {
  if (typeof document === "undefined") return null;
  return (
    document.cookie
      .split("; ")
      .find((r) => r.startsWith("uid="))
      ?.split("=")[1] ?? null
  );
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<OrderStatus | "Semua">("Semua");
  const [orders, setOrders] = useState<Order[]>([]);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = getUid();
    if (!uid) {
      setLoading(false);
      return;
    }
    const unsub = subscribeToUserOrdersService(uid, (data) => {
      setOrders(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = activeTab === "Semua" ? orders : orders.filter((o) => o.status === activeTab);

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    setCancelError(null);
    try {
      const isPaid = cancelTarget.paymentStatus === "paid";
      const midtransOrderId = (cancelTarget.midtransResult as any)?.order_id;

      if (isPaid && midtransOrderId) {
        await cancelAndRefundOrderService(cancelTarget.id, midtransOrderId, cancelTarget.total);
        toast.success("Pesanan dibatalkan. Dana akan dikembalikan dalam 3–14 hari kerja.");
      } else {
        await cancelOrderService(cancelTarget.id);
        toast.success("Pesanan berhasil dibatalkan.");
      }
      setCancelTarget(null);
    } catch (err: any) {
      setCancelError(err?.message ?? "Gagal membatalkan pesanan. Coba lagi.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Memuat pesanan...</p>
      </div>
    );

  if (!getUid())
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 flex flex-col items-center gap-4">
        <p className="text-gray-600 font-semibold">Silakan login untuk melihat pesanan</p>
        <Link href="/login" className="px-6 py-3 bg-[#1E2753] text-white rounded-xl font-semibold text-sm">
          Login
        </Link>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/user/dashboard-user" className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition text-gray-500">
          <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Pesanan Saya</h1>
          <p className="text-xs text-gray-400">{orders.length} pesanan</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
        {tabs.map((tab) => {
          const count = tab.value === "Semua" ? orders.length : orders.filter((o) => o.status === tab.value).length;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${activeTab === tab.value ? "bg-[#1E2753] text-white border-[#1E2753]" : "bg-white text-gray-500 border-gray-200 hover:border-[#1E2753]"}`}
            >
              {tab.label}
              {count > 0 && <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab.value ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>{count}</span>}
            </button>
          );
        })}
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} onCancel={() => setCancelTarget(order)} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <FontAwesomeIcon icon={faBoxOpen} className="w-12 h-12 text-gray-200" />
          <p className="font-semibold">Belum ada pesanan</p>
          <Link href="/user/dashboard-user" className="flex items-center gap-2 mt-2 px-5 py-2.5 bg-[#1E2753] text-white rounded-xl text-sm font-semibold">
            <FontAwesomeIcon icon={faBagShopping} className="w-4 h-4" />
            Mulai Belanja
          </Link>
        </div>
      )}

      {cancelTarget && (
        <CancelModal
          orderId={cancelTarget.id}
          isPaid={cancelTarget.paymentStatus === "paid"}
          loading={cancelling}
          error={cancelError}
          onConfirm={confirmCancel}
          onClose={() => {
            setCancelTarget(null);
            setCancelError(null);
          }}
        />
      )}
    </div>
  );
}
