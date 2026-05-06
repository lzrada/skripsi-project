// src/app/(admin-side)/admin/product-management/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FaBox, FaBoxOpen, FaCloudUploadAlt, FaLayerGroup, FaTrash, FaSearch, FaPlus, FaEdit, FaTimes, FaCheck, FaFire } from "react-icons/fa";
import { addProductService, deleteProductService, deleteImageFromSupabaseService, subscribeToProductsService, updateProductService, uploadMultipleImagesService } from "@/service/product.service";
import { Product } from "@/types/product";
import { categoryGradient, defaultGradient, categoryIcon, defaultCategoryIcon } from "@/constants/category";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const CATEGORIES = ["Televisi", "Kulkas", "AC", "Mesin Cuci", "Kipas Angin", "Audio", "Laptop", "HP", "Lainnya"];
const CONDITIONS = ["Bekas", "Baru"];

function formatPrice(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

// ── Stock badge — sama persis dengan user side ─────────────────────────────
function StockBadge({ stock }: { stock: number }) {
  if (stock === 0)
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
        Habis
      </span>
    );
  if (stock <= 3)
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
        <FaFire className="w-2.5 h-2.5" />
        Hampir Habis! Sisa {stock}
      </span>
    );
  if (stock <= 10)
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        Terbatas ({stock})
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      Stok {stock}
    </span>
  );
}

// ── Modal Tambah / Edit ────────────────────────────────────────────────────
interface ProductModalProps {
  mode: "add" | "edit";
  initial?: Product;
  onClose: () => void;
  onSuccess: () => void;
}

