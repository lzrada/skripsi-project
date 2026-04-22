// src/app/login/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faSpinner, faEnvelope, faLock, faBolt } from "@fortawesome/free-solid-svg-icons";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { loginWithEmail, loginWithGoogle, handleGoogleRedirect } from "@/service/auth.service";

function LoginForm() {
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState("");

  const redirectByRole = (role: "user" | "admin") => {
    const redirectTo = searchParams.get("redirect");
    if (redirectTo) {
      window.location.replace(redirectTo);
      return;
    }
    window.location.replace(role === "admin" ? "/admin/dashboard-admin" : "/user/dashboard-user");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginWithEmail(email, password);
      if (!res?.role) throw new Error("Role tidak ditemukan");
      setLoading(false);
      setTimeout(() => redirectByRole(res.role), 100);
    } catch (err: any) {
      const code = err?.code;
      if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setError("Email atau password salah.");
      } else if (code === "auth/too-many-requests") {
        setError("Terlalu banyak percobaan. Coba lagi nanti.");
      } else if (code === "auth/no-role") {
        setError("Role akun belum diset. Hubungi admin.");
      } else {
        setError(err.message || "Terjadi kesalahan.");
      }
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoadingGoogle(true);
    try {
      await loginWithGoogle();
    } catch {
      setError("Login Google gagal. Silakan coba lagi.");
      setLoadingGoogle(false);
    }
  };

  useEffect(() => {
    const checkGoogleLogin = async () => {
      const res = await handleGoogleRedirect();
      if (res?.success && res.role) redirectByRole(res.role as "user" | "admin");
    };
    checkGoogleLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4 py-10">
      {/* Decorative blobs */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-[#1E2753]/8 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="fixed bottom-0 right-0 w-80 h-80 bg-orange-400/10 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3" />

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-3xl shadow-2xl shadow-blue-900/10 overflow-hidden">
        {/* ── Left panel: branding ── */}
        <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-[#1E2753] via-[#243080] to-[#1a2060] p-10 text-white relative overflow-hidden">
          {/* Pattern */}
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
              Belanja Elektronik
              <br />
              <span className="text-yellow-400">Lebih Mudah</span>
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">Temukan ribuan produk elektronik berkualitas dengan harga terbaik. TV, kulkas, AC, dan masih banyak lagi.</p>
          </div>

          <div className="relative z-10 space-y-3">
            {[
              { emoji: "🚚", text: "Gratis ongkir wilayah Blitar" },
              { emoji: "🛡️", text: "Garansi toko untuk setiap produk" },
              { emoji: "💸", text: "Harga terbaik, terjangkau" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <span className="text-lg">{item.emoji}</span>
                <p className="text-white/70 text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right panel: form ── */}
        <div className="flex flex-col justify-center px-8 py-10 sm:px-10">
          {/* Mobile brand */}
          <div className="flex items-center gap-2 mb-8 md:hidden">
            <div className="w-8 h-8 bg-[#1E2753] rounded-xl flex items-center justify-center">
              <FontAwesomeIcon icon={faBolt} className="w-4 h-4 text-yellow-400" />
            </div>
            <div>
              <span className="font-black text-[#1E2753] text-base">Rizky</span>
              <span className="text-[#E85D04] text-xs font-bold tracking-widest ml-1">ELEKTRONIK</span>
            </div>
          </div>

          <h1 className="text-2xl font-black text-slate-800 mb-1">Selamat datang!</h1>
          <p className="text-sm text-slate-500 mb-6">
            Belum punya akun?{" "}
            <Link href="/register" className="text-[#1E2753] font-bold hover:underline">
              Daftar sekarang
            </Link>
          </p>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-2xl px-4 py-3 mb-4">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1.5 block">Email</label>
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

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-600">Password</label>
                <Link href="/forgot-password" className="text-xs text-[#1E2753] hover:underline font-semibold">
                  Lupa password?
                </Link>
              </div>
              <div className="relative">
                <FontAwesomeIcon icon={faLock} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Masukkan password"
                  required
                  className="w-full h-11 bg-slate-50 border-2 border-slate-200 rounded-2xl pl-10 pr-12 text-sm text-slate-700 focus:outline-none focus:border-[#1E2753] focus:bg-white transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  <FontAwesomeIcon className="w-4 h-4" icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#1E2753] hover:bg-[#2a3470] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 mt-2 shadow-lg shadow-blue-900/20"
            >
              {loading && <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />}
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs font-medium text-slate-400">atau masuk dengan</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={loadingGoogle}
            className="flex items-center justify-center w-full h-11 border-2 border-slate-200 rounded-2xl gap-3 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-60 transition-all text-sm text-slate-700 font-semibold"
          >
            {loadingGoogle ? <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin text-slate-500" /> : <FontAwesomeIcon icon={faGoogle} className="w-4 h-4 text-red-500" />}
            {loadingGoogle ? "Memproses..." : "Lanjutkan dengan Google"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
