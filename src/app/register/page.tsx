"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { faEye, faEyeSlash, faSpinner, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { registerWithEmail, loginWithGoogle, handleGoogleRedirect } from "@/service/auth.service";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Handle hasil redirect Google — kalau register via Google langsung masuk dashboard
  useEffect(() => {
    const checkGoogle = async () => {
      const res = await handleGoogleRedirect();
      if (res && res.success) {
        window.location.replace("/user/dashboard-user");
      }
    };
    checkGoogle();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak sama.");
      return;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Format email tidak valid.");
      return;
    }
    setLoading(true);
    try {
      await registerWithEmail(email, password);
      setSuccess(true);
    } catch (err: any) {
      const code = err?.code;
      if (code === "auth/email-already-in-use") {
        setError("Email sudah terdaftar. Silakan login.");
      } else if (code === "auth/invalid-email") {
        setError("Format email tidak valid.");
      } else if (code === "auth/weak-password") {
        setError("Password terlalu lemah. Minimal 6 karakter.");
      } else {
        setError(err.message || "Terjadi kesalahan. Coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoadingGoogle(true);
    try {
      await loginWithGoogle();
      // redirect otomatis, loading tetap true
    } catch {
      setError("Register dengan Google gagal. Silakan coba lagi.");
      setLoadingGoogle(false);
    }
  };

  // Halaman sukses — arahkan ke login
  if (success) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-[#F5F6FA]">
        <div className="flex flex-col items-center gap-3 p-7 w-96 border border-gray-200 bg-white rounded-md shadow-md">
          <FontAwesomeIcon icon={faCircleCheck} className="w-12 h-12 text-green-500" />
          <p className="text-gray-800 text-lg font-bold text-center">Akun Berhasil Dibuat!</p>
          <p className="text-sm text-gray-500 text-center">
            Akun untuk <span className="font-semibold text-gray-700">{email}</span> sudah siap. Silakan login untuk mulai belanja.
          </p>
          <Link href="/login" className="mt-2 w-full h-10 bg-[#1E2753] hover:bg-[#222b58] text-white rounded-md font-medium flex items-center justify-center text-sm">
            Ke Halaman Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full h-screen bg-[#F5F6FA]">
      <div className="flex justify-center p-5 w-96 border border-gray-200 bg-white rounded-md shadow-md">
        <div className="flex flex-col w-full">
          <p className="flex justify-center font-bold text-2xl">Create an Account</p>
          <div className="flex items-center text-sm my-3 gap-2 justify-center">
            <p className="font-medium text-gray-600">Already have an account?</p>
            <Link href="/login" className="text-blue-500 cursor-pointer hover:underline">
              Sign In
            </Link>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded px-3 py-2 mb-3">{error}</div>}

          <form onSubmit={handleRegister} className="flex flex-col gap-1">
            <div>
              <p className="font-medium text-gray-600 text-sm my-2">Email</p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email Address"
                required
                className="w-full h-9 bg-white border p-3 focus:outline-1 outline-blue-400 text-sm text-gray-500 border-gray-300 rounded-md"
              />
            </div>

            <div>
              <p className="font-medium text-gray-600 text-sm my-2">Password</p>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  required
                  className="w-full h-9 bg-white border p-3 pr-10 focus:outline-1 outline-blue-400 text-sm text-gray-500 border-gray-300 rounded-md"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  <FontAwesomeIcon className="w-4 h-4" icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            <div>
              <p className="font-medium text-gray-600 text-sm my-2">Konfirmasi Password</p>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi Password"
                  required
                  className="w-full h-9 bg-white border p-3 pr-10 focus:outline-1 outline-blue-400 text-sm text-gray-500 border-gray-300 rounded-md"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  <FontAwesomeIcon className="w-4 h-4" icon={showConfirm ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-9 bg-[#1E2753] hover:bg-[#222b58] disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md mt-4 font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading && <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />}
              {loading ? "Loading..." : "Create Account"}
            </button>
          </form>

          <div className="w-full h-px bg-[#D7DBEC] my-4" />
          <p className="flex items-center justify-center font-medium mb-4 text-gray-600 text-xs">Or register using:</p>

          <button
            onClick={handleGoogle}
            disabled={loadingGoogle}
            className="flex justify-center text-sm text-blue-500 items-center w-full h-8 my-2 border border-gray-300 rounded-md p-3 gap-4 cursor-pointer hover:underline disabled:opacity-60"
          >
            {loadingGoogle ? <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" /> : <FontAwesomeIcon icon={faGoogle} className="w-4 h-4 text-red-500" />}
            <p>{loadingGoogle ? "Loading..." : "continue with google"}</p>
          </button>
        </div>
      </div>
    </div>
  );
}
