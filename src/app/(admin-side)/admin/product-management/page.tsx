"use client";

import { useState, useEffect, FormEvent, useRef } from "react";
import { FaTrash, FaRupeeSign, FaBox, FaList, FaCheckCircle, FaExclamationTriangle, FaTimes, FaCloudUploadAlt } from "react-icons/fa";
import { Product, addProductService, deleteProductService, subscribeToProductsService, uploadImageService } from "@/service/product.service";

// --- MODAL ALERT KUSTOM (SweetAlert Style) ---
const AlertModal = ({ type, message, onClose }: { type: "success" | "error" | "none"; message: string; onClose: () => void }) => {
  if (type === "none") return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99] p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm text-center transform transition-all scale-100">
        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${type === "success" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
          {type === "success" ? <FaCheckCircle size={40} /> : <FaExclamationTriangle size={40} />}
        </div>
        <h3 className="text-2xl font-bold mb-2">{type === "success" ? "Berhasil!" : "Gagal!"}</h3>
        <p className="text-gray-500 mb-6">{message}</p>
        <button onClick={onClose} className={`w-full py-3 rounded-xl font-bold text-white transition-all ${type === "success" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}`}>
          Oke, Mengerti
        </button>
      </div>
    </div>
  );
};

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({ name: "", price: "", stock: "", category: "" });
  const [alert, setAlert] = useState<{ type: "success" | "error" | "none"; message: string }>({ type: "none", message: "" });

  useEffect(() => {
    const unsubscribe = subscribeToProductsService((data) => setProducts(data));
    return () => unsubscribe();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!imageFile) return setAlert({ type: "error", message: "Harap pilih gambar produk!" });

    setIsLoading(true);
    try {
      // 1. Upload ke Supabase dulu
      const imageUrl = await uploadImageService(imageFile);

      // 2. Simpan ke Firestore
      await addProductService({
        name: formData.name,
        price: Number(formData.price),
        stock: Number(formData.stock),
        category: formData.category,
        imageUrl: imageUrl,
      });

      setAlert({ type: "success", message: "Barang elektronik berhasil terdaftar!" });
      setFormData({ name: "", price: "", stock: "", category: "" });
      setImageFile(null);
      setPreviewUrl(null);
    } catch (error) {
      setAlert({ type: "error", message: "Sistem sedang sibuk, gagal menyimpan data." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-black text-gray-800 mb-8">Management Produk</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FORM TAMBAH PRODUK */}
        <div className="lg:col-span-1 bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden relative">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
            Tambah Inventaris
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Image Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group cursor-pointer w-full h-40 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-all overflow-hidden"
            >
              {previewUrl ? (
                <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <>
                  <FaCloudUploadAlt className="text-4xl text-gray-400 group-hover:text-blue-500 mb-2" />
                  <p className="text-xs text-gray-400 group-hover:text-blue-500 font-medium">Klik untuk upload foto produk</p>
                </>
              )}
              <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nama Barang"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3.5 bg-gray-50 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              <input
                type="number"
                placeholder="Harga (Rp)"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full p-3.5 bg-gray-50 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              <input
                type="number"
                placeholder="Stok"
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full p-3.5 bg-gray-50 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />

              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-3.5 bg-gray-50 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
              >
                <option value="" disabled>
                  Pilih Kategori
                </option>
                <option value="Laptop">Laptop</option>
                <option value="Smartphone">Smartphone</option>
                <option value="Kamera">Kamera</option>
              </select>
            </div>

            <button type="submit" disabled={isLoading} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-gray-200 disabled:bg-gray-400">
              {isLoading ? "Sedang Mengupload..." : "Simpan Produk"}
            </button>
          </form>
        </div>

        {/* TABEL DAFTAR PRODUK */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-xl font-bold">Daftar Barang</h2>
            <span className="px-4 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">{products.length} Total</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50 text-gray-400 text-xs uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-4 text-left">Produk</th>
                  <th className="px-8 py-4 text-left">Kategori</th>
                  <th className="px-8 py-4 text-left">Harga</th>
                  <th className="px-8 py-4 text-left">Stok</th>
                  <th className="px-8 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition-all group">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <img src={item.imageUrl} className="w-12 h-12 rounded-xl object-cover shadow-sm" alt="" />
                        <span className="font-bold text-gray-700">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-sm text-gray-500">{item.category}</td>
                    <td className="px-8 py-4 font-bold text-blue-600">Rp {item.price.toLocaleString("id-ID")}</td>
                    <td className="px-8 py-4 text-sm font-medium">{item.stock} Unit</td>
                    <td className="px-8 py-4 text-center">
                      <button onClick={() => deleteProductService(item.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AlertModal type={alert.type} message={alert.message} onClose={() => setAlert({ type: "none", message: "" })} />
    </div>
  );
};

export default ProductManagement;
