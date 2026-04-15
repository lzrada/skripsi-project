"use client";

import { useState, useEffect } from "react"; // ✅ tambah useEffect
import { useRouter } from "next/navigation";

import Link from "next/link";
import { faEye, faEyeSlash, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  loginWithEmail,
  loginWithGoogle,
  handleGoogleRedirect, // ✅ tambah ini
} from "@/service/auth.service";

export default function Login() {
  // const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState("");

  const redirectByRole = (role: "user" | "admin") => {
    if (role === "admin") {
      window.location.replace("/admin/dashboard-admin");
    } else {
      window.location.replace("/user/dashboard-user");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginWithEmail(email, password);
      console.log("LOGIN RESULT FINAL:", res);

      if (!res || !res.role) {
        throw new Error("Role tidak ditemukan");
      }

      console.log("REDIRECT KE ROLE:", res.role);
      setLoading(false);
      setTimeout(() => {
        redirectByRole(res.role);
      }, 100);
    } catch (err: any) {
      console.log("LOGIN ERROR FULL:", err);

      const code = err?.code;

      if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setError("Email atau password salah.");
      } else if (code === "auth/too-many-requests") {
        setError("Terlalu banyak percobaan. Coba lagi nanti.");
      } else if (code === "auth/user-not-found-db") {
        setError("User belum ada di database.");
      } else if (code === "auth/no-role") {
        setError("Role user belum diset.");
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
    } catch (err) {
      console.log("GOOGLE ERROR:", err);
      setError("Login Google gagal. Silakan coba lagi.");
      setLoadingGoogle(false);
    }
  };

  useEffect(() => {
    const checkGoogleLogin = async () => {
      const res = await handleGoogleRedirect();
      if (res && res.success) {
        redirectByRole(res.role);
      }
    };
    checkGoogleLogin();
  }, []);

  return (
    <div className="flex items-center justify-center w-full h-screen bg-[#F5F6FA]">
      <div className="flex justify-center p-5 w-96 border border-gray-200 bg-white rounded-md shadow-md">
        <div className="flex flex-col w-full">
          <p className="flex justify-center font-bold text-2xl">Sign In</p>
          <div className="flex items-center text-sm my-3 gap-2 justify-center">
            <p className="font-medium text-gray-600">New to Our Product?</p>
            <Link href="/register" className="text-blue-500 cursor-pointer hover:underline">
              Create an Account
            </Link>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded px-3 py-2 mb-3">{error}</div>}

          <form onSubmit={handleLogin} className="flex flex-col gap-1">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full h-9 bg-[#1E2753] hover:bg-[#222b58] disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md mt-4 font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading && <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />}
              {loading ? "Loading..." : "Sign In"}
            </button>
          </form>

          <Link href="/forgot-password" className="flex items-center justify-center my-4 text-xs text-blue-500 hover:underline">
            Forgot your password?
          </Link>

          <div className="w-full h-px bg-[#D7DBEC]" />
          <p className="flex items-center justify-center font-medium my-4 text-gray-600 text-xs">Or sign in using:</p>

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
