"use client";

import { useEffect, useState, useMemo } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/config/firebase";
import { calculateReorderPoint, calculateInventoryLevel, isCriticalStock, isLowStock } from "@/constants/inventory";
import { markAsRestockedService } from "@/service/inventory.service";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

import { InventoryHeader } from "@/components/(admin)/inventory/InventoryHeader";
import { InventoryStatsCards } from "@/components/(admin)/inventory/InventoryStatsCards";
import { InventoryMethodInfo } from "@/components/(admin)/inventory/InventoryMethodInfo";
import { InventorySearchBar } from "@/components/(admin)/inventory/InventorySearchBar";
import { InventoryTableContainer } from "@/components/(admin)/inventory/InventoryTableContainer";
import { EditROPModal } from "@/components/(admin)/inventory/EditROPModal";

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
      <InventoryHeader />
      <InventoryStatsCards total={stats.total} kritis={stats.kritis} restock={stats.restock} aman={stats.aman} filter={filter} onFilterChange={setFilter} />
      <InventoryMethodInfo />
      <InventorySearchBar search={search} onSearchChange={setSearch} />

      {/* Info jumlah hasil */}
      {filtered.length > 0 && (
        <p className="text-xs text-slate-400 mb-3">
          Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} dari {filtered.length} produk
        </p>
      )}

      <InventoryTableContainer filtered={paginated} onEditROP={(p) => setEditModal({ open: true, product: p })} onRestock={handleRestock} restockingId={restockingId} />

      {/* Pagination */}
      <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />

      {editModal.open && editModal.product && <EditROPModal product={editModal.product} onClose={() => setEditModal({ open: false, product: null })} onSaved={() => {}} />}
    </div>
  );
}
