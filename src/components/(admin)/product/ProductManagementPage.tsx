"use client";

import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { deleteImageFromSupabaseService, deleteProductService, subscribeToProductsService } from "@/service/product.service";
import { Product } from "@/types/product";
import { ProductFilterBar } from "@/components/(admin)/product/ProductFilterBar";
import { ProductGrid } from "@/components/(admin)/product/ProductGrid";
import { ProductModal } from "@/components/(admin)/product/ProductModal";
import { ProductStats } from "@/components/(admin)/product/ProductStats";
import { DeleteModal } from "@/components/(admin)/product/DeleteModal";

type ToastState = { msg: string; type: "success" | "error" } | null;

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

  useEffect(() => {
    const unsub = subscribeToProductsService((data) => {
      setProducts(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

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

  const categories = ["Semua", ...Array.from(new Set(products.map((product) => product.category))).sort()];
  const filteredProducts = products.filter((product) => {
    const matchesSearch = !search.trim() || product.name.toLowerCase().includes(search.toLowerCase()) || product.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "Semua" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-7">
      {toastMsg && <div className={`fixed top-5 right-5 z-100 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold text-white transition-all ${toastMsg.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}>{toastMsg.msg}</div>}

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen Produk</h1>
          <p className="text-sm text-slate-500 mt-0.5">Kelola produk, stok, kategori, dan gambar produk.</p>
        </div>

        <button type="button" onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-[#1E2753] hover:bg-[#2a3470] text-white font-bold px-5 py-2.5 rounded-xl transition text-sm self-start sm:self-auto shadow-sm">
          <FaPlus /> Tambah Produk
        </button>
      </div>

      <ProductStats products={products} loading={loading} />
      <ProductFilterBar search={search} categoryFilter={categoryFilter} categories={categories} onSearchChange={setSearch} onCategoryChange={setCategoryFilter} />

      <ProductGrid products={filteredProducts} loading={loading} search={search} categoryFilter={categoryFilter} onEdit={setEditTarget} onDelete={setDeleteTarget} onOpenAdd={() => setShowAddModal(true)} />

      {showAddModal && <ProductModal mode="add" onClose={() => setShowAddModal(false)} onSuccess={() => showToast("Produk berhasil ditambahkan!", "success")} />}

      {editTarget && <ProductModal mode="edit" initial={editTarget} onClose={() => setEditTarget(null)} onSuccess={() => showToast("Produk berhasil diperbarui!", "success")} />}

      {deleteTarget && <DeleteModal product={deleteTarget} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} isLoading={isDeleting} />}
    </div>
  );
}
