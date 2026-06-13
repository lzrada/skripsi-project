"use client";

import { useEffect, useState, useMemo } from "react";
import { subscribeToAllOrdersService, updateOrderStatusService, deductStockOnPaymentService, cancelOrderService } from "@/service/order.service";
import { type Order, type OrderStatus } from "@/types/order";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { OrderStatsCard } from "@/components/(admin)/order/OrderStatsCard";
import { OrderFilterBar } from "@/components/(admin)/order/OrderFilterBar";
import { OrderList } from "@/components/(admin)/order/OrderList";

const ALL_STATUSES: (OrderStatus | "Semua")[] = ["Semua", "Menunggu Konfirmasi", "Diproses", "Dikirim", "Selesai", "Dibatalkan"];
const STATUS_FLOW: OrderStatus[] = ["Menunggu Konfirmasi", "Diproses", "Dikirim", "Selesai"];
const ITEMS_PER_PAGE = 8;

type ToastState = { msg: string; type: "success" | "error" } | null;

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

export default function OrdersManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OrderStatus | "Semua">("Semua");
  const [search, setSearch] = useState("");
  const [toastMsg, setToastMsg] = useState<ToastState>(null);
  const [currentPage, setCurrentPage] = useState(1);

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
      if (status === "Diproses") {
        try {
          await deductStockOnPaymentService(id);
        } catch {
          /* already deducted */
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

  const countByStatus = (status: OrderStatus | "Semua") => {
    return status === "Semua" ? orders.length : orders.filter((order) => order.status === status).length;
  };

  const filtered = useMemo(
    () =>
      orders.filter((order) => {
        const matchesTab = activeTab === "Semua" || order.status === activeTab;
        const matchesSearch = !search.trim() || order.id.toLowerCase().includes(search.toLowerCase()) || (order.recipientName ?? "").toLowerCase().includes(search.toLowerCase());
        return matchesTab && matchesSearch;
      }),
    [orders, activeTab, search],
  );

  // Reset ke halaman 1 saat filter/search berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search]);

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

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-7">
      {toastMsg && <div className={`fixed top-5 right-5 z-100 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold text-white transition-all ${toastMsg.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}>{toastMsg.msg}</div>}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen Pesanan</h1>
        <p className="text-sm text-slate-500 mt-0.5">Pantau dan perbarui status semua pesanan masuk.</p>
      </div>

      <OrderStatsCard statuses={ALL_STATUSES.filter((s) => s !== "Semua") as OrderStatus[]} activeTab={activeTab} onTabChange={setActiveTab} countByStatus={countByStatus} loading={loading} />

      <OrderFilterBar search={search} onSearchChange={setSearch} activeTab={activeTab} onTabChange={setActiveTab} statuses={ALL_STATUSES} countByStatus={countByStatus} />

      {/* Info jumlah hasil */}
      {!loading && filtered.length > 0 && (
        <p className="text-xs text-slate-400 mb-3">
          Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} dari {filtered.length} pesanan
        </p>
      )}

      <OrderList orders={paginated} loading={loading} search={search} onStatusChange={handleStatusChange} onCancel={handleCancelOrder} onClearSearch={() => setSearch("")} />

      {!loading && <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
    </div>
  );
}
