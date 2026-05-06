// src/app/(admin-side)/admin/orders-management/page.tsx
"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxOpen, faChevronDown, faChevronUp, faLocationDot, faMoneyBill, faWallet, faTruck, faCreditCard, faSearch, faClock, faGear, faCircleCheck, faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { type Order, type OrderStatus, statusConfig } from "@/types/order";
import { categoryIcon, categoryGradient, defaultCategoryIcon, defaultGradient } from "@/constants/category";
import { cancelOrderService, subscribeToAllOrdersService, updateOrderStatusService, deductStockOnPaymentService } from "@/service/order.service";
import { Timestamp } from "firebase/firestore";

const ALL_STATUSES: (OrderStatus | "Semua")[] = ["Semua", "Menunggu Konfirmasi", "Diproses", "Dikirim", "Selesai", "Dibatalkan"];
const STATUS_FLOW: OrderStatus[] = ["Menunggu Konfirmasi", "Diproses", "Dikirim", "Selesai"];

const paymentIcon: Record<string, IconDefinition> = {
  "Transfer Bank": faMoneyBill,
  "E-Wallet": faWallet,
  COD: faTruck,
  "Kartu Kredit / Debit": faCreditCard,
};

// ── Helpers ────────────────────────────────────────────────────────────────

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

