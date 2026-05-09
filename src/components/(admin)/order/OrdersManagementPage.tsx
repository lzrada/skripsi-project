"use client";

import { useEffect, useState } from "react";
import { subscribeToAllOrdersService, updateOrderStatusService, deductStockOnPaymentService, cancelOrderService } from "@/service/order.service";
import { type Order, type OrderStatus } from "@/types/order";
import { OrderStatsCard } from "@/components/(admin)/order/OrderStatsCard";
import { OrderFilterBar } from "@/components/(admin)/order/OrderFilterBar";
import { OrderList } from "@/components/(admin)/order/OrderList";

const ALL_STATUSES: (OrderStatus | "Semua")[] = ["Semua", "Menunggu Konfirmasi", "Diproses", "Dikirim", "Selesai", "Dibatalkan"];
const STATUS_FLOW: OrderStatus[] = ["Menunggu Konfirmasi", "Diproses", "Dikirim", "Selesai"];

type ToastState = { msg: string; type: "success" | "error" } | null;

export default function OrdersManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OrderStatus | "Semua">("Semua");
  const [search, setSearch] = useState("");
  const [toastMsg, setToastMsg] = useState<ToastState>(null);

  useEffect(() => {
    const unsub = subscribeToAllOrdersService((data) => {
      setOrders(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const showToast = (msg: string, type: "success" | "error") => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    try {
      await updateOrderStatusService(id, status);
      if (status === "Diproses") {
        try {
          await deductStockOnPaymentService(id);
        } catch {
          /* already deducted */
        }
      }
      showToast(`Status diperbarui: ${status}`, "success");
    } catch {
      showToast("Gagal memperbarui status.", "error");
    }
  };

  const handleCancelOrder = async (id: string) => {
    try {
      await cancelOrderService(id);
      showToast("Pesanan dibatalkan dan stok dikembalikan.", "success");
    } catch (err: any) {
      showToast(err?.message ?? "Gagal membatalkan pesanan.", "error");
    }
  };

  const countByStatus = (status: OrderStatus | "Semua") => {
    return status === "Semua" ? orders.length : orders.filter((order) => order.status === status).length;
  };

  const filtered = orders.filter((order) => {
    const matchesTab = activeTab === "Semua" || order.status === activeTab;
    const matchesSearch = !search.trim() || order.id.toLowerCase().includes(search.toLowerCase()) || (order.recipientName ?? "").toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-7">
      {toastMsg && <div className={`fixed top-5 right-5 z-100 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold text-white transition-all ${toastMsg.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}>{toastMsg.msg}</div>}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen Pesanan</h1>
        <p className="text-sm text-slate-500 mt-0.5">Pantau dan perbarui status semua pesanan masuk.</p>
      </div>

      <OrderStatsCard statuses={ALL_STATUSES.filter((s) => s !== "Semua") as OrderStatus[]} activeTab={activeTab} onTabChange={setActiveTab} countByStatus={countByStatus} loading={loading} />

      <OrderFilterBar search={search} onSearchChange={setSearch} activeTab={activeTab} onTabChange={setActiveTab} statuses={ALL_STATUSES} countByStatus={countByStatus} />

      <OrderList orders={filtered} loading={loading} search={search} onStatusChange={handleStatusChange} onCancel={handleCancelOrder} onClearSearch={() => setSearch("")} />
    </div>
  );
}
