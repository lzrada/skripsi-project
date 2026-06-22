"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faUserCircle, faSpinner, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { getUidFromCookie } from "@/lib/checkout.helpers";
import { KOTA_JATIM, KECAMATAN_BY_KOTA } from "@/constants/wilayah-jatim";

export interface CheckoutForm {
  nama: string;
  telepon: string;
  alamat: string;
  kecamatan: string;
  kota: string;
  kodePos: string;
  catatan: string;
}

interface Props {
  form: CheckoutForm;
  formError: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFillFromProfile: (data: Partial<CheckoutForm>) => void;
}

const INPUT_CLS = (hasError: boolean) =>
  `w-full border-2 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none transition ${hasError ? "border-red-300 focus:border-red-500 bg-red-50" : "border-gray-100 bg-gray-50 focus:border-[#1E2753] focus:bg-white"}`;

const SELECT_CLS = (hasError: boolean, disabled: boolean) =>
  `w-full border-2 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none transition appearance-none pr-9 ${
    disabled ? "bg-gray-100 border-gray-100 text-gray-400 cursor-not-allowed" : hasError ? "border-red-300 focus:border-red-500 bg-red-50 cursor-pointer" : "border-gray-100 bg-gray-50 focus:border-[#1E2753] focus:bg-white cursor-pointer"
  }`;

// Cari kota yang cocok dengan nama (case-insensitive, trim)
function findKotaId(namaKota: string): string {
  if (!namaKota) return "";
  const normalized = namaKota.trim().toLowerCase();
  return KOTA_JATIM.find((k) => k.name.toLowerCase() === normalized)?.id ?? "";
}

