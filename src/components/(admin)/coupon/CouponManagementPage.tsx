"use client";

import { useEffect, useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSearch, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import {
  subscribeToCouponsService,
  addCouponService,
  updateCouponService,
  toggleCouponActiveService,
  type Coupon,
  type AddCouponPayload,
} from "@/service/coupon.service";
import { FormModal } from "@/components/(admin)/coupon/formModal";
import { DeleteTarget } from "@/components/(admin)/coupon/deleteTarget";
import { CouponList } from "@/components/(admin)/coupon/CouponList";

const EMPTY_FORM: AddCouponPayload = {
  code: "",
  discount: 0,
  minOrder: 0,
  maxUsage: 0,
  isActive: true,
  expiresAt: null,
};

const ITEMS_PER_PAGE = 8;

function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
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
            <span
              key={`dots-${idx}`}
              className="flex items-center justify-center w-9 h-9 text-slate-400 text-sm"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`flex items-center justify-center w-9 h-9 rounded-xl text-sm font-semibold border transition-all ${
                currentPage === page
                  ? "bg-[#1E2753] text-white border-[#1E2753] shadow-md"
                  : "bg-white text-slate-600 border-slate-200 hover:border-[#1E2753] hover:text-[#1E2753]"
              }`}
            >
              {page}
            </button>
          )
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

export function CouponManagementPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<(AddCouponPayload & { id?: string }) | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const unsub = subscribeToCouponsService((data) => {
      setCoupons(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Reset ke halaman 1 saat search berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handleSave = async (payload: AddCouponPayload & { id?: string }) => {
    if (payload.id) {
      const { id, ...rest } = payload;
      await updateCouponService(id, rest);
    } else {
      await addCouponService(payload);
    }
  };

  const handleToggle = async (coupon: Coupon) => {
    setToggling(coupon.id);
    try {
      await toggleCouponActiveService(coupon.id, !coupon.isActive);
    } finally {
      setToggling(null);
    }
  };

  const filtered = useMemo(() => {
    return coupons.filter(
      (c) => !search.trim() || c.code.toLowerCase().includes(search.toLowerCase())
    );
  }, [coupons, search]);

  const activeCoupons = useMemo(() => {
    return coupons.filter((c) => {
      const expired = c.expiresAt ? new Date(c.expiresAt) < new Date() : false;
      const limitReached = c.maxUsage > 0 && c.usedCount >= c.maxUsage;
      return c.isActive && !expired && !limitReached;
    }).length;
  }, [coupons]);

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
      {(showForm || editTarget) && (
        <FormModal
          initial={editTarget ?? EMPTY_FORM}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditTarget(null);
          }}
        />
      )}

      {deleteTarget && (
        <DeleteTarget
          target={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => setDeleteTarget(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen Kupon</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {loading ? "Memuat..." : `${coupons.length} kupon · ${activeCoupons} aktif`}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1E2753] text-white rounded-xl text-sm font-bold hover:bg-[#2a3470] transition shadow-sm"
        >
          <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />
          Tambah Kupon
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <FontAwesomeIcon
          icon={faSearch}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5"
        />
        <input
          type="text"
          placeholder="Cari kode kupon..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#1E2753] focus:ring-2 focus:ring-[#1E2753]/10 transition shadow-sm"
        />
      </div>

      {/* Info jumlah hasil */}
      {!loading && filtered.length > 0 && (
        <p className="text-xs text-slate-400 mb-3">
          Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
          {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} dari {filtered.length} kupon
        </p>
      )}

      {/* List kupon — hanya render halaman aktif */}
      <CouponList
        coupons={coupons}
        filtered={paginated}
        loading={loading}
        search={search}
        toggling={toggling}
        onToggle={handleToggle}
        onEdit={(coupon) =>
          setEditTarget({
            id: coupon.id,
            code: coupon.code,
            discount: coupon.discount,
            minOrder: coupon.minOrder,
            maxUsage: coupon.maxUsage,
            isActive: coupon.isActive,
            expiresAt: coupon.expiresAt,
          })
        }
        onDelete={setDeleteTarget}
      />

      {/* Pagination */}
      {!loading && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}