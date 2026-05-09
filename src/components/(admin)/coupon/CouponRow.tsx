import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTicket, faToggleOn, faToggleOff, faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { type Coupon } from "@/service/coupon.service";

export interface CouponRowProps {
  coupon: Coupon;
  toggling: string | null;
  onToggle: (coupon: Coupon) => void;
  onEdit: (coupon: Coupon) => void;
  onDelete: (coupon: Coupon) => void;
}

function formatPrice(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export function CouponRow({ coupon, toggling, onToggle, onEdit, onDelete }: CouponRowProps) {
  const expired = coupon.expiresAt ? new Date(coupon.expiresAt) < new Date() : false;
  const limitReached = coupon.maxUsage > 0 && coupon.usedCount >= coupon.maxUsage;
  const isEffectivelyActive = coupon.isActive && !expired && !limitReached;

  const statusLabel = !coupon.isActive ? "Nonaktif" : expired ? "Kadaluarsa" : limitReached ? "Habis" : "Aktif";
  const statusCls = isEffectivelyActive ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-500 border-gray-200";
  const usagePct = coupon.maxUsage > 0 ? Math.min((coupon.usedCount / coupon.maxUsage) * 100, 100) : null;

  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-4 transition-all ${isEffectivelyActive ? "border-gray-100 hover:border-[#1E2753]/20" : "border-gray-100 opacity-70"}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isEffectivelyActive ? "bg-[#1E2753]/10" : "bg-gray-100"}`}>
            <FontAwesomeIcon icon={faTicket} className={`w-5 h-5 ${isEffectivelyActive ? "text-[#1E2753]" : "text-gray-400"}`} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-gray-800 text-sm tracking-widest font-mono">{coupon.code}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusCls}`}>{statusLabel}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              <span className="text-xs font-bold text-[#1E2753]">{formatPrice(coupon.discount)}</span>
              {coupon.minOrder > 0 && <span className="text-[10px] text-gray-400">min. {formatPrice(coupon.minOrder)}</span>}
              {coupon.expiresAt && <span className={`text-[10px] ${expired ? "text-red-500 font-semibold" : "text-gray-400"}`}>exp. {formatDate(coupon.expiresAt)}</span>}
            </div>

            {coupon.maxUsage > 0 ? (
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-30">
                  <div className={`h-1.5 rounded-full transition-all ${usagePct! >= 90 ? "bg-red-400" : usagePct! >= 60 ? "bg-amber-400" : "bg-emerald-400"}`} style={{ width: `${usagePct}%` }} />
                </div>
                <span className="text-[10px] text-gray-400 font-medium">
                  {coupon.usedCount}/{coupon.maxUsage} terpakai
                </span>
              </div>
            ) : (
              <p className="text-[10px] text-gray-400 mt-0.5">Terpakai {coupon.usedCount}× · tidak terbatas</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-14 sm:ml-0">
          <button onClick={() => onToggle(coupon)} disabled={toggling === coupon.id} title={coupon.isActive ? "Nonaktifkan" : "Aktifkan"} className={`transition-opacity ${toggling === coupon.id ? "opacity-40" : ""}`}>
            <FontAwesomeIcon icon={coupon.isActive ? faToggleOn : faToggleOff} className={`w-8 h-8 transition-colors ${coupon.isActive ? "text-[#1E2753]" : "text-gray-300"}`} />
          </button>
          <button onClick={() => onEdit(coupon)} className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:border-[#1E2753] hover:text-[#1E2753] transition">
            <FontAwesomeIcon icon={faPen} className="w-3 h-3" />
          </button>
          <button onClick={() => onDelete(coupon)} className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500 transition">
            <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
