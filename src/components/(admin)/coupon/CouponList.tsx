import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTicket } from "@fortawesome/free-solid-svg-icons";
import { type Coupon } from "@/service/coupon.service";
import { CouponRow } from "@/components/(admin)/coupon/CouponRow";

export interface CouponListProps {
  coupons: Coupon[];
  filtered: Coupon[];
  loading: boolean;
  search: string;
  toggling: string | null;
  onToggle: (coupon: Coupon) => void;
  onEdit: (coupon: Coupon) => void;
  onDelete: (coupon: Coupon) => void;
}

export function CouponList({ filtered, loading, search, toggling, onToggle, onEdit, onDelete }: CouponListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-xl" />
              <div className="flex-1">
                <div className="w-28 h-4 bg-slate-200 rounded mb-2" />
                <div className="w-48 h-3 bg-slate-100 rounded" />
              </div>
              <div className="flex gap-2">
                <div className="w-8 h-8 bg-slate-100 rounded-xl" />
                <div className="w-8 h-8 bg-slate-100 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center shadow-sm">
        <FontAwesomeIcon icon={faTicket} className="w-12 h-12 text-gray-200 mb-3" />
        <p className="text-gray-500 font-semibold">{search ? "Kupon tidak ditemukan" : "Belum ada kupon"}</p>
        <p className="text-xs text-gray-400 mt-1">{search ? `Tidak ada hasil untuk "${search}"` : "Tambah kupon diskon untuk pelanggan Anda"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {filtered.map((coupon) => (
        <CouponRow key={coupon.id} coupon={coupon} toggling={toggling} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}
