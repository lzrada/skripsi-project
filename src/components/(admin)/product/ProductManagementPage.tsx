"use client";

import { useEffect, useState, useMemo } from "react";
import { FaPlus, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { deleteImageFromSupabaseService, deleteProductService, subscribeToProductsService } from "@/service/product.service";
import { Product } from "@/types/product";
import { ProductFilterBar } from "@/components/(admin)/product/ProductFilterBar";
import { ProductGrid } from "@/components/(admin)/product/ProductGrid";
import { ProductModal } from "@/components/(admin)/product/ProductModal";
import { ProductStats } from "@/components/(admin)/product/ProductStats";
import { DeleteModal } from "@/components/(admin)/product/DeleteModal";

type ToastState = { msg: string; type: "success" | "error" } | null;

const ITEMS_PER_PAGE = 9;

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
          <FaChevronLeft className="w-3 h-3" />
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
          <FaChevronRight className="w-3 h-3" />
        </button>
      </div>
      <p className="text-center text-xs text-slate-400 mt-2">
        Halaman {currentPage} dari {totalPages}
      </p>
    </>
  );
}

export default function ProductManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMsg, setToastMsg] = useState<ToastState>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const unsub = subscribeToProductsService((data) => {
      setProducts(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Reset ke halaman 1 saat filter/search berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter]);

  const showToast = (msg: string, type: "success" | "error") => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await Promise.all(deleteTarget.images.map((url) => deleteImageFromSupabaseService(url)));
      await deleteProductService(deleteTarget.id);
      showToast("Produk berhasil dihapus.", "success");
    } catch {
      showToast("Gagal menghapus produk.", "error");
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const categories = ["Semua", ...Array.from(new Set(products.map((p) => p.category))).sort()];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        !search.trim() ||
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "Semua" || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-7">
      {toastMsg && (
        <div
          className={`fixed top-5 right-5 z-[100] px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold text-white transition-all ${
            toastMsg.type === "success" ? "bg-emerald-500" : "bg-red-500"
          }`}
        >
          {toastMsg.msg}
        </div>
      )}

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen Produk</h1>
          <p className="text-sm text-slate-500 mt-0.5">Kelola produk, stok, kategori, dan gambar produk.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#1E2753] hover:bg-[#2a3470] text-white font-bold px-5 py-2.5 rounded-xl transition text-sm self-start sm:self-auto shadow-sm"
        >
          <FaPlus /> Tambah Produk
        </button>
      </div>

      <ProductStats products={products} loading={loading} />

      <ProductFilterBar
        search={search}
        categoryFilter={categoryFilter}
        categories={categories}
        onSearchChange={setSearch}
        onCategoryChange={setCategoryFilter}
      />

      {/* Info jumlah hasil */}
      {!loading && filteredProducts.length > 0 && (
        <p className="text-xs text-slate-400 mb-3">
          Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} dari{" "}
          {filteredProducts.length} produk
        </p>
      )}

      {/* Grid — hanya render item halaman aktif */}
      <ProductGrid
        products={paginatedProducts}
        loading={loading}
        search={search}
        categoryFilter={categoryFilter}
        onEdit={setEditTarget}
        onDelete={setDeleteTarget}
        onOpenAdd={() => setShowAddModal(true)}
      />

      {/* Pagination */}
      {!loading && <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}

      {showAddModal && (
        <ProductModal
          mode="add"
          onClose={() => setShowAddModal(false)}
          onSuccess={() => showToast("Produk berhasil ditambahkan!", "success")}
        />
      )}

      {editTarget && (
        <ProductModal
          mode="edit"
          initial={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={() => showToast("Produk berhasil diperbarui!", "success")}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          product={deleteTarget}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}