"use client";

import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faCircleCheck, faEnvelope, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { resetPassword } from "@/service/auth.service";

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/user-not-found") {
        setError("Email tidak terdaftar. Periksa kembali alamat email kamu.");
      } else {
        setError("Gagal mengirim email reset. Coba lagi beberapa saat.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4 py-10">
      {/* Decorative blobs */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-[#1E2753]/8 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="fixed bottom-0 right-0 w-80 h-80 bg-orange-400/10 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl shadow-blue-900/10 p-8">
          {success ? (
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <FontAwesomeIcon icon={faCircleCheck} className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-black text-slate-800">Email Terkirim!</h2>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                Cek inbox email <span className="font-bold text-slate-700">{email}</span> dan ikuti instruksi untuk mereset password kamu.
              </p>
              <p className="text-xs text-slate-400 bg-slate-50 rounded-xl px-4 py-2.5 w-full">
                💡 Jika tidak ada di inbox, cek folder <strong>Spam / Junk</strong>
              </p>
              <Link
                href="/login"
                className="mt-2 w-full py-3 bg-[#1E2753] hover:bg-[#2a3470] text-white rounded-2xl font-bold text-sm transition-all text-center shadow-lg shadow-blue-900/20"
              >
                Kembali ke Login
              </Link>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors text-xs font-semibold mb-6 w-fit"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3" />
                Kembali ke Login
              </Link>

              <div className="mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                  <FontAwesomeIcon icon={faEnvelope} className="w-6 h-6 text-[#1E2753]" />
                </div>
                <h1 className="text-2xl font-black text-slate-800 mb-1">Lupa Password?</h1>
                <p className="text-sm text-slate-500 leading-relaxed">Masukkan email kamu dan kami akan kirimkan link untuk mereset password.</p>
              </div>

              {error && (
                <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-2xl px-4 py-3 mb-4">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1.5 block">Alamat Email</label>
                  <div className="relative">
                    <FontAwesomeIcon icon={faEnvelope} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      placeholder="nama@email.com"
                      required
                      className="w-full h-11 bg-slate-50 border-2 border-slate-200 rounded-2xl pl-10 pr-4 text-sm text-slate-700 focus:outline-none focus:border-[#1E2753] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-[#1E2753] hover:bg-[#2a3470] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                >
                  {loading && <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />}
                  {loading ? "Mengirim..." : "Kirim Link Reset"}
                </button>
              </form>

              <p className="text-center text-xs text-slate-400 mt-5">
                Ingat password kamu?{" "}
                <Link href="/login" className="text-[#1E2753] font-bold hover:underline">
                  Masuk di sini
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

