// src/app/(admin-side)/admin/inventory-monitoring/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/config/firebase";
import { updateReorderPointService, updateStockParamsService, markAsRestockedService } from "@/service/inventory.service";
import { calculateReorderPoint, calculateInventoryLevel, isCriticalStock, isLowStock } from "@/constants/inventory";
import { IoBarChartSharp } from "react-icons/io5";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

function formatDate(iso?: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StockBadge({ stock, rop }: { stock: number; rop: number }) {
  const level = calculateInventoryLevel(stock, rop);
  const map = {
    "Stok Kritis": "bg-red-100 text-red-700 border-red-200",
    "Perlu Restock": "bg-amber-100 text-amber-700 border-amber-200",
    "Stok Aman": "bg-green-100 text-green-700 border-green-200",
  };
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${map[level]}`}>{level}</span>;
}

function StockBar({ stock, rop }: { stock: number; rop: number }) {
  const max = Math.max(rop * 3, stock, 1);
  const pct = Math.min((stock / max) * 100, 100);
  const color = isCriticalStock(stock) ? "bg-red-500" : isLowStock(stock, rop) ? "bg-amber-400" : "bg-green-500";
  return (
    <div className="w-full bg-slate-100 rounded-full h-2 mt-1">
      <div className={`h-2 rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditROPModal({ product, onClose, onSaved }: { product: ProductStock; onClose: () => void; onSaved: () => void }) {
  const [mode, setMode] = useState<"manual" | "auto">("auto");
  const [manualROP, setManualROP] = useState(product.reorderPoint);
  const [avgSales, setAvgSales] = useState(product.averageDailySales || 1);
  const [leadTime, setLeadTime] = useState(product.leadTimeDays || 3);
  const [saving, setSaving] = useState(false);

  const autoROP = calculateReorderPoint(avgSales, leadTime);
  const finalROP = mode === "auto" ? autoROP : manualROP;

  async function handleSave() {
    setSaving(true);
    try {
      if (mode === "auto") {
        await updateStockParamsService(product.id, {
          averageDailySales: avgSales,
          leadTimeDays: leadTime,
        });
      } else {
        await updateReorderPointService(product.id, manualROP);
      }
      onSaved();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Atur Reorder Point</h3>
            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">{product.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold leading-none">
            ×
          </button>
        </div>

        {/* Info stok saat ini */}
        <div className="bg-slate-50 rounded-xl p-3 mb-5 flex gap-4 text-sm">
          <div className="text-center flex-1">
            <p className="text-slate-400 text-xs">Stok Sekarang</p>
            <p className="font-bold text-slate-800 text-lg">{product.stock}</p>
          </div>
          <div className="text-center flex-1">
            <p className="text-slate-400 text-xs">ROP Saat Ini</p>
            <p className="font-bold text-amber-600 text-lg">{product.reorderPoint}</p>
          </div>
          <div className="text-center flex-1">
            <p className="text-slate-400 text-xs">Status</p>
            <StockBadge stock={product.stock} rop={product.reorderPoint} />
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex rounded-xl border border-slate-200 overflow-hidden mb-5">
          <button onClick={() => setMode("auto")} className={`flex-1 py-2 text-sm font-semibold transition ${mode === "auto" ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}>
            Hitung Otomatis
          </button>
          <button onClick={() => setMode("manual")} className={`flex-1 py-2 text-sm font-semibold transition ${mode === "manual" ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}>
            Input Manual
          </button>
        </div>

        {mode === "auto" ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 bg-blue-50 border border-blue-100 rounded-lg p-3">
              <span className="font-semibold text-blue-700">Rumus ROP:</span> Rata-rata Penjualan Harian × Lead Time
            </p>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Rata-rata Penjualan Harian (unit)</label>
              <input type="number" min={0} value={avgSales} onChange={(e) => setAvgSales(Number(e.target.value))} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Lead Time (hari pengiriman dari supplier)</label>
              <input type="number" min={1} value={leadTime} onChange={(e) => setLeadTime(Number(e.target.value))} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
              <p className="text-xs text-amber-600">Hasil Perhitungan ROP</p>
              <p className="text-2xl font-black text-amber-700 mt-1">{autoROP} unit</p>
              <p className="text-xs text-amber-500 mt-0.5">
                {avgSales} × {leadTime} = {autoROP}
              </p>
            </div>
          </div>
        ) : (
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Nilai Reorder Point (unit)</label>
            <input type="number" min={0} value={manualROP} onChange={(e) => setManualROP(Number(e.target.value))} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <p className="text-xs text-slate-400 mt-2">Sistem akan memberi notifikasi saat stok ≤ {manualROP} unit.</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
            Batal
          </button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50">
            {saving ? "Menyimpan..." : `Simpan ROP = ${finalROP}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InventoryMonitoringPage() {
  const [products, setProducts] = useState<ProductStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"semua" | "kritis" | "restock" | "aman">("semua");
  const [editModal, setEditModal] = useState<EditModalState>({
    open: false,
    product: null,
  });
  const [restockingId, setRestockingId] = useState<string | null>(null);

  // Subscribe realtime ke semua produk
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

  // Stats ringkasan
  const stats = useMemo(() => {
    const kritis = products.filter((p) => isCriticalStock(p.stock)).length;
    const restock = products.filter((p) => !isCriticalStock(p.stock) && isLowStock(p.stock, p.reorderPoint)).length;
    const aman = products.filter((p) => !isLowStock(p.stock, p.reorderPoint)).length;
    return { kritis, restock, aman, total: products.length };
  }, [products]);

  // Filter + search
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
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Monitoring Stok Inventori</h1>
        <p className="text-gray-500 text-sm mt-1">
          Pemantauan stok menggunakan metode <span className="font-semibold text-[#1E2753]">Reorder Point (ROP)</span> & algoritma <span className="font-semibold text-[#1E2753]">Inventory First</span>
        </p>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Produk" value={stats.total} color="blue" icon="📦" onClick={() => setFilter("semua")} active={filter === "semua"} />
        <StatCard label="Stok Kritis" value={stats.kritis} color="red" icon="🚨" onClick={() => setFilter("kritis")} active={filter === "kritis"} />
        <StatCard label="Perlu Restock" value={stats.restock} color="amber" icon="⚠️" onClick={() => setFilter("restock")} active={filter === "restock"} />
        <StatCard label="Stok Aman" value={stats.aman} color="green" icon="✅" onClick={() => setFilter("aman")} active={filter === "aman"} />
      </div>
      {/* Penjelasan Reorder Point */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 flex gap-3">
        <span className="text-2xl">
          <IoBarChartSharp />
        </span>
        <div>
          <p className="text-sm font-bold text-blue-800">Metode Reorder Point</p>
          <p className="text-xs text-blue-600 mt-0.5">
            Sistem akan memberi peringatan otomatis saat stok suatu produk menyentuh atau di bawah nilai ROP. <span className="font-semibold">Rumus: ROP = Rata-rata Penjualan Harian × Lead Time</span>. Klik tombol <strong>Atur ROP</strong>{" "}
            pada tiap produk untuk menyesuaikan nilainya.
          </p>
        </div>
      </div>
      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari nama produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-80 border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
        />
      </div>
      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Produk</th>
                <th className="text-center px-4 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Stok</th>
                <th className="text-center px-4 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">ROP</th>
                <th className="text-center px-4 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Avg/Hari</th>
                <th className="text-center px-4 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Lead Time</th>
                <th className="text-center px-4 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Status</th>
                <th className="text-center px-4 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 text-sm">
                    Tidak ada produk ditemukan
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className={`hover:bg-slate-50 transition ${isCriticalStock(p.stock) ? "bg-red-50/50" : ""}`}>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800 truncate max-w-[200px]">{p.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {p.category} · {formatPrice(p.price)}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`text-lg font-black ${isCriticalStock(p.stock) ? "text-red-600" : isLowStock(p.stock, p.reorderPoint) ? "text-amber-600" : "text-green-600"}`}>{p.stock}</span>
                      <StockBar stock={p.stock} rop={p.reorderPoint} />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-bold text-slate-700">{p.reorderPoint}</span>
                    </td>
                    <td className="px-4 py-4 text-center text-slate-500">{p.averageDailySales > 0 ? p.averageDailySales : "-"}</td>
                    <td className="px-4 py-4 text-center text-slate-500">{p.leadTimeDays} hari</td>
                    <td className="px-4 py-4 text-center">
                      <StockBadge stock={p.stock} rop={p.reorderPoint} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setEditModal({ open: true, product: p })} className="text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition">
                          Atur ROP
                        </button>
                        {isLowStock(p.stock, p.reorderPoint) && (
                          <button
                            onClick={() => handleRestock(p)}
                            disabled={restockingId === p.id}
                            className="text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                          >
                            {restockingId === p.id ? "..." : "Tandai Restock"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">Tidak ada produk ditemukan</div>
          ) : (
            filtered.map((p) => (
              <div key={p.id} className={`p-4 ${isCriticalStock(p.stock) ? "bg-red-50/50" : ""}`}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.category}</p>
                  </div>
                  <StockBadge stock={p.stock} rop={p.reorderPoint} />
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3 text-center">
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-xs text-slate-400">Stok</p>
                    <p className={`font-black text-base ${isCriticalStock(p.stock) ? "text-red-600" : isLowStock(p.stock, p.reorderPoint) ? "text-amber-600" : "text-green-600"}`}>{p.stock}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-xs text-slate-400">ROP</p>
                    <p className="font-black text-base text-amber-600">{p.reorderPoint}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-xs text-slate-400">Lead Time</p>
                    <p className="font-black text-base text-slate-700">{p.leadTimeDays}h</p>
                  </div>
                </div>
                <StockBar stock={p.stock} rop={p.reorderPoint} />
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setEditModal({ open: true, product: p })} className="flex-1 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 py-2 rounded-lg transition">
                    Atur ROP
                  </button>
                  {isLowStock(p.stock, p.reorderPoint) && (
                    <button
                      onClick={() => handleRestock(p)}
                      disabled={restockingId === p.id}
                      className="flex-1 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 py-2 rounded-lg transition disabled:opacity-50"
                    >
                      {restockingId === p.id ? "..." : "Tandai Restock"}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Edit ROP Modal */}
      {editModal.open && editModal.product && <EditROPModal product={editModal.product} onClose={() => setEditModal({ open: false, product: null })} onSaved={() => {}} />}
    </div>
  );
}

// ─── Stat Card Component ──────────────────────────────────────────────────────

function StatCard({ label, value, color, icon, onClick, active }: { label: string; value: number; color: "blue" | "red" | "amber" | "green"; icon: string; onClick: () => void; active: boolean }) {
  const colorMap = {
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    red: "border-red-200 bg-red-50 text-red-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    green: "border-green-200 bg-green-50 text-green-700",
  };
  const activeRing = {
    blue: "ring-2 ring-blue-400",
    red: "ring-2 ring-red-400",
    amber: "ring-2 ring-amber-400",
    green: "ring-2 ring-green-400",
  };

  return (
    <button onClick={onClick} className={`bg-white rounded-2xl border p-4 text-left transition shadow-sm hover:shadow-md ${colorMap[color]} ${active ? activeRing[color] : "border-slate-200"}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xl">{icon}</span>
        {active && <span className="w-2 h-2 rounded-full bg-current opacity-60" />}
      </div>
      <p className="text-2xl font-black">{value}</p>
      <p className="text-xs font-medium opacity-70 mt-0.5">{label}</p>
    </button>
  );
}