export default function AddressForm({ form, formError, onChange, onFillFromProfile }: Props) {
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileFilled, setProfileFilled] = useState(false);
  const [hasProfileAddress, setHasProfileAddress] = useState<boolean | null>(null);

  // selectedKotaId adalah satu-satunya source of truth untuk kota yang aktif
  const [selectedKotaId, setSelectedKotaId] = useState(() => findKotaId(form.kota));

  const kecamatanList = selectedKotaId ? (KECAMATAN_BY_KOTA[selectedKotaId] ?? []) : [];

  useEffect(() => {
    const uid = getUidFromCookie();
    if (!uid) {
      setHasProfileAddress(false);
      return;
    }
    getCurrentUser(uid).then((user) => {
      const addr = user?.address;
      setHasProfileAddress(!!(addr?.detailAddress || addr?.city));
    });
  }, []);

  const handleKotaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const nama = KOTA_JATIM.find((k) => k.id === id)?.name ?? "";
    setSelectedKotaId(id);
    // Reset kecamatan setiap ganti kota — set keduanya sekaligus
    onFillFromProfile({ kota: nama, kecamatan: "" });
  };

  const handleKecamatanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFillFromProfile({ kecamatan: e.target.value });
  };

  const handleFillFromProfile = async () => {
    setLoadingProfile(true);
    setProfileFilled(false);
    try {
      const uid = getUidFromCookie();
      if (!uid) return;
      const user = await getCurrentUser(uid);
      if (!user) return;

      const addr = user.address ?? {};
      const kotaNama = addr.city || form.kota;
      const kotaId = findKotaId(kotaNama);

      // Set kotaId ke state lokal dulu supaya kecamatanList langsung tersedia
      setSelectedKotaId(kotaId);

      // Validasi: kecamatan dari profil hanya dipakai jika ada di list kota yang ditemukan
      const kecList = kotaId ? (KECAMATAN_BY_KOTA[kotaId] ?? []) : [];
      const kecamatanProfil = addr.district || "";
      const kecamatanValid = kecList.some((k) => k.name.toLowerCase() === kecamatanProfil.trim().toLowerCase());

      onFillFromProfile({
        nama: user.fullName || form.nama,
        telepon: user.phoneNumber || form.telepon,
        alamat: addr.detailAddress || form.alamat,
        kota: kotaNama,
        // Kalau kecamatan dari profil tidak ada di list (ketik bebas lama), kosongkan
        kecamatan: kecamatanValid ? kecamatanProfil : "",
        kodePos: addr.postalCode || form.kodePos,
      });

      setProfileFilled(true);
      setTimeout(() => setProfileFilled(false), 3000);
    } finally {
      setLoadingProfile(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
            <FontAwesomeIcon icon={faLocationDot} className="w-3.5 h-3.5 text-[#E85D04]" />
          </div>
          <p className="text-sm font-bold text-gray-800">Alamat Pengiriman</p>
        </div>
        {hasProfileAddress && (
          <button
            type="button"
            onClick={handleFillFromProfile}
            disabled={loadingProfile}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#1E2753] hover:text-[#2a3470] border border-[#1E2753]/20 hover:border-[#1E2753]/50 bg-[#1E2753]/5 hover:bg-[#1E2753]/10 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
          >
            <FontAwesomeIcon icon={loadingProfile ? faSpinner : faUserCircle} className={`w-3.5 h-3.5 ${loadingProfile ? "animate-spin" : ""}`} />
            {loadingProfile ? "Mengambil..." : profileFilled ? "✓ Terisi dari profil" : "Pakai Alamat Profil"}
          </button>
        )}
      </div>

      {hasProfileAddress === false && (
        <div className="mb-3 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5 text-xs text-amber-700 flex items-start gap-2">
          <span className="mt-0.5">💡</span>
          <span>
            Simpan alamat di{" "}
            <a href="/user/account" target="_blank" className="font-semibold underline">
              halaman profil
            </a>{" "}
            agar bisa auto-isi saat checkout.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Nama */}
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
            Nama Lengkap <span className="text-red-400">*</span>
          </label>
          <input type="text" name="nama" value={form.nama} onChange={onChange} placeholder="Nama penerima" className={INPUT_CLS(!!(formError && !form.nama.trim()))} />
        </div>

        {/* Telepon */}
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
            No. Telepon <span className="text-red-400">*</span>
          </label>
          <input type="tel" name="telepon" value={form.telepon} onChange={onChange} placeholder="08xx-xxxx-xxxx" className={INPUT_CLS(!!(formError && !form.telepon.trim()))} />
        </div>

        {/* Alamat Lengkap */}
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
            Alamat Lengkap <span className="text-red-400">*</span>
          </label>
          <input type="text" name="alamat" value={form.alamat} onChange={onChange} placeholder="Nama jalan, No. rumah, RT/RW, Kelurahan" className={INPUT_CLS(!!(formError && !form.alamat.trim()))} />
        </div>

        {/* Kota / Kabupaten */}
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
            Kota / Kabupaten <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <select value={selectedKotaId} onChange={handleKotaChange} className={SELECT_CLS(!!(formError && !form.kota.trim()), false)}>
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

        {/* Kecamatan */}
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
            Kecamatan <span className="text-red-400">*</span>
            <span className="ml-1 text-[10px] font-normal text-blue-500">(untuk hitung ongkir)</span>
          </label>
          <div className="relative">
            <select value={form.kecamatan} onChange={handleKecamatanChange} disabled={!selectedKotaId} className={SELECT_CLS(!!(formError && !form.kecamatan.trim()), !selectedKotaId)}>
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
          <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Kode Pos</label>
          <input type="text" name="kodePos" value={form.kodePos} onChange={onChange} placeholder="66117" className={INPUT_CLS(false)} />
        </div>

        {/* Catatan */}
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Catatan (opsional)</label>
          <textarea
            name="catatan"
            value={form.catatan}
            onChange={onChange}
            rows={2}
            placeholder="Contoh: Titip di depan pagar, hubungi dulu sebelum antar"
            className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#1E2753] focus:bg-white transition resize-none"
          />
        </div>
      </div>
    </div>
  );
}
