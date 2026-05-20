"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faSpinner, faCircleCheck, faEnvelope, faLock, faUser, faPhone, faBolt } from "@fortawesome/free-solid-svg-icons";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { registerWithEmail, loginWithGoogle, handleGoogleRedirect } from "@/service/auth.service";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const checkGoogle = async () => {
      const res = (await handleGoogleRedirect()) as {
        success: boolean;
      } | null;
      if (res?.success) window.location.replace("/user/dashboard-user");
    };
    checkGoogle();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Nama lengkap wajib diisi.");
      return;
    }
    if (!phoneNumber.trim()) {
      setError("Nomor telepon wajib diisi.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Format email tidak valid.");
      return;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak sama.");
      return;
    }

    setLoading(true);
    try {
      await registerWithEmail(email, password, fullName, phoneNumber);
      setSuccess(true);
    } catch (err: any) {
      const code = err?.code;
      if (code === "auth/email-already-in-use") setError("Email sudah terdaftar. Silakan login.");
      else if (code === "auth/invalid-email") setError("Format email tidak valid.");
      else if (code === "auth/weak-password") setError("Password terlalu lemah. Minimal 6 karakter.");
      else setError(err.message || "Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoadingGoogle(true);
    try {
      await loginWithGoogle();
    } catch {
      setError("Register dengan Google gagal. Silakan coba lagi.");
      setLoadingGoogle(false);
    }
  };

  // ── Success state ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-blue-900/10 p-8 sm:p-10 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <FontAwesomeIcon icon={faCircleCheck} className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Akun Berhasil Dibuat!</h2>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed">
            Akun untuk <span className="font-bold text-slate-700">{email}</span> sudah siap. Silakan login untuk mulai belanja.
          </p>
          <Link href="/login" className="block w-full py-3 bg-[#1E2753] hover:bg-[#2a3470] text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-900/20">
            Ke Halaman Login
          </Link>
        </div>
      </div>
    );
  }

  const fields = [
    {
      id: "fullName",
      label: "Nama Lengkap",
      type: "text",
      value: fullName,
      onChange: setFullName,
      placeholder: "Masukkan nama lengkap",
      icon: faUser,
    },
    {
      id: "phoneNumber",
      label: "Nomor Telepon",
      type: "tel",
      value: phoneNumber,
      onChange: setPhoneNumber,
      placeholder: "08xx-xxxx-xxxx",
      icon: faPhone,
    },
    {
      id: "email",
      label: "Email",
      type: "email",
      value: email,
      onChange: setEmail,
      placeholder: "nama@email.com",
      icon: faEnvelope,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      {/* Decorative blobs */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-[#1E2753]/8 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="fixed bottom-0 right-0 w-80 h-80 bg-orange-400/10 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3" />

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-3xl shadow-2xl shadow-blue-900/10 overflow-hidden">
        {/* ── Left: branding — desktop only ── */}
        <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-[#1E2753] via-[#243080] to-[#1a2060] p-10 text-white relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
                <FontAwesomeIcon icon={faBolt} className="w-5 h-5 text-[#1E2753]" />
              </div>
              <div>
                <p className="font-black text-lg leading-none">Rizky</p>
                <p className="text-yellow-400 text-xs font-bold tracking-widest">ELEKTRONIK</p>
              </div>
            </div>
            <h2 className="text-3xl font-black leading-snug mb-4">
              Gabung Sekarang,
              <br />
              <span className="text-yellow-400">Belanja Lebih Hemat</span>
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">Buat akun gratis dan nikmati semua keuntungan berbelanja di Rizky Elektronik.</p>
          </div>
          <div className="relative z-10 space-y-3">
            {[
              { emoji: "⚡", text: "Daftar gratis, mudah & cepat" },
              { emoji: "🎯", text: "Pantau semua pesanan real-time" },
              { emoji: "❤️", text: "Simpan produk favorit di wishlist" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <span className="text-lg">{item.emoji}</span>
                <p className="text-white/70 text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: form ── */}
        {/*
          Mobile: scroll dalam layar penuh — overflow-y-auto + max-h-screen
          supaya form panjang bisa di-scroll tanpa outer page jump
        */}
        <div className="flex flex-col justify-start md:justify-center px-6 py-7 sm:px-10 sm:py-10 overflow-y-auto max-h-screen md:max-h-none">
          {/* Mobile: branding + chip keunggulan */}
          <div className="md:hidden mb-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 bg-[#1E2753] rounded-xl flex items-center justify-center">
                <FontAwesomeIcon icon={faBolt} className="w-4 h-4 text-yellow-400" />
              </div>
              <div>
                <span className="font-black text-[#1E2753] text-base">Rizky</span>
                <span className="text-[#E85D04] text-xs font-bold tracking-widest ml-1">ELEKTRONIK</span>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {["⚡ Daftar Gratis", "🎯 Pantau Pesanan", "❤️ Simpan Wishlist"].map((chip) => (
                <span key={chip} className="text-[11px] font-semibold bg-[#1E2753]/8 text-[#1E2753] px-2.5 py-1 rounded-full">
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <h1 className="text-2xl font-black text-slate-800 mb-1">Buat akun baru</h1>
          <p className="text-sm text-slate-500 mb-5">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-[#1E2753] font-bold hover:underline">
              Masuk di sini
            </Link>
          </p>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-2xl px-4 py-3 mb-4">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-3.5">
            {/* Field: nama, telp, email */}
            {fields.map((f) => (
              <div key={f.id}>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block">{f.label}</label>
                <div className="relative">
                  <FontAwesomeIcon icon={f.icon} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={f.type}
                    value={f.value}
                    onChange={(e) => {
                      f.onChange(e.target.value);
                      setError("");
                    }}
                    placeholder={f.placeholder}
                    required
                    className="w-full h-11 bg-slate-50 border-2 border-slate-200 rounded-2xl pl-10 pr-4 text-sm text-slate-700 focus:outline-none focus:border-[#1E2753] focus:bg-white transition-all"
                  />
                </div>
              </div>
            ))}

            {/* Password */}
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1.5 block">Password</label>
              <div className="relative">
                <FontAwesomeIcon icon={faLock} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Minimal 6 karakter"
                  required
                  className="w-full h-11 bg-slate-50 border-2 border-slate-200 rounded-2xl pl-10 pr-12 text-sm text-slate-700 focus:outline-none focus:border-[#1E2753] focus:bg-white transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  <FontAwesomeIcon className="w-4 h-4" icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
              {/* Password strength bar */}
              {password.length > 0 && (
                <div className="flex gap-1 mt-1.5 items-center">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-1 rounded-full transition-colors ${
                        password.length < 4 ? (i === 0 ? "bg-red-400" : "bg-slate-200") : password.length < 6 ? (i < 2 ? "bg-amber-400" : "bg-slate-200") : password.length < 10 ? (i < 3 ? "bg-blue-400" : "bg-slate-200") : "bg-green-400"
                      }`}
                    />
                  ))}
                  <span className="text-[10px] text-slate-400 ml-1 whitespace-nowrap">{password.length < 4 ? "Lemah" : password.length < 6 ? "Cukup" : password.length < 10 ? "Kuat" : "Sangat kuat"}</span>
                </div>
              )}
            </div>

            {/* Konfirmasi Password */}
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1.5 block">Konfirmasi Password</label>
              <div className="relative">
                <FontAwesomeIcon icon={faLock} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Ulangi password"
                  required
                  className={`w-full h-11 bg-slate-50 border-2 rounded-2xl pl-10 pr-12 text-sm text-slate-700 focus:outline-none transition-all focus:bg-white ${
                    confirmPassword && password !== confirmPassword
                      ? "border-red-300 focus:border-red-400"
                      : confirmPassword && password === confirmPassword
                        ? "border-green-300 focus:border-green-400"
                        : "border-slate-200 focus:border-[#1E2753]"
                  }`}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  <FontAwesomeIcon className="w-4 h-4" icon={showConfirm ? faEyeSlash : faEye} />
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && <p className="text-[11px] text-red-500 mt-1">Password tidak sama</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#1E2753] hover:bg-[#2a3470] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 mt-1 shadow-lg shadow-blue-900/20 active:scale-95"
            >
              {loading && <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />}
              {loading ? "Membuat akun..." : "Buat Akun Gratis"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs font-medium text-slate-400 whitespace-nowrap">atau daftar dengan</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={loadingGoogle}
            className="flex items-center justify-center w-full h-11 border-2 border-slate-200 rounded-2xl gap-3 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-60 transition-all text-sm text-slate-700 font-semibold active:scale-95"
          >
            {loadingGoogle ? <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin text-slate-500" /> : <FontAwesomeIcon icon={faGoogle} className="w-4 h-4 text-red-500" />}
            {loadingGoogle ? "Memproses..." : "Daftar dengan Google"}
          </button>

          <p className="text-[11px] text-slate-400 text-center mt-4 leading-relaxed">Dengan mendaftar, kamu menyetujui syarat & ketentuan Rizky Elektronik.</p>
        </div>
      </div>
    </div>
  );
}
