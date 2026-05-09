import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";

interface CancelOrderModalProps {
  orderId: string;
  updating: boolean;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export function CancelOrderModal({ orderId, updating, onConfirm, onClose }: CancelOrderModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 text-center">
        <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FontAwesomeIcon icon={faCircleXmark} className="text-red-500 w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">Batalkan Pesanan?</h3>
        <p className="text-sm text-slate-500 mb-1">
          Pesanan <span className="font-bold text-slate-700 font-mono">#{orderId.slice(0, 8).toUpperCase()}</span> akan dibatalkan.
        </p>
        <p className="text-xs text-slate-400 mb-6 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">⚠️ Stok produk akan dikembalikan secara otomatis.</p>
        <div className="flex gap-3">
          <button onClick={onClose} type="button" className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition">
            Kembali
          </button>
          <button onClick={onConfirm} disabled={updating} type="button" className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 disabled:opacity-60 transition">
            {updating ? "Membatalkan..." : "Ya, Batalkan"}
          </button>
        </div>
      </div>
    </div>
  );
}
