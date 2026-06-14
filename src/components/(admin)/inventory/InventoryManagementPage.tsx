"use client";

import { useEffect, useState, useMemo } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/config/firebase";
import { markAsRestockedService } from "@/service/inventory.service";
import { calculateReorderPoint, calculateInventoryLevel, isCriticalStock, isLowStock } from "@/constants/inventory";
import { IoBarChartSharp } from "react-icons/io5";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { EditROPModal } from "@/components/(admin)/inventory/EditROPModal";
import { StockBadge } from "@/components/(admin)/inventory/StockBadge";
import { StockBar } from "@/components/(admin)/inventory/StockBar";
import { formatPrice } from "@/components/(admin)/inventory/inventoryHelpers";

const ITEMS_PER_PAGE = 8;

function PaginationControls({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) {
  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <>
      <div className="flex items-center justify-center gap-1 mt-6 flex-wrap">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 text-slate-500 hover:border-[#1E2753] hover:text-[#1E2753] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          aria-label="Halaman sebelumnya"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
        </button>

        {getPageNumbers().map((page, idx) =>
          page === "..." ? (
            <span key={`dots-${idx}`} className="flex items-center justify-center w-9 h-9 text-slate-400 text-sm">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`flex items-center justify-center w-9 h-9 rounded-xl text-sm font-semibold border transition-all ${
                currentPage === page ? "bg-[#1E2753] text-white border-[#1E2753] shadow-md" : "bg-white text-slate-600 border-slate-200 hover:border-[#1E2753] hover:text-[#1E2753]"
              }`}
            >
              {page}
            </button>
          ),
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 text-slate-500 hover:border-[#1E2753] hover:text-[#1E2753] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          aria-label="Halaman berikutnya"
        >
          <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3" />
        </button>
      </div>
      <p className="text-center text-xs text-slate-400 mt-2">
        Halaman {currentPage} dari {totalPages}
      </p>
    </>
  );
}

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

interface StatCardProps {
  label: string;
  value: number;
  color: "blue" | "red" | "amber" | "green";
  icon: string;
  onClick: () => void;
  active: boolean;
}

function StatCard({ label, value, color, icon, onClick, active }: StatCardProps) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    red: "bg-red-50 text-red-700 border-red-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    green: "bg-green-50 text-green-700 border-green-200",
  };
  return (
    <button onClick={onClick} className={`text-left rounded-2xl p-4 border-2 transition ${active ? `${colorMap[color]} border-current` : "bg-white border-slate-200 hover:border-slate-300"}`}>
      <p className="text-2xl mb-2">{icon}</p>
      <p className="text-sm font-semibold text-slate-600">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${active ? "" : "text-slate-800"}`}>{value}</p>
    </button>
  );
}

export default function InventoryManagementPage() {
  const [products, setProducts] = useState<ProductStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"semua" | "kritis" | "restock" | "aman">("semua");
  const [editModal, setEditModal] = useState<EditModalState>({
    open: false,
    product: null,
  });
  const [restockingId, setRestockingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

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

  // Reset ke halaman 1 saat search/filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

      {/* Info jumlah hasil */}
      {!loading && filtered.length > 0 && (
        <p className="text-xs text-slate-400 mb-3">
          Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} dari {filtered.length} produk
        </p>
      )}

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
                {/* <th className="text-center px-4 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Avg/Hari</th> */}
                <th className="text-center px-4 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Lead Time</th>
                <th className="text-center px-4 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Status</th>
                <th className="text-center px-4 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 text-sm">
                    Tidak ada produk ditemukan
                  </td>
                </tr>
              ) : (
                paginated.map((p) => (
                  <tr key={p.id} className={`hover:bg-slate-50 transition ${isCriticalStock(p.stock) ? "bg-red-50/50" : ""}`}>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800 truncate max-w-50">{p.name}</p>
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
                    {/* <td className="px-4 py-4 text-center text-slate-500">{p.averageDailySales > 0 ? p.averageDailySales : "-"}</td> */}
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
          {paginated.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">Tidak ada produk ditemukan</div>
          ) : (
            paginated.map((p) => (
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

      {/* Pagination */}
      <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />

      {/* Edit ROP Modal */}
      {editModal.open && editModal.product && <EditROPModal product={editModal.product} onClose={() => setEditModal({ open: false, product: null })} onSaved={() => {}} />}
    </div>
  );
}
