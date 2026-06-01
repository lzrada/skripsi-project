import { AddCouponPayload } from "@/service/coupon.service";
import { faExclamationCircle, faTicket, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

const EMPTY_FORM: AddCouponPayload = {
  code: "",
  discount: 0,
  minOrder: 0,
  maxUsage: 0,
  isActive: true,
  expiresAt: null,
};

export interface FormModalProps {
  initial: AddCouponPayload & { id?: string };
  onSave: (payload: AddCouponPayload & { id?: string }) => Promise<void>;
  onClose: () => void;
}

export function FormModal({ initial, onSave, onClose }: FormModalProps) {
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
            <input value={form.code} onChange={(e) => set("code", e.target.value.toUpperCase())} placeholder="Contoh: Rizqi50" className={`${inputCls} uppercase font-mono tracking-widest font-bold`} />
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
