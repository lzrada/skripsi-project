"use client";

import { useState } from "react";
import { updateUserAddressService } from "@/service/user.service";
import { UserData } from "@/types/user";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faSpinner } from "@fortawesome/free-solid-svg-icons";

interface AccountAddressCardProps {
  user: UserData | null;
}

export default function AccountAddressCard({ user }: AccountAddressCardProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    province: user?.address?.province || "",
    city: user?.address?.city || "",
    district: user?.address?.district || "",
    postalCode: user?.address?.postalCode || "",
    detailAddress: user?.address?.detailAddress || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleOpen = () => {
    setForm({
      province: user?.address?.province || "",
      city: user?.address?.city || "",
      district: user?.address?.district || "",
      postalCode: user?.address?.postalCode || "",
      detailAddress: user?.address?.detailAddress || "",
    });
    setError("");
    setSuccess(false);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!user?.uid) return;
    if (!form.province.trim() || !form.city.trim() || !form.detailAddress.trim()) {
      setError("Provinsi, kota, dan detail alamat wajib diisi.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await updateUserAddressService(user.uid, {
        province: form.province.trim(),
        city: form.city.trim(),
        district: form.district.trim(),
        postalCode: form.postalCode.trim(),
        detailAddress: form.detailAddress.trim(),
      });
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 1000);
    } catch (err) {
      console.error(err);
      setError("Gagal menyimpan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: "province", label: "Provinsi", placeholder: "Contoh: Jawa Timur", type: "text" },
    { key: "city", label: "Kota / Kabupaten", placeholder: "Contoh: Blitar", type: "text" },
    { key: "district", label: "Kecamatan", placeholder: "Contoh: Kepanjenkidul", type: "text" },
    { key: "postalCode", label: "Kode Pos", placeholder: "Contoh: 66181", type: "text" },
    { key: "detailAddress", label: "Alamat Detail", placeholder: "Nama jalan, No. rumah, RT/RW", type: "text" },
  ] as const;

  return (
    <>
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Alamat</h2>
          <button onClick={handleOpen} className="text-sm font-medium text-black hover:underline">
            Edit
          </button>
        </div>
        <div className="space-y-5">
          {[
            { label: "Provinsi", value: user?.address?.province },
            { label: "Kota / Kabupaten", value: user?.address?.city },
            { label: "Kecamatan", value: user?.address?.district },
            { label: "Kode Pos", value: user?.address?.postalCode },
            { label: "Alamat Detail", value: user?.address?.detailAddress },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-xs uppercase tracking-wide text-gray-400">{item.label}</p>
              <p className="mt-1 text-sm font-medium text-gray-900">{item.value || "-"}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Edit Alamat</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {fields.map((f) => (
                <div key={f.key}>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">{f.label}</label>
                  <input
                    type={f.type}
                    value={form[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    className="w-full border-2 border-gray-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E2753] transition"
                  />
                </div>
              ))}
            </div>

            {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
            {success && <p className="mt-3 text-xs text-green-600">Berhasil disimpan!</p>}

            <div className="mt-5 flex gap-3">
              <button onClick={() => setOpen(false)} className="flex-1 rounded-2xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                Batal
              </button>
              <button onClick={handleSave} disabled={loading} className="flex-1 rounded-2xl bg-black py-2.5 text-sm font-medium text-white hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2">
                {loading && <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />}
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
