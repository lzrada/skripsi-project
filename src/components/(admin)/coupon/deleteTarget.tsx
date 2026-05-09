import { Coupon, deleteCouponService } from "@/service/coupon.service";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export interface DeleteTargetProps {
  target: Coupon;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteTarget({ target, onClose, onDeleted }: DeleteTargetProps) {
  const handleDelete = async () => {
    await deleteCouponService(target.id);
    onDeleted();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FontAwesomeIcon icon={faTrash} className="text-red-500 w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Hapus Kupon?</h3>
        <p className="text-sm text-gray-500 mb-6">
          Kupon <span className="font-bold text-gray-700 font-mono bg-gray-100 px-2 py-0.5 rounded-lg">{target.code}</span> akan dihapus permanen.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition">
            Batal
          </button>
          <button onClick={handleDelete} className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition">
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
