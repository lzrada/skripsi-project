"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FaBox, FaBoxOpen, FaCloudUploadAlt, FaLayerGroup, FaTrash, FaSearch, FaPlus } from "react-icons/fa";
import { Product, addProductService, deleteProductService, subscribeToProductsService, uploadMultipleImagesService } from "@/service/product.service";

export default function ProductManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
  });

  useEffect(() => {
    const unsubscribe = subscribeToProductsService((data) => {
      setProducts(data);
      setFilteredProducts(data);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const filtered = products.filter((item) => {
      return item.name.toLowerCase().includes(search.toLowerCase()) || item.category.toLowerCase().includes(search.toLowerCase());
    });

    setFilteredProducts(filtered);
  }, [search, products]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    setImageFiles((prev) => [...prev, ...files]);

    const previews = files.map((file) => URL.createObjectURL(file));

    setPreviewImages((prev) => [...prev, ...previews]);
  };

  const handleRemovePreviewImage = (index: number) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.category || !formData.price || !formData.stock || imageFiles.length === 0) {
      alert("Semua field wajib diisi");
      return;
    }

    try {
      setIsLoading(true);

      const imageUrls = await uploadMultipleImagesService(imageFiles);

      await addProductService({
        name: formData.name,
        category: formData.category,
        price: Number(formData.price),
        stock: Number(formData.stock),
        images: imageUrls,
      });

      setFormData({
        name: "",
        category: "",
        price: "",
        stock: "",
      });

      setImageFiles([]);
      setPreviewImages([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      alert("Produk berhasil ditambahkan");
    } catch (error) {
      console.error(error);
      alert("Gagal menambahkan produk");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const confirmDelete = confirm("Yakin ingin menghapus produk ini?");

    if (!confirmDelete) return;

    try {
      await deleteProductService(id);
      alert("Produk berhasil dihapus");
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus produk");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800">Product Management</h1>
        <p className="mt-2 text-slate-500">Kelola produk, stok, kategori, dan gambar produk dengan lebih mudah.</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Produk</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-800">{products.length}</h2>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl text-blue-600">
              <FaBox />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Kategori</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-800">{new Set(products.map((item) => item.category)).size}</h2>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-2xl text-purple-600">
              <FaLayerGroup />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Stok</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-800">{products.reduce((acc, item) => acc + item.stock, 0)}</h2>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-2xl text-emerald-600">
              <FaBoxOpen />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-1">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
              <FaPlus />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-800">Tambah Produk</h2>
              <p className="text-sm text-slate-500">Tambahkan produk baru ke toko</p>
            </div>
          </div>

          <form onSubmit={handleAddProduct} className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex min-h-[220px] cursor-pointer items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-blue-500 hover:bg-blue-50"
            >
              {previewImages.length > 0 ? (
                <div className="grid h-full w-full grid-cols-2 gap-2 p-2">
                  {previewImages.map((image, index) => (
                    <div key={index} className="group relative h-32 overflow-hidden rounded-2xl">
                      <img src={image} alt={`Preview ${index + 1}`} className="h-full w-full object-cover" />

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePreviewImage(index);
                        }}
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-sm text-white opacity-0 transition group-hover:opacity-100"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center">
                  <FaCloudUploadAlt className="mx-auto mb-3 text-5xl text-slate-400" />
                  <p className="font-semibold text-slate-700">Upload Gambar Produk</p>
                  <p className="mt-1 text-sm text-slate-500">Bisa upload lebih dari satu gambar</p>
                </div>
              )}

              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
            </div>

            <input
              type="text"
              name="name"
              placeholder="Nama Produk"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500"
            />

            <input
              type="text"
              name="category"
              placeholder="Kategori Produk"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500"
            />

            <input
              type="number"
              name="price"
              placeholder="Harga Produk"
              value={formData.price}
              onChange={handleInputChange}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500"
            />

            <input
              type="number"
              name="stock"
              placeholder="Stok Produk"
              value={formData.stock}
              onChange={handleInputChange}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? "Loading..." : "Tambah Produk"}
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Daftar Produk</h2>
              <p className="text-sm text-slate-500">Total {filteredProducts.length} produk ditemukan</p>
            </div>

            <div className="relative w-full md:w-80">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                placeholder="Cari produk..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 py-3 pl-12 pr-4 outline-none transition focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredProducts.map((product) => (
              <div key={product.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:shadow-md">
                <div className="relative mb-4 h-48 overflow-hidden rounded-2xl bg-slate-200">
                  <Image src={product.images?.[0] || "/images/no-image.png"} alt={product.name} fill className="object-cover" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-800">{product.name}</h3>

                  <p className="text-sm text-slate-500">{product.category}</p>

                  <p className="text-sm text-slate-400">{product.images?.length || 0} foto produk</p>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-blue-600">Rp {Number(product.price).toLocaleString("id-ID")}</span>

                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-600">Stok {product.stock}</span>
                  </div>

                  <button onClick={() => handleDeleteProduct(product.id)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 py-3 font-semibold text-white transition hover:bg-red-600">
                    <FaTrash />
                    Hapus Produk
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
