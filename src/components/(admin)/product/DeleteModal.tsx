import { FaTrash } from "react-icons/fa";
import { Product } from "@/types/product";

interface DeleteModalProps {
  product: Product;
  onConfirm: () => void;
  onClose: () => void;
  isLoading: boolean;
}

export function DeleteModal({ product, onConfirm, onClose, isLoading }: DeleteModalProps) {
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
        <p className="text-xs text-slate-400 mb-6 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
          ⚠️ Produk dan semua gambarnya akan dihapus permanen.
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
