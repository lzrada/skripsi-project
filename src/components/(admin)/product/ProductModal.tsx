"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Image from "next/image";
import { FaCloudUploadAlt, FaCheck, FaPlus, FaTimes } from "react-icons/fa";
import { addProductService, deleteImageFromSupabaseService, updateProductService, uploadMultipleImagesService } from "@/service/product.service";
import { Product } from "@/types/product";

const CATEGORIES = ["Televisi", "Kulkas", "AC", "Mesin Cuci", "Kipas Angin", "Audio", "Laptop", "HP", "Lainnya"];
const CONDITIONS = ["Bekas", "Baru"];

interface ProductModalProps {
  mode: "add" | "edit";
  initial?: Product;
  onClose: () => void;
  onSuccess: () => void;
}

export function ProductModal({ mode, initial, onClose, onSuccess }: ProductModalProps) {
  const [formData, setFormData] = useState({
    name: initial?.name ?? "",
    category: initial?.category ?? "",
    condition: initial?.condition ?? CONDITIONS[0],
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

  const totalImages = existingImages.length + newImageFiles.length;

  const handleInput = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setNewImageFiles((prev) => [...prev, ...files]);
    setNewImagePreviews((prev) => [...prev, ...files.map((file) => URL.createObjectURL(file))]);
    e.target.value = "";
  };

  const removeNewImage = (index: number) => {
    setNewImageFiles((prev) => prev.filter((_, idx) => idx !== index));
    setNewImagePreviews((prev) => prev.filter((_, idx) => idx !== index));
  };

  const removeExistingImage = (url: string) => {
    setExistingImages((prev) => prev.filter((item) => item !== url));
    setImagesToDelete((prev) => [...prev, url]);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
              <FaTimes className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
              Gambar Produk *<span className="text-slate-400 font-normal text-xs ml-1 normal-case">(bisa lebih dari satu)</span>
            </label>

            {totalImages > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
                {existingImages.map((url, index) => (
                  <div key={`exist-${index}`} className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 border-2 border-slate-200">
                    <Image src={url} alt={`Gambar ${index + 1}`} fill className="object-contain p-2" />
                    <button type="button" onClick={() => removeExistingImage(url)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <FaTimes className="text-white text-lg" />
                    </button>
                    {index === 0 && <span className="absolute bottom-1 left-1 bg-[#1E2753] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">Utama</span>}
                  </div>
                ))}
                {newImagePreviews.map((url, index) => (
                  <div key={`new-${index}`} className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 border-2 border-emerald-200">
                    <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-contain p-2" />
                    <button type="button" onClick={() => removeNewImage(index)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
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
                className="flex min-h-40 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:border-[#1E2753] hover:bg-[#1E2753]/5 transition"
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
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                Kondisi <span className="text-red-400">*</span>
              </label>
              <select name="condition" value={formData.condition} onChange={handleInput} className={inputCls} required>
                {CONDITIONS.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
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
