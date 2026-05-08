"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTicket, faPlus, faTrash, faPen, faXmark, faExclamationCircle, faSearch, faPercent, faToggleOn, faToggleOff } from "@fortawesome/free-solid-svg-icons";
import { subscribeToCouponsService, addCouponService, updateCouponService, deleteCouponService, toggleCouponActiveService, type Coupon, type AddCouponPayload } from "@/service/coupon.service";

function formatPrice(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

function safeFormatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

const EMPTY_FORM: AddCouponPayload = {
  code: "",
  discount: 0,
  minOrder: 0,
  maxUsage: 0,
  isActive: true,
  expiresAt: null,
};

// ── Form Modal ─────────────────────────────────────────────────────────────

interface FormModalProps {
  initial: AddCouponPayload & { id?: string };
  onSave: (payload: AddCouponPayload & { id?: string }) => Promise<void>;
  onClose: () => void;
}

function FormModal({ initial, onSave, onClose }: FormModalProps) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isEdit = !!initial.id;

  const set = (k: keyof typeof form, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setError("");
    if (!form.code.trim()) {
      setError("Kode kupon wajib diisi.");
      return;
    }
    if (form.discount <= 0) {
      setError("Diskon harus lebih dari 0.");
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (e: any) {
      setError(e?.message ?? "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full border-2 border-slate-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E2753] focus:ring-2 focus:ring-[#1E2753]/10 transition bg-slate-50 focus:bg-white";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#1E2753]/10 rounded-xl flex items-center justify-center">
              <FontAwesomeIcon icon={faTicket} className="w-4 h-4 text-[#1E2753]" />
            </div>
            <h2 className="text-base font-bold text-gray-800">{isEdit ? "Edit Kupon" : "Tambah Kupon Baru"}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
            <FontAwesomeIcon icon={faExclamationCircle} className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-600 font-medium">{error}</p>
          </div>
        )}

        <div className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1.5 block uppercase tracking-wide">Kode Kupon *</label>
            <input value={form.code} onChange={(e) => set("code", e.target.value.toUpperCase())} placeholder="Contoh: RIZKY50" className={`${inputCls} uppercase font-mono tracking-widest font-bold`} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1.5 block uppercase tracking-wide">Diskon (Rp) *</label>
              <input type="number" min={0} value={form.discount} onChange={(e) => set("discount", Number(e.target.value))} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1.5 block uppercase tracking-wide">Min. Belanja</label>
              <input type="number" min={0} value={form.minOrder} onChange={(e) => set("minOrder", Number(e.target.value))} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1.5 block uppercase tracking-wide">Batas Pemakaian</label>
              <input type="number" min={0} value={form.maxUsage} onChange={(e) => set("maxUsage", Number(e.target.value))} placeholder="0 = unlimited" className={inputCls} />
              <p className="text-[10px] text-gray-400 mt-1">0 = tidak terbatas</p>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1.5 block uppercase tracking-wide">Berlaku Hingga</label>
              <input type="date" value={form.expiresAt ? form.expiresAt.split("T")[0] : ""} onChange={(e) => set("expiresAt", e.target.value ? new Date(e.target.value).toISOString() : null)} className={inputCls} />
              <p className="text-[10px] text-gray-400 mt-1">Kosong = tidak ada expiry</p>
            </div>
          </div>

          <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border-2 border-slate-100">
            <div>
              <p className="text-xs font-bold text-gray-700">Status Kupon</p>
              <p className="text-[10px] text-gray-400">{form.isActive ? "Kupon bisa digunakan" : "Kupon dinonaktifkan"}</p>
            </div>
            <button type="button" onClick={() => set("isActive", !form.isActive)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isActive ? "bg-[#1E2753]" : "bg-gray-300"}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.isActive ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition">
            Batal
          </button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-3 rounded-2xl bg-[#1E2753] text-white font-bold text-sm hover:bg-[#2a3470] disabled:opacity-60 transition">
            {saving ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Kupon"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Halaman Utama ──────────────────────────────────────────────────────────

export default function CouponManagementPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<(AddCouponPayload & { id?: string }) | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [toggling, setToggling] = useState<string | null>(null); // id kupon yg sedang di-toggle
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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteCouponService(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleToggle = async (coupon: Coupon) => {
    setToggling(coupon.id);
    try {
      await toggleCouponActiveService(coupon.id, !coupon.isActive);
    } finally {
      setToggling(null);
    }
  };

  const now = new Date();

  const filtered = coupons.filter((c) => !search.trim() || c.code.toLowerCase().includes(search.toLowerCase()));

  const activeCoupons = coupons.filter((c) => {
    const expired = c.expiresAt ? new Date(c.expiresAt) < now : false;
    const limitReached = c.maxUsage > 0 && c.usedCount >= c.maxUsage;
    return c.isActive && !expired && !limitReached;
  }).length;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-7">
      {/* Form Modal */}
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

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={() => setDeleteTarget(null)}>
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faTrash} className="text-red-500 w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Hapus Kupon?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Kupon <span className="font-bold text-gray-700 font-mono bg-gray-100 px-2 py-0.5 rounded-lg">{deleteTarget.code}</span> akan dihapus permanen.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition">
                Batal
              </button>
              <button onClick={handleDelete} className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition">
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
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

      {/* Search */}
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

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 animate-pulse">
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
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center shadow-sm">
          <FontAwesomeIcon icon={faTicket} className="w-12 h-12 text-gray-200 mb-3" />
          <p className="text-gray-500 font-semibold">{search ? "Kupon tidak ditemukan" : "Belum ada kupon"}</p>
          <p className="text-xs text-gray-400 mt-1">{search ? `Tidak ada hasil untuk "${search}"` : "Tambah kupon diskon untuk pelanggan Anda"}</p>
          {!search && (
            <button onClick={() => setShowForm(true)} className="mt-4 px-5 py-2.5 bg-[#1E2753] text-white rounded-xl text-sm font-bold hover:bg-[#2a3470] transition">
              + Tambah Kupon Pertama
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((c) => {
            const expired = c.expiresAt ? new Date(c.expiresAt) < now : false;
            const limitReached = c.maxUsage > 0 && c.usedCount >= c.maxUsage;
            const isEffectivelyActive = c.isActive && !expired && !limitReached;

            const statusLabel = !c.isActive ? "Nonaktif" : expired ? "Kadaluarsa" : limitReached ? "Habis" : "Aktif";
            const statusCls = isEffectivelyActive ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-500 border-gray-200";

            const usagePct = c.maxUsage > 0 ? Math.min((c.usedCount / c.maxUsage) * 100, 100) : null;

            return (
              <div key={c.id} className={`bg-white rounded-2xl border shadow-sm p-4 transition-all ${isEffectivelyActive ? "border-gray-100 hover:border-[#1E2753]/20" : "border-gray-100 opacity-70"}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Info Kupon */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${isEffectivelyActive ? "bg-[#1E2753]/10" : "bg-gray-100"}`}>
                      <FontAwesomeIcon icon={faTicket} className={`w-5 h-5 ${isEffectivelyActive ? "text-[#1E2753]" : "text-gray-400"}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-gray-800 text-sm tracking-widest font-mono">{c.code}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusCls}`}>{statusLabel}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5">
                        <span className="text-xs font-bold text-[#1E2753]">{formatPrice(c.discount)}</span>
                        {c.minOrder > 0 && <span className="text-[10px] text-gray-400">min. {formatPrice(c.minOrder)}</span>}
                        {c.expiresAt && <span className={`text-[10px] ${expired ? "text-red-500 font-semibold" : "text-gray-400"}`}>exp. {safeFormatDate(c.expiresAt)}</span>}
                      </div>

                      {/* Usage progress bar */}
                      {c.maxUsage > 0 && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[120px]">
                            <div className={`h-1.5 rounded-full transition-all ${usagePct! >= 90 ? "bg-red-400" : usagePct! >= 60 ? "bg-amber-400" : "bg-emerald-400"}`} style={{ width: `${usagePct}%` }} />
                          </div>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {c.usedCount}/{c.maxUsage} terpakai
                          </span>
                        </div>
                      )}
                      {c.maxUsage === 0 && <p className="text-[10px] text-gray-400 mt-0.5">Terpakai {c.usedCount}× · tidak terbatas</p>}
                    </div>
                  </div>

                  {/* Aksi */}
                  <div className="flex items-center gap-2 ml-14 sm:ml-0">
                    <button onClick={() => handleToggle(c)} disabled={toggling === c.id} title={c.isActive ? "Nonaktifkan" : "Aktifkan"} className={`transition-opacity ${toggling === c.id ? "opacity-40" : ""}`}>
                      <FontAwesomeIcon icon={c.isActive ? faToggleOn : faToggleOff} className={`w-8 h-8 transition-colors ${c.isActive ? "text-[#1E2753]" : "text-gray-300"}`} />
                    </button>
                    <button
                      onClick={() =>
                        setEditTarget({
                          id: c.id,
                          code: c.code,
                          discount: c.discount,
                          minOrder: c.minOrder,
                          maxUsage: c.maxUsage,
                          isActive: c.isActive,
                          expiresAt: c.expiresAt,
                        })
                      }
                      className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:border-[#1E2753] hover:text-[#1E2753] transition"
                    >
                      <FontAwesomeIcon icon={faPen} className="w-3 h-3" />
                    </button>
                    <button onClick={() => setDeleteTarget(c)} className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500 transition">
                      <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
