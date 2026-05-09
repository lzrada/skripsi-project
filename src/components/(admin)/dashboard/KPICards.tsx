import Link from "next/link";
import { formatPrice, formatCompact } from "@/components/(admin)/dashboard/dashboardHelpers";

interface KPICardsProps {
  loading: boolean;
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  pendingOrders: number;
  doneOrders: number;
  lowStockProducts: number;
}

export function KPICards({ loading, totalRevenue, totalOrders, totalProducts, totalUsers, pendingOrders, doneOrders, lowStockProducts }: KPICardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <div className="col-span-2 xl:col-span-1 bg-gradient-to-br from-[#1E2753] to-[#2d3a8c] rounded-2xl p-5 animate-pulse">
          <div className="w-10 h-10 bg-white/20 rounded-xl mb-4" />
          <div className="w-24 h-8 bg-white/20 rounded-lg mb-2" />
          <div className="w-32 h-4 bg-white/10 rounded" />
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 bg-slate-100 rounded-xl" />
              <div className="w-14 h-5 bg-slate-100 rounded-full" />
            </div>
            <div className="w-20 h-8 bg-slate-100 rounded-lg mb-2" />
            <div className="w-28 h-4 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {/* Revenue Card */}
      <div className="col-span-2 xl:col-span-1 bg-gradient-to-br from-[#1E2753] to-[#2d3a8c] rounded-2xl p-5 text-white shadow-lg shadow-blue-900/20">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-sm font-bold">Rp</div>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium">Total</span>
        </div>
        <p className="text-3xl font-bold tracking-tight">{formatCompact(totalRevenue)}</p>
        <p className="text-sm text-white/60 mt-1">Total Pendapatan</p>
        <p className="text-xs text-white/40 mt-0.5">Dari {doneOrders} pesanan selesai</p>
      </div>

      {/* Orders Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          {pendingOrders > 0 && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">{pendingOrders} baru</span>}
        </div>
        <p className="text-3xl font-bold text-slate-800 tracking-tight">{totalOrders}</p>
        <p className="text-sm text-slate-500 mt-1">Total Pesanan</p>
        <div className="flex items-center gap-1.5 mt-2">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          <span className="text-xs text-slate-400">{doneOrders} selesai</span>
        </div>
      </div>

      {/* Products Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
          {lowStockProducts > 0 && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">{lowStockProducts} low stock</span>}
        </div>
        <p className="text-3xl font-bold text-slate-800 tracking-tight">{totalProducts}</p>
        <p className="text-sm text-slate-500 mt-1">Total Produk</p>
        <p className="text-xs text-slate-400 mt-2">Produk terdaftar aktif</p>
      </div>

      {/* Users Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
        </div>
        <p className="text-3xl font-bold text-slate-800 tracking-tight">{totalUsers}</p>
        <p className="text-sm text-slate-500 mt-1">Total Pengguna</p>
        <p className="text-xs text-slate-400 mt-2">Akun terdaftar</p>
      </div>
    </div>
  );
}
