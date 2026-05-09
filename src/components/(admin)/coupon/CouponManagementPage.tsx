"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSearch } from "@fortawesome/free-solid-svg-icons";
import { subscribeToCouponsService, addCouponService, updateCouponService, toggleCouponActiveService, type Coupon, type AddCouponPayload } from "@/service/coupon.service";
import { FormModal } from "@/components/(admin)/coupon/formModal";
import { DeleteTarget } from "@/components/(admin)/coupon/deleteTarget";
import { CouponList } from "@/components/(admin)/coupon/CouponList";

const EMPTY_FORM: AddCouponPayload = {
  code: "",
  discount: 0,
  minOrder: 0,
  maxUsage: 0,
  isActive: true,
  expiresAt: null,
};

export function CouponManagementPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<(AddCouponPayload & { id?: string }) | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsub = subscribeToCouponsService((data) => {
      setCoupons(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSave = async (payload: AddCouponPayload & { id?: string }) => {
    if (payload.id) {
      const { id, ...rest } = payload;
      await updateCouponService(id, rest);
    } else {
      await addCouponService(payload);
    }
  };

  const handleToggle = async (coupon: Coupon) => {
    setToggling(coupon.id);
    try {
      await toggleCouponActiveService(coupon.id, !coupon.isActive);
    } finally {
      setToggling(null);
    }
  };

  const filtered = coupons.filter((c) => !search.trim() || c.code.toLowerCase().includes(search.toLowerCase()));

  const activeCoupons = coupons.filter((c) => {
    const expired = c.expiresAt ? new Date(c.expiresAt) < new Date() : false;
    const limitReached = c.maxUsage > 0 && c.usedCount >= c.maxUsage;
    return c.isActive && !expired && !limitReached;
  }).length;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-7">
      {(showForm || editTarget) && (
        <FormModal
          initial={editTarget ?? EMPTY_FORM}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditTarget(null);
          }}
        />
      )}

      {deleteTarget && <DeleteTarget target={deleteTarget} onClose={() => setDeleteTarget(null)} onDeleted={() => setDeleteTarget(null)} />}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen Kupon</h1>
          <p className="text-sm text-slate-500 mt-0.5">{loading ? "Memuat..." : `${coupons.length} kupon · ${activeCoupons} aktif`}</p>
        </div>

        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#1E2753] text-white rounded-xl text-sm font-bold hover:bg-[#2a3470] transition shadow-sm">
          <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />
          Tambah Kupon
        </button>
      </div>

      <div className="relative mb-5">
        <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
        <input
          type="text"
          placeholder="Cari kode kupon..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#1E2753] focus:ring-2 focus:ring-[#1E2753]/10 transition shadow-sm"
        />
      </div>

      <CouponList
        coupons={coupons}
        filtered={filtered}
        loading={loading}
        search={search}
        toggling={toggling}
        onToggle={handleToggle}
        onEdit={(coupon) =>
          setEditTarget({
            id: coupon.id,
            code: coupon.code,
            discount: coupon.discount,
            minOrder: coupon.minOrder,
            maxUsage: coupon.maxUsage,
            isActive: coupon.isActive,
            expiresAt: coupon.expiresAt,
          })
        }
        onDelete={setDeleteTarget}
      />
    </div>
  );
}
