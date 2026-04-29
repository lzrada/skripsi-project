"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FaBox, FaBoxOpen, FaCloudUploadAlt, FaLayerGroup, FaTrash, FaSearch, FaPlus, FaEdit, FaTimes, FaCheck } from "react-icons/fa";
import { addProductService, deleteProductService, deleteImageFromSupabaseService, subscribeToProductsService, updateProductService, uploadMultipleImagesService } from "@/service/product.service";
import { Product } from "@/types/product";

const CATEGORIES = ["Televisi", "Kulkas", "AC", "Mesin Cuci", "Kipas Angin", "Audio", "Laptop", "HP", "Lainnya"];
const CONDITIONS = ["Bekas", "Baru"];

// ── Modal Tambah / Edit Produk ─────────────────────────────────────────
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
    reorderPoint: initial?.reorderPoint?.toString() ?? "5", // default lebih masuk akal
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
    if (files.length === 0) return;
    setNewImageFiles((prev) => [...prev, ...files]);
    setNewImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  };

  const removeNewImage = (index: number) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
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
        reorderPoint: Number(formData.reorderPoint) || 5, // sesuai skripsi
        description: formData.description,
        images: finalImages,
      };

      if (mode === "add") {
        await addProductService(payload);
      } else if (mode === "edit" && initial) {
        // Hapus gambar yang ditandai hapus
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl">
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-slate-100 rounded-t-3xl">
          <h2 className="text-xl font-bold text-slate-800">{mode === "add" ? "Tambah Produk Baru" : "Edit Produk"}</h2>
          <button type="button" onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-4 py-3">{error}</div>}

          {/* Upload Gambar */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Gambar Produk <span className="text-slate-400 font-normal">(bisa lebih dari satu)</span>
            </label>

            {totalImages > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
                {existingImages.map((url, i) => (
                  <div key={`exist-${i}`} className="group relative h-28 rounded-2xl overflow-hidden bg-slate-100">
                    <Image src={url} alt={`Gambar ${i + 1}`} fill className="object-cover" />
                    <button type="button" onClick={() => removeExistingImage(url)} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <FaTimes className="text-white text-xl" />
                    </button>
                    {i === 0 && <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">Utama</span>}
                  </div>
                ))}
                {newImagePreviews.map((url, i) => (
                  <div key={`new-${i}`} className="group relative h-28 rounded-2xl overflow-hidden bg-slate-100">
                    <img src={url} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeNewImage(i)} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <FaTimes className="text-white text-xl" />
                    </button>
                    <span className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <FaCheck className="text-white text-[8px]" />
                    </span>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-28 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50 transition flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-blue-500"
                >
                  <FaPlus className="text-lg" />
                  <span className="text-xs font-medium">Tambah</span>
                </button>
              </div>
            )}

            {totalImages === 0 && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex min-h-[160px] cursor-pointer items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 hover:border-blue-500 hover:bg-blue-50 transition"
              >
                <div className="text-center">
                  <FaCloudUploadAlt className="mx-auto mb-2 text-4xl text-slate-400" />
                  <p className="font-semibold text-slate-700 text-sm">Klik untuk upload gambar</p>
                  <p className="text-xs text-slate-400 mt-1">Bisa pilih beberapa sekaligus</p>
                </div>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Nama Produk <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInput}
                placeholder="Contoh: Smart TV Samsung 43 4K UHD"
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Kategori <span className="text-red-400">*</span>
              </label>
              <select name="category" value={formData.category} onChange={handleInput} className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 transition" required>
                <option value="">Pilih Kategori</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Kondisi <span className="text-red-400">*</span>
              </label>
              <select name="condition" value={formData.condition} onChange={handleInput} className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 transition" required>
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Stok <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="stock"
                min={0}
                value={formData.stock}
                onChange={handleInput}
                placeholder="0"
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 transition"
                required
              />
            </div>

            {/* Reorder Point - sesuai skripsi */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Reorder Point
                <span className="text-slate-400 font-normal text-xs ml-1">(batas minimum stok)</span>
              </label>
              <input
                type="number"
                name="reorderPoint"
                min={1}
                value={formData.reorderPoint}
                onChange={handleInput}
                placeholder="5"
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 transition"
                required
              />
              <p className="text-xs text-slate-400 mt-1">Admin akan mendapat notifikasi jika stok ≤ nilai ini</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Harga Jual <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">Rp</span>
                <input
                  type="number"
                  name="price"
                  min={0}
                  value={formData.price}
                  onChange={handleInput}
                  placeholder="0"
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-500 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Harga Coret <span className="text-slate-400 font-normal text-xs">(opsional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">Rp</span>
                <input
                  type="number"
                  name="originalPrice"
                  min={0}
                  value={formData.originalPrice}
                  onChange={handleInput}
                  placeholder="Kosongkan jika tidak ada diskon"
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Deskripsi Produk</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInput}
                rows={3}
                placeholder="Jelaskan fitur dan kondisi produk..."
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 transition resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition">
              Batal
            </button>
            <button type="submit" disabled={isLoading} className="flex-1 py-3 rounded-2xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition">
              {isLoading ? "Menyimpan..." : mode === "add" ? "Tambah Produk" : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Modal Konfirmasi Hapus ─────────────────────────────────────────────
interface DeleteModalProps {
  product: Product;
  onConfirm: () => void;
  onClose: () => void;
  isLoading: boolean;
}

function DeleteModal({ product, onConfirm, onClose, isLoading }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 text-center">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaTrash className="text-red-500 text-xl" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">Hapus Produk?</h3>
        <p className="text-sm text-slate-500 mb-6">
          Produk <span className="font-semibold text-slate-700">{product.name}</span> akan dihapus permanen beserta semua gambarnya.
        </p>
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

// ── Halaman Utama ─────────────────────────────────────────────────────
export default function ProductManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua");

  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Subscribe realtime produk
  useEffect(() => {
    const unsubscribe = subscribeToProductsService((data) => {
      setProducts(data);
    });
    return () => unsubscribe();
  }, []);

  // Filter produk
  useEffect(() => {
    let result = products;
    if (categoryFilter !== "Semua") {
      result = result.filter((p) => p.category === categoryFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    setFilteredProducts(result);
  }, [search, categoryFilter, products]);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
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

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[100] px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold text-white transition-all 
          ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}`}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Manajemen Produk</h1>
          <p className="mt-1 text-slate-500 text-sm">Kelola produk, stok, kategori, dan gambar produk.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-2xl transition text-sm self-start sm:self-auto">
          <FaPlus /> Tambah Produk
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {[
          { label: "Total Produk", value: products.length, icon: <FaBox />, color: "bg-blue-100 text-blue-600" },
          { label: "Total Kategori", value: new Set(products.map((p) => p.category)).size, icon: <FaLayerGroup />, color: "bg-purple-100 text-purple-600" },
          { label: "Total Stok", value: totalStock, icon: <FaBoxOpen />, color: "bg-emerald-100 text-emerald-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">{s.label}</p>
              <h2 className="mt-1 text-3xl font-bold text-slate-800">{s.value}</h2>
            </div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${s.color}`}>{s.icon}</div>
          </div>
        ))}
      </div>

      {/* Filter & Search */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm mb-6 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Cari nama atau kategori produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 transition"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition 
                ${categoryFilter === cat ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-500 border-slate-200 hover:border-blue-400"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Produk */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <FaBoxOpen className="text-5xl mx-auto mb-3 text-slate-200" />
          <p className="font-semibold">Belum ada produk</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col">
              <div className="relative h-48 bg-slate-100">
                {product.images?.[0] ? (
                  <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <FaBox className="text-4xl" />
                  </div>
                )}
                {product.images.length > 1 && <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">+{product.images.length - 1} foto</span>}
              </div>

              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-semibold text-blue-500">{product.category}</p>
                  <span className="text-xs bg-slate-100 text-slate-500 font-medium px-2 py-0.5 rounded-full">{product.condition ?? "Bekas"}</span>
                </div>
                <h3 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 mb-2">{product.name}</h3>

                <div className="mt-auto">
                  {product.originalPrice && product.originalPrice > product.price && <p className="text-xs text-slate-400 line-through">Rp {Number(product.originalPrice).toLocaleString("id-ID")}</p>}
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-blue-600">Rp {Number(product.price).toLocaleString("id-ID")}</span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full 
                      ${product.stock === 0 ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-700"}`}
                    >
                      {product.stock === 0 ? "Habis" : `Stok ${product.stock}`}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setEditTarget(product)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl border-2 border-blue-200 text-blue-600 text-xs font-semibold hover:bg-blue-50 transition cursor-pointer"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button onClick={() => setDeleteTarget(product)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition cursor-pointer">
                    <FaTrash /> Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showAddModal && <ProductModal mode="add" onClose={() => setShowAddModal(false)} onSuccess={() => showToast("Produk berhasil ditambahkan!", "success")} />}

      {editTarget && <ProductModal mode="edit" initial={editTarget} onClose={() => setEditTarget(null)} onSuccess={() => showToast("Produk berhasil diperbarui!", "success")} />}

      {deleteTarget && <DeleteModal product={deleteTarget} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} isLoading={isDeleting} />}
    </div>
  );
}