function ProductModal({ mode, initial, onClose, onSuccess }: ProductModalProps) {
  const [formData, setFormData] = useState({
    name: initial?.name ?? "",
    category: initial?.category ?? "",
    condition: initial?.condition ?? "Bekas",
    price: initial?.price?.toString() ?? "",
    originalPrice: initial?.originalPrice?.toString() ?? "",
    stock: initial?.stock?.toString() ?? "",
    reorderPoint: initial?.reorderPoint?.toString() ?? "5",
    description: initial?.description ?? "",
  });
  const [existingImages, setExistingImages] = useState<string[]>(initial?.images ?? []);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setNewImageFiles((prev) => [...prev, ...files]);
    setNewImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  };

  const removeNewImage = (i: number) => {
    setNewImageFiles((prev) => prev.filter((_, idx) => idx !== i));
    setNewImagePreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const removeExistingImage = (url: string) => {
    setExistingImages((prev) => prev.filter((u) => u !== url));
    setImagesToDelete((prev) => [...prev, url]);
  };

  const totalImages = existingImages.length + newImageFiles.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!formData.name || !formData.category || !formData.price || !formData.stock) {
      setError("Nama, kategori, harga, dan stok wajib diisi.");
      return;
    }
    if (totalImages === 0) {
      setError("Minimal satu gambar produk wajib diunggah.");
      return;
    }
    const priceNum = Number(formData.price);
    const originalPriceNum = formData.originalPrice ? Number(formData.originalPrice) : undefined;
    if (originalPriceNum && originalPriceNum <= priceNum) {
      setError("Harga coret harus lebih besar dari harga jual.");
      return;
    }
    setIsLoading(true);
    try {
      const uploadedUrls = newImageFiles.length > 0 ? await uploadMultipleImagesService(newImageFiles) : [];
      const finalImages = [...existingImages, ...uploadedUrls];
      const payload = {
        name: formData.name,
        category: formData.category,
        condition: formData.condition,
        originalPrice: originalPriceNum,
        price: priceNum,
        stock: Number(formData.stock),
        reorderPoint: Number(formData.reorderPoint) || 5,
        description: formData.description,
        images: finalImages,
      };
      if (mode === "add") {
        await addProductService(payload);
      } else if (mode === "edit" && initial) {
        await Promise.all(imagesToDelete.map((url) => deleteImageFromSupabaseService(url)));
        await updateProductService(initial.id, payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = "w-full rounded-xl border-2 border-slate-100 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#1E2753] focus:ring-2 focus:ring-[#1E2753]/10 focus:bg-white transition";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl">
        <div className="sticky top-0 z-10 bg-white flex items-center justify-between px-6 py-4 border-b border-slate-100 rounded-t-3xl">
          <div>
            <h2 className="text-lg font-bold text-slate-800">{mode === "add" ? "Tambah Produk Baru" : "Edit Produk"}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{mode === "add" ? "Isi semua field yang wajib (*)" : `Mengedit: ${initial?.name}`}</p>
          </div>
          <button type="button" onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 flex items-start gap-2">
              <FaTimes className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* Upload Gambar */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
              Gambar Produk *<span className="text-slate-400 font-normal text-xs ml-1 normal-case">(bisa lebih dari satu)</span>
            </label>
            {totalImages > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
                {existingImages.map((url, i) => (
                  <div key={`exist-${i}`} className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 border-2 border-slate-200">
                    {/* FIX: object-contain dengan padding — tidak terpotong */}
                    <Image src={url} alt={`Gambar ${i + 1}`} fill className="object-contain p-2" />
                    <button type="button" onClick={() => removeExistingImage(url)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <FaTimes className="text-white text-lg" />
                    </button>
                    {i === 0 && <span className="absolute bottom-1 left-1 bg-[#1E2753] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">Utama</span>}
                  </div>
                ))}
                {newImagePreviews.map((url, i) => (
                  <div key={`new-${i}`} className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 border-2 border-emerald-200">
                    <img src={url} alt={`Preview ${i + 1}`} className="w-full h-full object-contain p-2" />
                    <button type="button" onClick={() => removeNewImage(i)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <FaTimes className="text-white text-lg" />
                    </button>
                    <span className="absolute top-1 right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow">
                      <FaCheck className="text-white text-[8px]" />
                    </span>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-[#1E2753] hover:bg-[#1E2753]/5 transition flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-[#1E2753]"
                >
                  <FaPlus className="text-base" />
                  <span className="text-[10px] font-medium">Tambah</span>
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex min-h-[160px] cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:border-[#1E2753] hover:bg-[#1E2753]/5 transition"
              >
                <div className="text-center">
                  <FaCloudUploadAlt className="mx-auto mb-2 text-4xl text-slate-300" />
                  <p className="font-semibold text-slate-600 text-sm">Klik untuk upload gambar</p>
                  <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP — bisa pilih beberapa</p>
                </div>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                Nama Produk <span className="text-red-400">*</span>
              </label>
              <input type="text" name="name" value={formData.name} onChange={handleInput} placeholder="Contoh: Smart TV Samsung 43 4K UHD" className={inputCls} required />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                Kategori <span className="text-red-400">*</span>
              </label>
              <select name="category" value={formData.category} onChange={handleInput} className={inputCls} required>
                <option value="">Pilih Kategori</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                Kondisi <span className="text-red-400">*</span>
              </label>
              <select name="condition" value={formData.condition} onChange={handleInput} className={inputCls} required>
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                Stok <span className="text-red-400">*</span>
              </label>
              <input type="number" name="stock" min={0} value={formData.stock} onChange={handleInput} placeholder="0" className={inputCls} required />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                Reorder Point
                <span className="text-slate-400 font-normal text-xs ml-1 normal-case">(min. stok alert)</span>
              </label>
              <input type="number" name="reorderPoint" min={1} value={formData.reorderPoint} onChange={handleInput} placeholder="5" className={inputCls} required />
              <p className="text-[10px] text-slate-400 mt-1">Notifikasi muncul saat stok ≤ nilai ini</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                Harga Jual <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">Rp</span>
                <input type="number" name="price" min={0} value={formData.price} onChange={handleInput} placeholder="0" className={`${inputCls} pl-10`} required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                Harga Coret
                <span className="text-slate-400 font-normal text-xs ml-1 normal-case">(opsional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">Rp</span>
                <input type="number" name="originalPrice" min={0} value={formData.originalPrice} onChange={handleInput} placeholder="Kosongkan jika tidak ada" className={`${inputCls} pl-10`} />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Deskripsi</label>
              <textarea name="description" value={formData.description} onChange={handleInput} rows={3} placeholder="Jelaskan fitur dan kondisi produk..." className={`${inputCls} resize-none`} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition">
              Batal
            </button>
            <button type="submit" disabled={isLoading} className="flex-1 py-3 rounded-xl bg-[#1E2753] text-white font-bold text-sm hover:bg-[#2a3470] disabled:opacity-60 transition">
              {isLoading ? "Menyimpan..." : mode === "add" ? "Tambah Produk" : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Modal Hapus ────────────────────────────────────────────────────────────
interface DeleteModalProps {
  product: Product;
  onConfirm: () => void;
  onClose: () => void;
  isLoading: boolean;
}

function DeleteModal({ product, onConfirm, onClose, isLoading }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 text-center">
        <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FaTrash className="text-red-500 text-xl" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">Hapus Produk?</h3>
        <p className="text-sm text-slate-500 mb-1">
          <span className="font-semibold text-slate-700">{product.name}</span>
        </p>
        <p className="text-xs text-slate-400 mb-6 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">⚠️ Produk dan semua gambarnya akan dihapus permanen.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition">
            Batal
          </button>
          <button onClick={onConfirm} disabled={isLoading} className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 disabled:opacity-60 transition">
            {isLoading ? "Menghapus..." : "Ya, Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-pulse">
      <div className="aspect-square bg-slate-100" />
      <div className="p-4 space-y-2.5">
        <div className="w-16 h-3 bg-slate-100 rounded" />
        <div className="w-full h-4 bg-slate-200 rounded" />
        <div className="w-3/4 h-4 bg-slate-200 rounded" />
        <div className="flex justify-between items-center mt-2">
          <div className="w-24 h-5 bg-slate-200 rounded" />
          <div className="w-16 h-5 bg-slate-100 rounded-full" />
        </div>
        <div className="flex gap-2 mt-3">
          <div className="flex-1 h-9 bg-slate-100 rounded-xl" />
          <div className="flex-1 h-9 bg-slate-100 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ── Halaman Utama ──────────────────────────────────────────────────────────
export default function ProductManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua");
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ msg: string; type: "success" | "error" } | null>(null);

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

  const categories = ["Semua", ...Array.from(new Set(products.map((p) => p.category))).sort()];
  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);

  const filteredProducts = products.filter((p) => {
    const matchCat = categoryFilter === "Semua" || p.category === categoryFilter;
    const matchSearch = !search.trim() || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-7">
      {/* Toast */}
      {toastMsg && <div className={`fixed top-5 right-5 z-[100] px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold text-white transition-all ${toastMsg.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}>{toastMsg.msg}</div>}

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen Produk</h1>
          <p className="text-sm text-slate-500 mt-0.5">Kelola produk, stok, kategori, dan gambar produk.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-[#1E2753] hover:bg-[#2a3470] text-white font-bold px-5 py-2.5 rounded-xl transition text-sm self-start sm:self-auto shadow-sm">
          <FaPlus /> Tambah Produk
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Produk", value: products.length, icon: <FaBox />, color: "bg-[#1E2753]/10 text-[#1E2753]" },
          { label: "Total Kategori", value: new Set(products.map((p) => p.category)).size, icon: <FaLayerGroup />, color: "bg-violet-100 text-violet-600" },
          { label: "Total Stok", value: totalStock, icon: <FaBoxOpen />, color: "bg-emerald-100 text-emerald-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
              <h2 className="mt-1 text-3xl font-black text-slate-800">{loading ? "—" : s.value}</h2>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${s.color}`}>{s.icon}</div>
          </div>
        ))}
      </div>

      {/* Filter & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-5 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Cari nama atau kategori..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#1E2753] focus:ring-2 focus:ring-[#1E2753]/10 transition"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${categoryFilter === cat ? "bg-[#1E2753] text-white border-[#1E2753]" : "bg-white text-slate-500 border-slate-200 hover:border-[#1E2753]/50"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 py-20 text-center shadow-sm">
          <FaBoxOpen className="text-5xl mx-auto mb-3 text-slate-200" />
          <p className="font-semibold text-slate-500">{search || categoryFilter !== "Semua" ? "Produk tidak ditemukan" : "Belum ada produk"}</p>
          {!search && categoryFilter === "Semua" && (
            <button onClick={() => setShowAddModal(true)} className="mt-4 px-5 py-2.5 bg-[#1E2753] text-white rounded-xl text-sm font-bold hover:bg-[#2a3470] transition">
              + Tambah Produk Pertama
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => {
            const discountPct = product.originalPrice && product.originalPrice > product.price ? Math.round((1 - product.price / product.originalPrice) * 100) : null;

            return (
              <div key={product.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#1E2753]/20 transition-all duration-200 overflow-hidden flex flex-col group">
                {/* Gambar — FIX: aspect-square + object-contain + padding, sama seperti user side */}
                <div className="relative aspect-square bg-slate-50 overflow-hidden">
                  {product.images?.[0] ? (
                    <Image src={product.images[0]} alt={product.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw" className="object-contain p-4 group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${categoryGradient[product.category] ?? defaultGradient} flex items-center justify-center`}>
                      <FontAwesomeIcon icon={categoryIcon[product.category] ?? defaultCategoryIcon} className="w-12 h-12 text-white/50" />
                    </div>
                  )}

                  {/* Badge diskon */}
                  {discountPct && discountPct > 0 && <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg z-10">-{discountPct}%</span>}

                  {/* Jumlah foto */}
                  {product.images.length > 1 && <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full z-10">+{product.images.length - 1} foto</span>}
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-[#1E2753] uppercase tracking-wide">{product.category}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-500 font-medium px-2 py-0.5 rounded-full">{product.condition ?? "Bekas"}</span>
                  </div>

                  <h3 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 flex-1 mb-2">{product.name}</h3>

                  <div className="mt-auto space-y-2">
                    {product.originalPrice && product.originalPrice > product.price && <p className="text-xs text-slate-400 line-through">{formatPrice(product.originalPrice)}</p>}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-base font-black text-[#1E2753]">{formatPrice(product.price)}</span>
                      <StockBadge stock={product.stock} />
                    </div>

                    {/* Reorder point info */}
                    {product.stock <= (product.reorderPoint ?? 5) && product.stock > 0 && (
                      <p className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">⚠️ Di bawah Reorder Point ({product.reorderPoint ?? 5})</p>
                    )}
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setEditTarget(product)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 border-[#1E2753]/20 text-[#1E2753] text-xs font-bold hover:bg-[#1E2753] hover:text-white transition cursor-pointer"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(product)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-50 border-2 border-red-100 text-red-500 text-xs font-bold hover:bg-red-500 hover:text-white transition cursor-pointer"
                    >
                      <FaTrash /> Hapus
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showAddModal && <ProductModal mode="add" onClose={() => setShowAddModal(false)} onSuccess={() => showToast("Produk berhasil ditambahkan!", "success")} />}
      {editTarget && <ProductModal mode="edit" initial={editTarget} onClose={() => setEditTarget(null)} onSuccess={() => showToast("Produk berhasil diperbarui!", "success")} />}
      {deleteTarget && <DeleteModal product={deleteTarget} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} isLoading={isDeleting} />}
    </div>
  );
}
