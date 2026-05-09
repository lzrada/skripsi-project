"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/config/firebase";
import { subscribeToLowStockProductsService } from "@/service/inventory.service";
import type { LowStockProduct } from "@/service/inventory.service";
import { DEFAULT_REORDER_POINT } from "@/constants/inventory";

import { DashboardHeader } from "@/components/(admin)/dashboard/DashboardHeader";
import { LowStockBanner } from "@/components/(admin)/dashboard/LowStockBanner";
import { KPICards } from "@/components/(admin)/dashboard/KPICards";
import { ChartAndStatusSection } from "@/components/(admin)/dashboard/ChartAndStatusSection";
import { RecentOrdersSection } from "@/components/(admin)/dashboard/RecentOrdersSection";
import { BottomChartsGrid } from "@/components/(admin)/dashboard/BottomChartsGrid";

export function DashboardClientComponent() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [processOrders, setProcessOrders] = useState(0);
  const [doneOrders, setDoneOrders] = useState(0);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
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

    const unsubInventory = subscribeToLowStockProductsService(DEFAULT_REORDER_POINT, (products) => setLowStockProducts(products));

    return () => {
      unsubOrders();
      unsubProducts();
      unsubUsers();
      unsubInventory();
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-5 lg:p-7">
      <DashboardHeader />
      <LowStockBanner loading={loading} lowStockProducts={lowStockProducts} />
      <KPICards
        loading={loading}
        totalRevenue={totalRevenue}
        totalOrders={totalOrders}
        totalProducts={totalProducts}
        totalUsers={totalUsers}
        pendingOrders={pendingOrders}
        doneOrders={doneOrders}
        lowStockProducts={lowStockProducts.length}
      />
      <ChartAndStatusSection loading={loading} pendingOrders={pendingOrders} processOrders={processOrders} doneOrders={doneOrders} totalOrders={totalOrders} totalRevenue={totalRevenue} />
      <RecentOrdersSection loading={loading} recentOrders={recentOrders} />
      <BottomChartsGrid />
    </div>
  );
}
