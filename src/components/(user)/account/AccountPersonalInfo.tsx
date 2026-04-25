"use client";

import { useState } from "react";
import { updateUserPersonalInfoService } from "@/service/user.service";
import { UserData } from "@/types/user";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faSpinner } from "@fortawesome/free-solid-svg-icons";

interface AccountPersonalInfoProps {
  user: UserData | null;
}

export default function AccountPersonalInfo({ user }: AccountPersonalInfoProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ fullName: user?.fullName || "", phoneNumber: user?.phoneNumber || "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    if (!user?.uid) return;
    if (!form.fullName.trim()) {
      setError("Nama lengkap wajib diisi.");
      return;
    }
    if (!form.phoneNumber.trim()) {
      setError("Nomor telepon wajib diisi.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await updateUserPersonalInfoService(user.uid, {
        fullName: form.fullName.trim(),
        phoneNumber: form.phoneNumber.trim(),
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
          <h2 className="text-lg font-semibold text-gray-900">Informasi Pribadi</h2>
          <button
            onClick={() => {
              setOpen(true);
              setForm({ fullName: user?.fullName || "", phoneNumber: user?.phoneNumber || "" });
              setError("");
              setSuccess(false);
            }}
            className="text-sm font-medium text-black hover:underline"
          >
            Edit
          </button>
        </div>
        <div className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">Nama Lengkap</p>
            <p className="mt-1 text-sm font-medium text-gray-900">{user?.fullName || "-"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">Email</p>
            <p className="mt-1 text-sm font-medium text-gray-900">{user?.email || "-"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">Nomor Telepon</p>
            <p className="mt-1 text-sm font-medium text-gray-900">{user?.phoneNumber || "-"}</p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Edit Informasi Pribadi</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Nama Lengkap</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full border-2 border-gray-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E2753] transition"
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Nomor Telepon</label>
                <input
                  type="tel"
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  className="w-full border-2 border-gray-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E2753] transition"
                  placeholder="08xx-xxxx-xxxx"
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
