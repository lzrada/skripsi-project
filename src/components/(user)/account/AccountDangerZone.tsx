"use client";

import { useState } from "react";
import { deleteUserAccountService } from "@/service/user.service";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation, faSpinner, faXmark } from "@fortawesome/free-solid-svg-icons";

interface AccountDangerZoneProps {
  uid: string;
}

export default function AccountDangerZone({ uid }: AccountDangerZoneProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDeleteAccount = async () => {
    setLoading(true);
    setError("");
    try {
      await deleteUserAccountService(uid);

      // Clear semua cookie konsisten dengan auth.service.ts
      const CLEAR = "path=/; max-age=0; SameSite=Strict";
      document.cookie = `firebaseToken=; ${CLEAR}`;
      document.cookie = `userRole=; ${CLEAR}`;
      document.cookie = `uid=; ${CLEAR}`;

      router.push("/register");
    } catch (err: any) {
      console.error(err);
      // Firebase error: requires-recent-login
      if (err?.code === "auth/requires-recent-login") {
        setError("Sesi terlalu lama. Silakan logout lalu login ulang, kemudian coba lagi.");
      } else {
        setError("Gagal menghapus akun. Coba lagi.");
      }
      setLoading(false);
    }
  };

  return (
    <>
      <div className="rounded-3xl border border-red-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>
            <p className="mt-1 text-sm text-gray-500">Hapus akunmu secara permanen. Tindakan ini tidak dapat dibatalkan.</p>
          </div>
          <button
            onClick={() => {
              setOpen(true);
              setError("");
            }}
            className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-700"
          >
            Hapus Akun
          </button>
        </div>
      </div>

      {/* Modal Konfirmasi */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-red-600">Hapus Akun</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <FontAwesomeIcon icon={faTriangleExclamation} className="w-7 h-7 text-red-500" />
              </div>
              <p className="text-sm text-gray-700 font-medium">Yakin ingin menghapus akun ini?</p>
              <p className="text-xs text-gray-500">Semua data kamu termasuk riwayat pesanan akan dihapus permanen dan tidak bisa dipulihkan.</p>
            </div>

            {error && <p className="mt-3 text-xs text-red-500 text-center">{error}</p>}

            <div className="mt-5 flex gap-3">
              <button onClick={() => setOpen(false)} disabled={loading} className="flex-1 rounded-2xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                Batal
              </button>
              <button onClick={handleDeleteAccount} disabled={loading} className="flex-1 rounded-2xl bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
                {loading && <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />}
                {loading ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
