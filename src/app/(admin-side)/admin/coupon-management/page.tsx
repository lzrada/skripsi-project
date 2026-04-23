"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTicket, faPlus, faTrash, faPen, faToggleOn, faToggleOff, faXmark, faCheck, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { subscribeToCouponsService, addCouponService, updateCouponService, deleteCouponService, toggleCouponActiveService, Coupon, AddCouponPayload } from "@/service/coupon.service";

function formatPrice(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

const EMPTY_FORM: AddCouponPayload = {
  code: "",
  discount: 0,
  minOrder: 0,
  maxUsage: 0,
  isActive: true,
  expiresAt: null,
};

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-800">{isEdit ? "Edit Kupon" : "Tambah Kupon"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            <FontAwesomeIcon icon={faExclamationCircle} className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Kode Kupon *</label>
            <input
              value={form.code}
              onChange={(e) => set("code", e.target.value.toUpperCase())}
              placeholder="Contoh: RIZKY50"
              className="w-full border-2 border-gray-100 rounded-xl px-3 py-2.5 text-sm uppercase focus:outline-none focus:border-[#1E2753]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Diskon (Rp) *</label>
              <input
                type="number"
                min={0}
                value={form.discount}
                onChange={(e) => set("discount", Number(e.target.value))}
                className="w-full border-2 border-gray-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E2753]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Min. Belanja (Rp)</label>
              <input
                type="number"
                min={0}
                value={form.minOrder}
                onChange={(e) => set("minOrder", Number(e.target.value))}
                className="w-full border-2 border-gray-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E2753]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Batas Pemakaian</label>
              <input
                type="number"
                min={0}
                value={form.maxUsage}
                onChange={(e) => set("maxUsage", Number(e.target.value))}
                placeholder="0 = unlimited"
                className="w-full border-2 border-gray-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E2753]"
              />
              <p className="text-[10px] text-gray-400 mt-1">0 = tidak terbatas</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Berlaku Hingga</label>
              <input
                type="date"
                value={form.expiresAt ? form.expiresAt.split("T")[0] : ""}
                onChange={(e) => set("expiresAt", e.target.value ? new Date(e.target.value).toISOString() : null)}
                className="w-full border-2 border-gray-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E2753]"
              />
              <p className="text-[10px] text-gray-400 mt-1">Kosong = tidak ada expiry</p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button type="button" onClick={() => set("isActive", !form.isActive)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isActive ? "bg-[#1E2753]" : "bg-gray-300"}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.isActive ? "translate-x-6" : "translate-x-1"}`} />
            </button>
            <span className="text-sm text-gray-600">{form.isActive ? "Aktif" : "Nonaktif"}</span>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50">
            Batal
          </button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-3 rounded-2xl bg-[#1E2753] text-white font-bold text-sm hover:bg-[#2a3470] disabled:opacity-60">
            {saving ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Kupon"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CouponManagementPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<(AddCouponPayload & { id?: string }) | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);

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
    await toggleCouponActiveService(coupon.id, !coupon.isActive);
  };

  const now = new Date();

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setDeleteTarget(null)}>
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faTrash} className="text-red-500 w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Hapus Kupon?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Kupon <span className="font-bold text-gray-700">{deleteTarget.code}</span> akan dihapus permanen.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold text-sm">
                Batal
              </button>
              <button onClick={handleDelete} className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600">
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Manajemen Kupon</h1>
          <p className="text-xs text-gray-400 mt-0.5">{coupons.length} kupon terdaftar</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#1E2753] text-white rounded-xl text-sm font-semibold hover:bg-[#2a3470] transition">
          <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />
          Tambah Kupon
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Memuat kupon...</div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-20">
          <FontAwesomeIcon icon={faTicket} className="w-12 h-12 text-gray-200 mb-3" />
          <p className="text-gray-500 font-semibold">Belum ada kupon</p>
          <p className="text-xs text-gray-400 mt-1">Tambah kupon diskon untuk pelanggan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {coupons.map((c) => {
            const expired = c.expiresAt ? new Date(c.expiresAt) < now : false;
            const limitReached = c.maxUsage > 0 && c.usedCount >= c.maxUsage;
            const statusLabel = !c.isActive ? "Nonaktif" : expired ? "Kadaluarsa" : limitReached ? "Habis" : "Aktif";
            const statusColor = !c.isActive || expired || limitReached ? "bg-gray-100 text-gray-500" : "bg-green-100 text-green-700";

            return (
              <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#1E2753]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FontAwesomeIcon icon={faTicket} className="w-5 h-5 text-[#1E2753]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-800 text-sm tracking-wide">{c.code}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor}`}>{statusLabel}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Diskon <span className="font-semibold text-[#1E2753]">{formatPrice(c.discount)}</span>
                        {c.minOrder > 0 && <> • Min. belanja {formatPrice(c.minOrder)}</>}
                        {c.maxUsage > 0 ? (
                          <>
                            {" "}
                            • Terpakai {c.usedCount}/{c.maxUsage}
                          </>
                        ) : (
                          <> • Terpakai {c.usedCount} kali</>
                        )}
                        {c.expiresAt && <> • Exp. {new Date(c.expiresAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Toggle aktif */}
                    <button onClick={() => handleToggle(c)} title={c.isActive ? "Nonaktifkan" : "Aktifkan"} className={`text-xl transition ${c.isActive ? "text-[#1E2753]" : "text-gray-300"}`}>
                      <FontAwesomeIcon icon={c.isActive ? faToggleOn : faToggleOff} className="w-7 h-7" />
                    </button>
                    <button
                      onClick={() => setEditTarget({ id: c.id, code: c.code, discount: c.discount, minOrder: c.minOrder, maxUsage: c.maxUsage, isActive: c.isActive, expiresAt: c.expiresAt })}
                      className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:border-[#1E2753] hover:text-[#1E2753] transition"
                    >
                      <FontAwesomeIcon icon={faPen} className="w-3 h-3" />
                    </button>
                    <button onClick={() => setDeleteTarget(c)} className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:border-red-400 hover:text-red-500 transition">
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
