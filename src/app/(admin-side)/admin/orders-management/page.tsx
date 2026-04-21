"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxOpen, faChevronDown, faChevronUp, faLocationDot, faMoneyBill, faWallet, faTruck, faCreditCard, faSearch } from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { db } from "@/config/firebase";
import { collection, onSnapshot, orderBy, query, doc, updateDoc } from "firebase/firestore";
import { type Order, type OrderStatus, statusConfig, statusSteps } from "@/types/order";
import { categoryIcon, categoryGradient, defaultCategoryIcon, defaultGradient } from "@/constants/category";

const ALL_STATUSES: (OrderStatus | "Semua")[] = ["Semua", "Menunggu Konfirmasi", "Diproses", "Dikirim", "Selesai", "Dibatalkan"];

const STATUS_FLOW: OrderStatus[] = ["Menunggu Konfirmasi", "Diproses", "Dikirim", "Selesai"];

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
    month: "short",
    year: "numeric",
  });
}

// ── Baris pesanan yang bisa di-expand ─────────────────────────────────
interface OrderRowProps {
  order: Order;
  onStatusChange: (id: string, status: OrderStatus) => Promise<void>;
}

function OrderRow({ order, onStatusChange }: OrderRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const status = statusConfig[order.status];

  const currentIndex = STATUS_FLOW.indexOf(order.status);
  const canAdvance = currentIndex !== -1 && currentIndex < STATUS_FLOW.length - 1;
  const isCancelled = order.status === "Dibatalkan";

  const handleAdvance = async () => {
    if (!canAdvance) return;
    setUpdating(true);
    await onStatusChange(order.id, STATUS_FLOW[currentIndex + 1]);
    setUpdating(false);
  };

  const handleCancel = async () => {
    if (isCancelled || order.status === "Selesai") return;
    setUpdating(true);
    await onStatusChange(order.id, "Dibatalkan");
    setUpdating(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Baris ringkasan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 cursor-pointer hover:bg-slate-50 transition" onClick={() => setExpanded((v) => !v)}>
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            className="text-slate-400 flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
          >
            <FontAwesomeIcon icon={expanded ? faChevronUp : faChevronDown} className="w-3 h-3" />
          </button>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800">#{order.id}</p>
            <p className="text-xs text-slate-400">
              {formatDate(order.date)} • {order.recipientName}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Badge status */}
          <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${status.bg} ${status.color}`}>
            <FontAwesomeIcon icon={status.icon} className="w-3 h-3" />
            {status.label}
          </span>

          <span className="text-sm font-bold text-[#1E2753] whitespace-nowrap">{formatPrice(order.total)}</span>

          {/* Tombol ubah status */}
          {!isCancelled && order.status !== "Selesai" && (
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              {canAdvance && (
                <button onClick={handleAdvance} disabled={updating} className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-xl transition disabled:opacity-60">
                  {updating ? "..." : `→ ${STATUS_FLOW[currentIndex + 1]}`}
                </button>
              )}
              <button onClick={handleCancel} disabled={updating} className="text-xs border border-red-300 text-red-500 hover:bg-red-50 font-semibold px-3 py-1.5 rounded-xl transition disabled:opacity-60">
                Batalkan
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Detail expand */}
      {expanded && (
        <div className="border-t border-slate-100 p-4 space-y-4 bg-slate-50">
          {/* Alamat & pembayaran */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FontAwesomeIcon icon={faLocationDot} className="w-3.5 h-3.5 text-orange-500" />
                <p className="text-xs font-bold text-slate-700">Alamat Pengiriman</p>
              </div>
              <p className="text-sm font-semibold text-slate-700">{order.recipientName}</p>
              <p className="text-xs text-slate-500 mt-0.5">{order.phone}</p>
              <p className="text-xs text-slate-500 mt-0.5">{order.address}</p>
              {order.note && <p className="text-xs text-slate-400 mt-1 italic">Catatan: {order.note}</p>}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FontAwesomeIcon icon={paymentIcon[order.paymentMethod] ?? faMoneyBill} className="w-3.5 h-3.5 text-[#1E2753]" />
                <p className="text-xs font-bold text-slate-700">Pembayaran</p>
              </div>
              <p className="text-sm font-semibold text-slate-700">{order.paymentMethod}</p>
              <p className="text-xs text-slate-400 mt-0.5">{order.status === "Menunggu Konfirmasi" ? "Menunggu konfirmasi" : "Dikonfirmasi"}</p>
            </div>
          </div>

          {/* Item produk */}
          <div>
            <p className="text-xs font-bold text-slate-700 mb-2">Produk ({order.items.length})</p>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 bg-white rounded-xl p-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${categoryGradient[item.category] ?? defaultGradient} flex items-center justify-center flex-shrink-0`}>
                    <FontAwesomeIcon icon={categoryIcon[item.category] ?? defaultCategoryIcon} className="w-4 h-4 text-white/80" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 line-clamp-1">{item.name}</p>
                    <p className="text-xs text-slate-400">
                      x{item.qty} • {formatPrice(item.price)}
                    </p>
                  </div>
                  <p className="text-xs font-bold text-[#1E2753] flex-shrink-0">{formatPrice(item.price * item.qty)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center border-t border-slate-200 pt-3">
            <span className="text-sm font-bold text-slate-700">Total Pembayaran</span>
            <span className="text-base font-bold text-[#1E2753]">{formatPrice(order.total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Halaman Utama ─────────────────────────────────────────────────────
export default function OrdersManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OrderStatus | "Semua">("Semua");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Subscribe realtime ke koleksi orders Firestore
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("date", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const data: Order[] = snap.docs.map((d) => {
        const raw = d.data();
        return {
          id: d.id,
          date: raw.date ?? "",
          status: raw.status ?? "Menunggu Konfirmasi",
          items: raw.items ?? [],
          total: raw.total ?? 0,
          paymentMethod: raw.paymentMethod ?? "",
          address: raw.address ?? "",
          phone: raw.phone ?? "",
          recipientName: raw.recipientName ?? "",
          note: raw.note,
        } as Order;
      });
      setOrders(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    try {
      await updateDoc(doc(db, "orders", id), { status });
      showToast(`Status diperbarui: ${status}`, "success");
    } catch {
      showToast("Gagal memperbarui status.", "error");
    }
  };

  const filtered = orders.filter((o) => {
    const matchTab = activeTab === "Semua" || o.status === activeTab;
    const matchSearch = !search.trim() || o.id.toLowerCase().includes(search.toLowerCase()) || o.recipientName.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const countByStatus = (s: OrderStatus | "Semua") => (s === "Semua" ? orders.length : orders.filter((o) => o.status === s).length);

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      {/* Toast */}
      {toast && <div className={`fixed top-5 right-5 z-[100] px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold text-white ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}`}>{toast.msg}</div>}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Manajemen Pesanan</h1>
        <p className="mt-1 text-slate-500 text-sm">Pantau dan perbarui status semua pesanan masuk.</p>
      </div>

      {/* Stat ringkasan */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {ALL_STATUSES.filter((s) => s !== "Semua").map((s) => {
          const cfg = statusConfig[s as OrderStatus];
          return (
            <div key={s} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <p className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{countByStatus(s as OrderStatus)}</p>
            </div>
          );
        })}
      </div>

      {/* Filter & search */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm mb-6 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="Cari No. Pesanan atau nama penerima..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 transition"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {ALL_STATUSES.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${activeTab === tab ? "bg-[#1E2753] text-white border-[#1E2753]" : "bg-white text-slate-500 border-slate-200 hover:border-[#1E2753]"}`}
            >
              {tab === "Semua" ? "Semua" : statusConfig[tab as OrderStatus].label}
              {countByStatus(tab) > 0 && <span className="ml-1 opacity-70">({countByStatus(tab)})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Daftar pesanan */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 text-sm">Memuat pesanan...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <FontAwesomeIcon icon={faBoxOpen} className="text-5xl mb-3 text-slate-200" />
          <p className="font-semibold">Belum ada pesanan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <OrderRow key={order.id} order={order} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}
    </div>
  );
}