// BUG FIX: Firestore bisa kirim Timestamp atau string ISO
function formatOrderDate(order: any): string {
  let d: Date | null = null;
  if (order.date && typeof order.date === "string") {
    const parsed = new Date(order.date);
    if (!isNaN(parsed.getTime())) d = parsed;
  }
  if (!d && order.createdAt instanceof Timestamp) d = order.createdAt.toDate();
  if (!d && order.createdAt?.seconds) d = new Date(order.createdAt.seconds * 1000);
  if (!d) return "—";
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

// ── Skeleton ───────────────────────────────────────────────────────────────

function SkeletonOrder() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 animate-pulse">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-slate-200 rounded" />
          <div>
            <div className="w-24 h-4 bg-slate-200 rounded mb-1.5" />
            <div className="w-40 h-3 bg-slate-100 rounded" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-28 h-7 bg-slate-100 rounded-full" />
          <div className="w-20 h-5 bg-slate-200 rounded" />
          <div className="w-24 h-8 bg-slate-100 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ── OrderRow ───────────────────────────────────────────────────────────────

interface OrderRowProps {
  order: Order;
  onStatusChange: (id: string, status: OrderStatus) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
}

function OrderRow({ order, onStatusChange, onCancel }: OrderRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const status = statusConfig[order.status];
  const currentIndex = STATUS_FLOW.indexOf(order.status);
  const canAdvance = currentIndex !== -1 && currentIndex < STATUS_FLOW.length - 1;
  const isCancelled = order.status === "Dibatalkan";
  const isDone = order.status === "Selesai";

  const handleAdvance = async () => {
    if (!canAdvance) return;
    setUpdating(true);
    await onStatusChange(order.id, STATUS_FLOW[currentIndex + 1]);
    setUpdating(false);
  };

  const handleCancel = async () => {
    setUpdating(true);
    setConfirmCancel(false);
    await onCancel(order.id);
    setUpdating(false);
  };

  // Progress bar step tracker
  const stepIndex = STATUS_FLOW.indexOf(order.status);

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        {/* ── Header Row ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3.5 cursor-pointer hover:bg-slate-50/80 transition" onClick={() => setExpanded((v) => !v)}>
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 flex-shrink-0 transition"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((v) => !v);
              }}
            >
              <FontAwesomeIcon icon={expanded ? faChevronUp : faChevronDown} className="w-3 h-3" />
            </button>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 font-mono tracking-wide">#{order.id.slice(0, 8).toUpperCase()}</p>
              <p className="text-xs text-slate-400">
                {formatOrderDate(order)} · {order.recipientName ?? "—"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 ml-10 sm:ml-0">
            <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${status.bg} ${status.color}`}>
              <FontAwesomeIcon icon={status.icon} className="w-3 h-3" />
              {status.label}
            </span>
            <span className="text-sm font-bold text-[#1E2753] whitespace-nowrap">{formatPrice(order.total)}</span>
            {!isCancelled && !isDone && (
              <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                {canAdvance && (
                  <button onClick={handleAdvance} disabled={updating} className="text-xs bg-[#1E2753] hover:bg-[#2a3470] text-white font-semibold px-3 py-1.5 rounded-xl transition disabled:opacity-60 flex items-center gap-1">
                    {updating ? <FontAwesomeIcon icon={faGear} className="w-3 h-3 animate-spin" /> : `→ ${STATUS_FLOW[currentIndex + 1]}`}
                  </button>
                )}
                <button onClick={() => setConfirmCancel(true)} disabled={updating} className="text-xs border border-red-200 text-red-500 hover:bg-red-50 font-semibold px-3 py-1.5 rounded-xl transition disabled:opacity-60">
                  Batalkan
                </button>
              </div>
            )}
            {isDone && <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">✓ Selesai</span>}
          </div>
        </div>

        {/* ── Progress Tracker ── */}
        {!isCancelled && (
          <div className="px-5 pb-3 pt-0">
            <div className="flex items-center gap-0">
              {STATUS_FLOW.map((step, i) => {
                const done = stepIndex >= i;
                const active = stepIndex === i;
                return (
                  <div key={step} className="flex items-center flex-1 last:flex-none">
                    <div
                      className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all ${
                        done ? (active ? "bg-[#1E2753] text-white ring-2 ring-[#1E2753]/20" : "bg-emerald-500 text-white") : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {done && !active ? "✓" : i + 1}
                    </div>
                    <div className="hidden sm:block ml-1 mr-1">
                      <p className={`text-[9px] font-semibold whitespace-nowrap ${done ? (active ? "text-[#1E2753]" : "text-emerald-600") : "text-slate-400"}`}>{step === "Menunggu Konfirmasi" ? "Menunggu" : step}</p>
                    </div>
                    {i < STATUS_FLOW.length - 1 && <div className={`flex-1 h-0.5 mx-1 rounded-full ${stepIndex > i ? "bg-emerald-400" : "bg-slate-100"}`} />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Detail Expanded ── */}
        {expanded && (
          <div className="border-t border-slate-100 bg-slate-50/60 p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-3 border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <FontAwesomeIcon icon={faLocationDot} className="w-3.5 h-3.5 text-orange-500" />
                  <p className="text-xs font-bold text-slate-700">Alamat Pengiriman</p>
                </div>
                <p className="text-sm font-semibold text-slate-700">{order.recipientName}</p>
                <p className="text-xs text-slate-500 mt-0.5">{order.phone}</p>
                <p className="text-xs text-slate-500 mt-0.5">{order.address}</p>
                {order.note && <p className="text-xs text-slate-400 mt-1 italic bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">📝 {order.note}</p>}
              </div>
              <div className="bg-white rounded-xl p-3 border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <FontAwesomeIcon icon={paymentIcon[order.paymentMethod] ?? faMoneyBill} className="w-3.5 h-3.5 text-[#1E2753]" />
                  <p className="text-xs font-bold text-slate-700">Pembayaran</p>
                </div>
                <p className="text-sm font-semibold text-slate-700">{order.paymentMethod}</p>
                <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 ${order.status === "Menunggu Konfirmasi" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                  {order.status === "Menunggu Konfirmasi" ? "Menunggu konfirmasi" : "Terkonfirmasi"}
                </span>
              </div>
            </div>

            {/* Item-item pesanan */}
            <div>
              <p className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
                <FontAwesomeIcon icon={faBoxOpen} className="w-3 h-3" />
                Produk ({order.items.length} item)
              </p>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-slate-100">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${categoryGradient[item.category] ?? defaultGradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <FontAwesomeIcon icon={categoryIcon[item.category] ?? defaultCategoryIcon} className="w-4 h-4 text-white/80" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-slate-400">
                        {formatPrice(item.price)} × {item.qty}
                      </p>
                    </div>
                    <p className="text-xs font-bold text-[#1E2753] flex-shrink-0">{formatPrice(item.price * item.qty)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center bg-[#1E2753]/5 rounded-xl px-4 py-3 border border-[#1E2753]/10">
              <span className="text-sm font-bold text-slate-700">Total Pembayaran</span>
              <span className="text-base font-black text-[#1E2753]">{formatPrice(order.total)}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal Konfirmasi Batalkan ── */}
      {confirmCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faCircleXmark} className="text-red-500 w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Batalkan Pesanan?</h3>
            <p className="text-sm text-slate-500 mb-1">
              Pesanan <span className="font-bold text-slate-700 font-mono">#{order.id.slice(0, 8).toUpperCase()}</span> akan dibatalkan.
            </p>
            <p className="text-xs text-slate-400 mb-6 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">⚠️ Stok produk akan dikembalikan secara otomatis.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmCancel(false)} className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition">
                Kembali
              </button>
              <button onClick={handleCancel} disabled={updating} className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 disabled:opacity-60 transition">
                {updating ? "Membatalkan..." : "Ya, Batalkan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Halaman Utama ──────────────────────────────────────────────────────────

const STATUS_ICON: Record<string, IconDefinition> = {
  "Menunggu Konfirmasi": faClock,
  Diproses: faGear,
  Dikirim: faTruck,
  Selesai: faCircleCheck,
  Dibatalkan: faCircleXmark,
};

export default function OrdersManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OrderStatus | "Semua">("Semua");
  const [search, setSearch] = useState("");
  const [toastMsg, setToastMsg] = useState<{ msg: string; type: "success" | "error" } | null>(null);

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
      // BUG FIX: Hanya deduct stok saat pertama dikonfirmasi (masuk Diproses),
      // tapi guard dengan try-catch agar tidak crash kalau sudah di-deduct
      if (status === "Diproses") {
        try {
          await deductStockOnPaymentService(id);
        } catch {
          /* sudah di-deduct */
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

  const filtered = orders.filter((o) => {
    const matchTab = activeTab === "Semua" || o.status === activeTab;
    const matchSearch = !search.trim() || o.id.toLowerCase().includes(search.toLowerCase()) || (o.recipientName ?? "").toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const countByStatus = (s: OrderStatus | "Semua") => (s === "Semua" ? orders.length : orders.filter((o) => o.status === s).length);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-7">
      {/* Toast */}
      {toastMsg && <div className={`fixed top-5 right-5 z-[100] px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold text-white transition-all ${toastMsg.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}>{toastMsg.msg}</div>}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen Pesanan</h1>
        <p className="text-sm text-slate-500 mt-0.5">Pantau dan perbarui status semua pesanan masuk.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {(ALL_STATUSES.filter((s) => s !== "Semua") as OrderStatus[]).map((s) => {
          const cfg = statusConfig[s];
          return (
            <button
              key={s}
              onClick={() => setActiveTab(s)}
              className={`text-left bg-white rounded-2xl border p-4 shadow-sm hover:shadow-md transition-all ${activeTab === s ? "border-[#1E2753] ring-2 ring-[#1E2753]/10" : "border-slate-200"}`}
            >
              <div className="flex items-center justify-between mb-2">
                <FontAwesomeIcon icon={STATUS_ICON[s] ?? faBoxOpen} className={`w-4 h-4 ${cfg.color}`} />
                {countByStatus(s) > 0 && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{countByStatus(s)}</span>}
              </div>
              <p className="text-xl font-black text-slate-800">{loading ? "—" : countByStatus(s)}</p>
              <p className={`text-[10px] font-semibold mt-0.5 ${cfg.color}`}>{cfg.label}</p>
            </button>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FontAwesomeIcon icon={faSearch} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="Cari no. pesanan atau nama penerima..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#1E2753] focus:ring-2 focus:ring-[#1E2753]/10 transition"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {ALL_STATUSES.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${activeTab === tab ? "bg-[#1E2753] text-white border-[#1E2753]" : "bg-white text-slate-500 border-slate-200 hover:border-[#1E2753]/50"}`}
            >
              {tab === "Semua" ? "Semua" : statusConfig[tab as OrderStatus].label} <span className="opacity-60">({countByStatus(tab)})</span>
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <SkeletonOrder key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 py-20 text-center">
          <FontAwesomeIcon icon={faBoxOpen} className="text-5xl mb-3 text-slate-200" />
          <p className="font-semibold text-slate-500">{search ? "Pesanan tidak ditemukan" : "Belum ada pesanan"}</p>
          {search && (
            <button onClick={() => setSearch("")} className="mt-3 text-xs text-[#1E2753] font-semibold hover:underline">
              Hapus pencarian
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <OrderRow key={order.id} order={order} onStatusChange={handleStatusChange} onCancel={handleCancelOrder} />
          ))}
        </div>
      )}
    </div>
  );
}
