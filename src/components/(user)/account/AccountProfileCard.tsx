"use client";

import { useEffect, useMemo, useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/config/firebase";
import { updateUserProfileService } from "@/service/user.service";
import { UserData } from "@/types/user";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faSpinner, faCircleCheck } from "@fortawesome/free-solid-svg-icons";

interface AccountProfileCardProps {
  user: UserData | null;
}

export default function AccountProfileCard({ user }: AccountProfileCardProps) {
  const normalizedPhotoURL = useMemo(() => {
    const value = typeof user?.photoURL === "string" ? user.photoURL.trim() : "";
    return value && value !== "null" && value !== "undefined" ? value : "";
  }, [user?.photoURL]);

  const [showImage, setShowImage] = useState(Boolean(normalizedPhotoURL));
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setShowImage(Boolean(normalizedPhotoURL));
    setImageError(false);
  }, [normalizedPhotoURL]);

  // Edit Profile modal
  const [editOpen, setEditOpen] = useState(false);
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState(false);

  // Change Password modal
  const [passOpen, setPassOpen] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState(false);

  const handleSaveProfile = async () => {
    if (!user?.uid) return;
    if (!fullName.trim()) {
      setEditError("Nama lengkap wajib diisi.");
      return;
    }
    setEditLoading(true);
    setEditError("");
    try {
      await updateUserProfileService(user.uid, {
        fullName: fullName.trim(),
        photoURL: photoURL.trim(),
      });
      setEditSuccess(true);
      setTimeout(() => {
        setEditOpen(false);
        setEditSuccess(false);
      }, 1000);
    } catch {
      setEditError("Gagal menyimpan. Coba lagi.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleSendResetEmail = async () => {
    if (!user?.email) return;
    setPassLoading(true);
    setPassError("");
    try {
      await sendPasswordResetEmail(auth, user.email);
      setPassSuccess(true);
    } catch {
      setPassError("Gagal mengirim email. Coba lagi.");
    } finally {
      setPassLoading(false);
    }
  };

  const initial = user?.fullName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U";

  return (
    <>
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center text-center">
          {showImage && !imageError ? (
            <img src={normalizedPhotoURL} alt={user?.fullName || user?.email || "User"} className="h-24 w-24 rounded-full object-cover" onError={() => setImageError(true)} />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-black text-3xl font-bold text-white">{initial}</div>
          )}
          <h2 className="mt-4 text-xl font-semibold text-gray-900">{user?.fullName || "User"}</h2>
          <p className="mt-1 text-sm text-gray-500">{user?.email || "-"}</p>
          <div className="mt-4 rounded-full bg-green-100 px-4 py-1 text-xs font-medium text-green-700">Akun Aktif</div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={() => {
              setEditOpen(true);
              setFullName(user?.fullName || "");
              setPhotoURL(user?.photoURL || "");
              setEditError("");
              setEditSuccess(false);
            }}
            className="rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            Edit Profile
          </button>
          <button
            onClick={() => {
              setPassOpen(true);
              setPassError("");
              setPassSuccess(false);
            }}
            className="rounded-2xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Ganti Password
          </button>
        </div>
      </div>

      {/* Modal Edit Profile */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Edit Profile</h3>
              <button onClick={() => setEditOpen(false)} className="text-gray-400 hover:text-gray-600">
                <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
              </button>
            </div>

            {/* Preview foto */}
            <div className="flex flex-col items-center mb-5">
              {photoURL ? (
                <img src={photoURL} alt="preview" className="h-20 w-20 rounded-full object-cover border-2 border-gray-100" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black text-2xl font-bold text-white">{initial}</div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Nama Lengkap</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border-2 border-gray-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E2753] transition"
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">URL Foto Profil (opsional)</label>
                <input
                  type="url"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  className="w-full border-2 border-gray-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E2753] transition"
                  placeholder="https://..."
                />
                <p className="text-xs text-gray-400 mt-1">Paste link foto dari Google, Gravatar, dll.</p>
              </div>
            </div>

            {editError && <p className="mt-3 text-xs text-red-500">{editError}</p>}
            {editSuccess && <p className="mt-3 text-xs text-green-600">Berhasil disimpan!</p>}

            <div className="mt-5 flex gap-3">
              <button onClick={() => setEditOpen(false)} className="flex-1 rounded-2xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                Batal
              </button>
              <button onClick={handleSaveProfile} disabled={editLoading} className="flex-1 rounded-2xl bg-black py-2.5 text-sm font-medium text-white hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2">
                {editLoading && <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />}
                {editLoading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ganti Password */}
      {passOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Ganti Password</h3>
              <button onClick={() => setPassOpen(false)} className="text-gray-400 hover:text-gray-600">
                <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
              </button>
            </div>

            {passSuccess ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <FontAwesomeIcon icon={faCircleCheck} className="w-12 h-12 text-green-500" />
                <p className="text-sm font-semibold text-gray-800 text-center">Email reset password dikirim!</p>
                <p className="text-xs text-gray-500 text-center">
                  Cek inbox <span className="font-medium">{user?.email}</span> dan ikuti instruksinya.
                </p>
                <button onClick={() => setPassOpen(false)} className="mt-2 w-full rounded-2xl bg-black py-2.5 text-sm font-medium text-white hover:opacity-90 transition">
                  Tutup
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-5">
                  Kami akan mengirim link reset password ke email <span className="font-semibold text-gray-700">{user?.email}</span>.
                </p>
                {passError && <p className="mb-3 text-xs text-red-500">{passError}</p>}
                <div className="flex gap-3">
                  <button onClick={() => setPassOpen(false)} className="flex-1 rounded-2xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                    Batal
                  </button>
                  <button
                    onClick={handleSendResetEmail}
                    disabled={passLoading}
                    className="flex-1 rounded-2xl bg-black py-2.5 text-sm font-medium text-white hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {passLoading && <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />}
                    {passLoading ? "Mengirim..." : "Kirim Email"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
