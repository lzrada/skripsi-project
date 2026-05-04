// src/components/(user)/checkout/AddressForm.tsx
"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";

export interface CheckoutForm {
  nama: string;
  telepon: string;
  alamat: string;
  kota: string;
  kodePos: string;
  catatan: string;
}

interface Props {
  form: CheckoutForm;
  formError: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const fields = [
  { name: "nama", label: "Nama Lengkap", placeholder: "Nama penerima", required: true, type: "text", span: false },
  { name: "telepon", label: "No. Telepon", placeholder: "08xx-xxxx-xxxx", required: true, type: "tel", span: false },
  { name: "alamat", label: "Alamat Lengkap", placeholder: "Nama jalan, No. rumah, RT/RW, Kelurahan", required: true, type: "text", span: true },
  { name: "kota", label: "Kota / Kabupaten", placeholder: "Contoh: Blitar", required: false, type: "text", span: false },
  { name: "kodePos", label: "Kode Pos", placeholder: "21425", required: false, type: "text", span: false },
] as const;

export default function AddressForm({ form, formError, onChange }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
          <FontAwesomeIcon icon={faLocationDot} className="w-3.5 h-3.5 text-[#E85D04]" />
        </div>
        <p className="text-sm font-bold text-gray-800">Alamat Pengiriman</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {fields.map((f) => (
          <div key={f.name} className={f.span ? "sm:col-span-2" : ""}>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
              {f.label} {f.required && <span className="text-red-400">*</span>}
            </label>
            <input
              type={f.type}
              name={f.name}
              value={form[f.name as keyof CheckoutForm]}
              onChange={onChange}
              placeholder={f.placeholder}
              className={`w-full border-2 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none transition ${
                formError && f.required && !form[f.name as keyof CheckoutForm].trim() ? "border-red-300 focus:border-red-500 bg-red-50" : "border-gray-100 bg-gray-50 focus:border-[#1E2753] focus:bg-white"
              }`}
            />
          </div>
        ))}

        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Catatan (opsional)</label>
          <textarea
            name="catatan"
            value={form.catatan}
            onChange={onChange}
            placeholder="Contoh: Titip di depan pagar, hubungi dulu sebelum antar"
            rows={2}
            className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#1E2753] focus:bg-white transition resize-none"
          />
        </div>
      </div>
    </div>
  );
}
