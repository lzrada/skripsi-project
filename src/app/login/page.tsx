// src/app/login/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { faEye, faEyeSlash, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
      } else if (code === "auth/user-not-found-db") {
        setError("Akun belum ada di database.");
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
      // loginWithGoogle pakai redirect, halaman akan reload otomatis
    } catch {
      setError("Login Google gagal. Silakan coba lagi.");
      setLoadingGoogle(false);
    }
  };

  // ✅ Fix: handle hasil redirect Google setelah kembali ke halaman
  useEffect(() => {
    const checkGoogleLogin = async () => {
      const res = await handleGoogleRedirect();
      if (res?.success && res.role) {
        redirectByRole(res.role as "user" | "admin");
      }
    };
    checkGoogleLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-[#F5F6FA] px-4">
      <div className="flex justify-center p-6 w-full max-w-sm border border-gray-200 bg-white rounded-2xl shadow-md">
        <div className="flex flex-col w-full gap-1">
          {/* Header */}
          <p className="flex justify-center font-bold text-2xl text-gray-800">Masuk</p>
          <div className="flex items-center text-sm my-3 gap-2 justify-center">
            <p className="font-medium text-gray-500">Belum punya akun?</p>
            <Link href="/register" className="text-blue-500 hover:underline font-semibold">
              Daftar sekarang
            </Link>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl px-3 py-2.5 mb-1">{error}</div>}

          <form onSubmit={handleLogin} className="flex flex-col gap-1">
            <div>
              <p className="font-medium text-gray-600 text-sm my-2">Email</p>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="Masukkan alamat email"
                required
                className="w-full h-10 bg-white border border-gray-300 px-3 focus:outline-none focus:border-[#1E2753] text-sm text-gray-700 rounded-xl transition"
              />
            </div>

            <div>
              <p className="font-medium text-gray-600 text-sm my-2">Password</p>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Masukkan password"
                  required
                  className="w-full h-10 bg-white border border-gray-300 px-3 pr-10 focus:outline-none focus:border-[#1E2753] text-sm text-gray-700 rounded-xl transition"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  <FontAwesomeIcon className="w-4 h-4" icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-[#1E2753] hover:bg-[#2a3470] disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl mt-4 font-semibold transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {loading && <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />}
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <Link href="/forgot-password" className="flex items-center justify-center mt-3 text-xs text-blue-500 hover:underline">
            Lupa password?
          </Link>

          <div className="w-full h-px bg-gray-200 my-3" />
          <p className="flex items-center justify-center font-medium text-gray-500 text-xs mb-2">Atau masuk dengan:</p>

          <button
            onClick={handleGoogle}
            disabled={loadingGoogle}
            className="flex justify-center items-center w-full h-10 border border-gray-300 rounded-xl gap-3 hover:bg-gray-50 disabled:opacity-60 transition-colors text-sm text-gray-700 font-medium"
          >
            {loadingGoogle ? <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin text-gray-500" /> : <FontAwesomeIcon icon={faGoogle} className="w-4 h-4 text-red-500" />}
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
