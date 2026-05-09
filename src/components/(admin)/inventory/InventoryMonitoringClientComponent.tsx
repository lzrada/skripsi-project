"use client";

import { useEffect, useState, useMemo } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/config/firebase";
import { calculateReorderPoint, calculateInventoryLevel, isCriticalStock, isLowStock } from "@/constants/inventory";
import { markAsRestockedService } from "@/service/inventory.service";

import { InventoryHeader } from "@/components/(admin)/inventory/InventoryHeader";
import { InventoryStatsCards } from "@/components/(admin)/inventory/InventoryStatsCards";
import { InventoryMethodInfo } from "@/components/(admin)/inventory/InventoryMethodInfo";
import { InventorySearchBar } from "@/components/(admin)/inventory/InventorySearchBar";
import { InventoryTableContainer } from "@/components/(admin)/inventory/InventoryTableContainer";
import { EditROPModal } from "@/components/(admin)/inventory/EditROPModal";

interface ProductStock {
  id: string;
  name: string;
  category: string;
  stock: number;
  reorderPoint: number;
  averageDailySales: number;
  leadTimeDays: number;
  price: number;
  lastRestockedAt?: string;
}

interface EditModalState {
  open: boolean;
  product: ProductStock | null;
}

export function InventoryMonitoringClientComponent() {
  const [products, setProducts] = useState<ProductStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"semua" | "kritis" | "restock" | "aman">("semua");
  const [editModal, setEditModal] = useState<EditModalState>({
    open: false,
    product: null,
  });
  const [restockingId, setRestockingId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("name"));
    const unsub = onSnapshot(q, (snap) => {
      const data: ProductStock[] = snap.docs.map((d) => {
        const item = d.data();
        const avgSales: number = item.averageDailySales ?? 0;
        const leadTime: number = item.leadTimeDays ?? 3;
        const rop: number = item.reorderPoint ?? (avgSales > 0 ? calculateReorderPoint(avgSales, leadTime) : 5);
        return {
          id: d.id,
          name: item.name ?? "",
          category: item.category ?? "",
          stock: item.stock ?? 0,
          reorderPoint: rop,
          averageDailySales: avgSales,
          leadTimeDays: leadTime,
          price: item.price ?? 0,
          lastRestockedAt: item.lastRestockedAt,
        };
      });
      setProducts(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const stats = useMemo(() => {
    const kritis = products.filter((p) => isCriticalStock(p.stock)).length;
    const restock = products.filter((p) => !isCriticalStock(p.stock) && isLowStock(p.stock, p.reorderPoint)).length;
    const aman = products.filter((p) => !isLowStock(p.stock, p.reorderPoint)).length;
    return { kritis, restock, aman, total: products.length };
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const level = calculateInventoryLevel(p.stock, p.reorderPoint);
      const matchFilter = filter === "semua" || (filter === "kritis" && level === "Stok Kritis") || (filter === "restock" && level === "Perlu Restock") || (filter === "aman" && level === "Stok Aman");
      return matchSearch && matchFilter;
    });
  }, [products, search, filter]);

  async function handleRestock(product: ProductStock) {
    setRestockingId(product.id);
    try {
      await markAsRestockedService(product.id);
    } catch (e) {
      console.error(e);
    } finally {
      setRestockingId(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <InventoryHeader />
      <InventoryStatsCards total={stats.total} kritis={stats.kritis} restock={stats.restock} aman={stats.aman} filter={filter} onFilterChange={setFilter} />
      <InventoryMethodInfo />
      <InventorySearchBar search={search} onSearchChange={setSearch} />
      <InventoryTableContainer filtered={filtered} onEditROP={(p) => setEditModal({ open: true, product: p })} onRestock={handleRestock} restockingId={restockingId} />
      {editModal.open && editModal.product && <EditROPModal product={editModal.product} onClose={() => setEditModal({ open: false, product: null })} onSaved={() => {}} />}
    </div>
  );
}
