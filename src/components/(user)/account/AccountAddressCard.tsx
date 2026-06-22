"use client";

import { useState } from "react";
import { updateUserAddressService } from "@/service/user.service";
import { UserData } from "@/types/user";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faSpinner, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { KOTA_JATIM, KECAMATAN_BY_KOTA } from "@/constants/wilayah-jatim";

interface AccountAddressCardProps {
  user: UserData | null;
}

function findKotaId(namaKota: string): string {
  if (!namaKota) return "";
  const normalized = namaKota.trim().toLowerCase();
  return KOTA_JATIM.find((k) => k.name.toLowerCase() === normalized)?.id ?? "";
}

const SELECT_CLS = "w-full border-2 border-gray-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E2753] transition appearance-none pr-9 bg-white cursor-pointer";

const SELECT_DISABLED_CLS = "w-full border-2 border-gray-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none transition appearance-none pr-9 bg-gray-100 text-gray-400 cursor-not-allowed";

export default function AccountAddressCard({ user }: AccountAddressCardProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    province: user?.address?.province || "",
    city: user?.address?.city || "",
    district: user?.address?.district || "",
    postalCode: user?.address?.postalCode || "",
    detailAddress: user?.address?.detailAddress || "",
  });
  const [selectedKotaId, setSelectedKotaId] = useState(() => findKotaId(user?.address?.city || ""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const kecamatanList = selectedKotaId ? (KECAMATAN_BY_KOTA[selectedKotaId] ?? []) : [];

  const handleOpen = () => {
    const city = user?.address?.city || "";
    setForm({
      province: user?.address?.province || "",
      city,
      district: user?.address?.district || "",
      postalCode: user?.address?.postalCode || "",
      detailAddress: user?.address?.detailAddress || "",
    });
    setSelectedKotaId(findKotaId(city));
    setError("");
    setSuccess(false);
    setOpen(true);
  };

  const handleKotaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const nama = KOTA_JATIM.find((k) => k.id === id)?.name ?? "";
    setSelectedKotaId(id);
    setForm((prev) => ({ ...prev, city: nama, district: "" }));
  };

  const handleKecamatanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, district: e.target.value }));
  };

  const handleSave = async () => {
    if (!user?.uid) return;
    if (!form.city.trim() || !form.detailAddress.trim()) {
      setError("Kota dan detail alamat wajib diisi.");
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

      {/* Modal Edit */}
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
              {/* Provinsi — tetap text, tidak terikat Jatim saja */}
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Provinsi</label>
                <input
                  type="text"
                  value={form.province}
                  onChange={(e) => setForm({ ...form, province: e.target.value })}
                  placeholder="Contoh: Jawa Timur"
                  className="w-full border-2 border-gray-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E2753] transition"
                />
              </div>

              {/* Kota — dropdown */}
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Kota / Kabupaten <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <select value={selectedKotaId} onChange={handleKotaChange} className={SELECT_CLS}>
                    <option value="">— Pilih Kota / Kabupaten —</option>
                    {KOTA_JATIM.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.name}
                      </option>
                    ))}
                  </select>
                  <FontAwesomeIcon icon={faChevronDown} className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Kecamatan — dropdown, disabled sampai kota dipilih */}
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Kecamatan</label>
                <div className="relative">
                  <select value={form.district} onChange={handleKecamatanChange} disabled={!selectedKotaId} className={!selectedKotaId ? SELECT_DISABLED_CLS : SELECT_CLS}>
                    <option value="">{!selectedKotaId ? "Pilih kota terlebih dahulu" : "— Pilih Kecamatan —"}</option>
                    {kecamatanList.map((k) => (
                      <option key={k.id} value={k.name}>
                        {k.name}
                      </option>
                    ))}
                  </select>
                  <FontAwesomeIcon icon={faChevronDown} className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Kode Pos */}
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Kode Pos</label>
                <input
                  type="text"
                  value={form.postalCode}
                  onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                  placeholder="Contoh: 66181"
                  className="w-full border-2 border-gray-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E2753] transition"
                />
              </div>

              {/* Alamat Detail */}
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Alamat Detail <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.detailAddress}
                  onChange={(e) => setForm({ ...form, detailAddress: e.target.value })}
                  placeholder="Nama jalan, No. rumah, RT/RW"
                  className="w-full border-2 border-gray-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E2753] transition"
                />
              </div>
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
