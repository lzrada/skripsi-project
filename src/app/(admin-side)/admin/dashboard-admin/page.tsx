// src/app/(admin-side)/admin/dashboard-admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/config/firebase";
import ChartLine from "@/components/(admin)/ui/ChartLine";
import LowStockAlert from "@/components/(admin)/ui/LowStockAlert";
import CategoryBreakdown from "@/components/(admin)/ui/CategoryBreakdown";
import TopProductsChart from "@/components/(admin)/ui/TopProductChart";

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

function formatCompact(price: number) {
  if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(1)}M`;
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(1)}Jt`;
  if (price >= 1_000) return `${(price / 1_000).toFixed(0)}Rb`;
  return price.toString();
}

export default function Dashboard() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [processOrders, setProcessOrders] = useState(0);
  const [doneOrders, setDoneOrders] = useState(0);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubOrders = onSnapshot(query(collection(db, "orders"), orderBy("date", "desc")), (snap) => {
      const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
      const revenue = orders.filter((o) => o.status === "Selesai").reduce((acc, o) => acc + (o.total ?? 0), 0);
      setTotalOrders(snap.size);
      setTotalRevenue(revenue);
      setPendingOrders(orders.filter((o) => o.status === "Menunggu Konfirmasi").length);
      setProcessOrders(orders.filter((o) => o.status === "Diproses" || o.status === "Dikirim").length);
      setDoneOrders(orders.filter((o) => o.status === "Selesai").length);
      setRecentOrders(orders.slice(0, 5));
      setLoading(false);
    });
    const unsubProducts = onSnapshot(collection(db, "products"), (snap) => setTotalProducts(snap.size));
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => setTotalUsers(snap.size));
    return () => {
      unsubOrders();
      unsubProducts();
      unsubUsers();
    };
  }, []);

  const statusBadge: Record<string, { bg: string; text: string; dot: string }> = {
    "Menunggu Konfirmasi": { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
    Diproses: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
    Dikirim: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-400" },
    Selesai: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400" },
    Dibatalkan: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-400" },
  };

  return (
    <div className="min-h-screen bg-slate-50 p-5 lg:p-7">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-7">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Selamat datang kembali — berikut ringkasan toko Anda.</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm text-sm text-slate-600">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="font-medium">Live Update</span>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {/* Revenue */}
        <div className="col-span-2 xl:col-span-1 bg-gradient-to-br from-[#1E2753] to-[#2d3a8c] rounded-2xl p-5 text-white shadow-lg shadow-blue-900/20">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-sm font-bold">Rp</div>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium">Total</span>
          </div>
          <p className="text-3xl font-bold tracking-tight">{loading ? <span className="opacity-50">—</span> : formatCompact(totalRevenue)}</p>
          <p className="text-sm text-white/60 mt-1">Total Pendapatan</p>
          <p className="text-xs text-white/40 mt-0.5">Dari {doneOrders} pesanan selesai</p>
        </div>

        {/* Orders */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            {pendingOrders > 0 && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">{pendingOrders} baru</span>}
          </div>
          <p className="text-3xl font-bold text-slate-800 tracking-tight">{loading ? <span className="text-slate-300">—</span> : totalOrders}</p>
          <p className="text-sm text-slate-500 mt-1">Total Pesanan</p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            <span className="text-xs text-slate-400">{processOrders} sedang diproses</span>
          </div>
        </div>

        {/* Products */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800 tracking-tight">{loading ? <span className="text-slate-300">—</span> : totalProducts}</p>
          <p className="text-sm text-slate-500 mt-1">Total Produk</p>
          <p className="text-xs text-slate-400 mt-2">Produk terdaftar aktif</p>
        </div>

        {/* Users */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800 tracking-tight">{loading ? <span className="text-slate-300">—</span> : totalUsers}</p>
          <p className="text-sm text-slate-500 mt-1">Total Pengguna</p>
          <p className="text-xs text-slate-400 mt-2">Akun terdaftar</p>
        </div>
      </div>

      {/* ── Chart + Status Summary ── */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 mb-5">
        {/* Chart */}
        <div className="xl:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <ChartLine />
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-bold text-slate-700 text-sm mb-4">Status Pesanan</h3>
          <div className="space-y-3">
            {[
              { label: "Menunggu Konfirmasi", count: pendingOrders, color: "bg-amber-400", track: "bg-amber-100" },
              { label: "Diproses / Dikirim", count: processOrders, color: "bg-blue-400", track: "bg-blue-100" },
              { label: "Selesai", count: doneOrders, color: "bg-emerald-400", track: "bg-emerald-100" },
              { label: "Total Pesanan", count: totalOrders, color: "bg-slate-400", track: "bg-slate-100" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">{item.label}</span>
                  <span className="font-bold text-slate-800">{loading ? "—" : item.count}</span>
                </div>
                <div className={`w-full h-1.5 rounded-full ${item.track}`}>
                  <div className={`h-1.5 rounded-full ${item.color} transition-all duration-700`} style={{ width: totalOrders > 0 && !loading ? `${Math.min((item.count / totalOrders) * 100, 100)}%` : "0%" }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500 mb-1">Total Pendapatan</p>
            <p className="text-xl font-bold text-[#1E2753]">{loading ? "—" : formatPrice(totalRevenue)}</p>
          </div>
        </div>
      </div>

      {/* ── Recent Orders ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Pesanan Terbaru</h3>
          <a href="/admin/orders-management" className="text-xs font-semibold text-[#1E2753] hover:underline">
            Lihat Semua →
          </a>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <svg className="w-10 h-10 mx-auto mb-2 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p className="text-sm">Belum ada pesanan masuk</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recentOrders.map((order) => {
              const s = statusBadge[order.status] ?? statusBadge["Menunggu Konfirmasi"];
              return (
                <div key={order.id} className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-700">#{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-slate-400 truncate">{order.recipientName}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-slate-800">{formatPrice(order.total ?? 0)}</p>
                    <p className="text-xs text-slate-400">{new Date(order.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</p>
                  </div>
                  <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${s.bg} ${s.text} flex-shrink-0`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                    {order.status === "Menunggu Konfirmasi" ? "Menunggu" : order.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Inventory & Analytics ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mt-5">
        <LowStockAlert />
        <CategoryBreakdown />
        <TopProductsChart />
      </div>
    </div>
  );
}
