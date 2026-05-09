import { FaBoxOpen } from "react-icons/fa";
import { Product } from "@/types/product";
import { ProductCard } from "@/components/(admin)/product/ProductCard";

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  search: string;
  categoryFilter: string;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onOpenAdd: () => void;
}

export function ProductGrid({ products, loading, search, categoryFilter, onEdit, onDelete, onOpenAdd }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {[...Array(6)].map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 py-20 text-center shadow-sm">
        <FaBoxOpen className="text-5xl mx-auto mb-3 text-slate-200" />
        <p className="font-semibold text-slate-500">{search || categoryFilter !== "Semua" ? "Produk tidak ditemukan" : "Belum ada produk"}</p>
        {!search && categoryFilter === "Semua" && (
          <button onClick={onOpenAdd} className="mt-4 px-5 py-2.5 bg-[#1E2753] text-white rounded-xl text-sm font-bold hover:bg-[#2a3470] transition">
            + Tambah Produk Pertama
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}

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
