"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/config/firebase";
import ChartLine from "@/components/(admin)/ui/ChartLine";
import LowStockAlert from "@/components/(admin)/ui/LowStockAlert";
import CategoryBreakdown from "@/components/(admin)/ui/CategoryBreakdown";
import TopProductsChart from "@/components/(admin)/ui/TopProductChart";
import { isLowStock, isCriticalStock, calculateReorderPoint } from "@/constants/inventory";
import { KPICards } from "@/components/(admin)/dashboard/KPICards";
import { RecentOrdersSection } from "@/components/(admin)/dashboard/RecentOrdersSection";

export default function DashboardPage() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [processOrders, setProcessOrders] = useState(0);
  const [doneOrders, setDoneOrders] = useState(0);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubOrders = onSnapshot(
      query(collection(db, "orders"), orderBy("createdAt", "desc")),
      (snap) => {
        const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
        const revenue = orders.filter((o) => o.status === "Selesai").reduce((acc, o) => acc + (o.total ?? 0), 0);

        setTotalOrders(snap.size);
        setTotalRevenue(revenue);
        setPendingOrders(orders.filter((o) => o.status === "Menunggu Konfirmasi").length);
        setProcessOrders(orders.filter((o) => o.status === "Diproses" || o.status === "Dikirim").length);
        setDoneOrders(orders.filter((o) => o.status === "Selesai").length);
        setRecentOrders(orders.slice(0, 5));
        setLoading(false);
      },
      (err) => {
        console.error("Gagal memuat pesanan:", err);
        setLoading(false);
      },
    );

    const unsubProducts = onSnapshot(collection(db, "products"), (snap) => setTotalProducts(snap.size));

    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => setTotalUsers(snap.size));

    // Subscribe inventory — filter pakai isCriticalStock + isLowStock
    // agar konsisten dengan halaman Monitoring Stok
    const unsubInventory = onSnapshot(query(collection(db, "products"), orderBy("name")), (snap) => {
      const alertCount = snap.docs.filter((d) => {
        const item = d.data();
        const stock: number = item.stock ?? 0;
        const avgSales: number = item.averageDailySales ?? 0;
        const leadTime: number = item.leadTimeDays ?? 3;
        const reorderPoint: number = item.reorderPoint ?? (avgSales > 0 ? calculateReorderPoint(avgSales, leadTime) : 5);
        return isCriticalStock(stock) || isLowStock(stock, reorderPoint);
      }).length;
      setLowStockCount(alertCount);
    });

    return () => {
      unsubOrders();
      unsubProducts();
      unsubUsers();
      unsubInventory();
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-5 lg:p-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-7">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Selamat datang kembali — berikut ringkasan toko hari ini.</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm text-sm text-slate-600 self-start sm:self-auto">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="font-medium">Live Update</span>
        </div>
      </div>

      {/* Banner peringatan stok */}
      {!loading && lowStockCount > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-red-700">{lowStockCount} produk membutuhkan perhatian stok!</p>
              <p className="text-xs text-red-500 mt-0.5">Terdapat produk dengan stok kritis atau di bawah Reorder Point.</p>
            </div>
          </div>
          <Link href="/admin/inventory-monitoring" className="shrink-0 text-xs font-semibold text-red-600 bg-red-100 hover:bg-red-200 px-4 py-2 rounded-xl transition">
            Lihat Detail →
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <KPICards loading={loading} totalRevenue={totalRevenue} totalOrders={totalOrders} totalProducts={totalProducts} totalUsers={totalUsers} pendingOrders={pendingOrders} doneOrders={doneOrders} lowStockProducts={lowStockCount} />

      {/* Chart + Status Summary */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 mb-5">
        <div className="xl:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <ChartLine />
        </div>

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
                  <div
                    className={`h-1.5 rounded-full ${item.color} transition-all duration-700`}
                    style={{
                      width: totalOrders > 0 && !loading ? `${Math.min((item.count / totalOrders) * 100, 100)}%` : "0%",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500 mb-1">Total Pendapatan</p>
            <p className="text-xl font-bold text-[#1E2753]">{loading ? "—" : `Rp${totalRevenue.toLocaleString("id-ID")}`}</p>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <RecentOrdersSection loading={loading} recentOrders={recentOrders} />

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <LowStockAlert />
        <CategoryBreakdown />
        <TopProductsChart />
      </div>
    </div>
  );
}
