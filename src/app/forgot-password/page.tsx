"use client";

import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { resetPassword } from "@/service/auth.service";

export default function ForgotPassword() {
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
        setError("Email tidak terdaftar.");
      } else {
        setError("Gagal mengirim email. Coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-screen bg-[#F5F6FA]">
      <div className="flex flex-col gap-2 items-center p-7 w-96 border border-gray-200 bg-white rounded-md shadow-sm">
        {success ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <FontAwesomeIcon icon={faCircleCheck} className="w-12 h-12 text-green-500" />
            <p className="text-gray-800 text-lg font-bold text-center">Email Terkirim!</p>
            <p className="text-sm text-gray-500 text-center">
              Cek inbox email <span className="font-semibold text-gray-700">{email}</span> untuk mereset password kamu.
            </p>
            <Link href="/login" className="mt-2 w-full h-10 bg-[#1E2753] hover:bg-[#222b58] text-white rounded-md font-medium flex items-center justify-center text-sm">
              Kembali ke Login
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-800 text-2xl font-bold">Password Reset</p>
            <p className="font-thin text-sm text-gray-700">Check your email to reset your password</p>

            {error && <div className="w-full bg-red-50 border border-red-200 text-red-600 text-xs rounded px-3 py-2">{error}</div>}

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-2 mt-2">
              <p className="font-medium text-sm text-gray-600">Email</p>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-9 border border-gray-300 rounded focus:outline-1 p-3 text-sm" placeholder="Enter Email Address" required />
              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-[#1E2753] hover:bg-[#222b58] disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md mt-4 font-medium flex items-center justify-center gap-2 text-sm"
              >
                {loading && <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />}
                {loading ? "Sending..." : "Reset Password"}
              </button>
            </form>

            <div className="h-0.5 w-full bg-gray-200 my-2" />
            <p className="font-normal text-sm text-gray-500">Remembered your password?</p>
            <Link href="/login" className="flex items-center justify-center text-blue-500 hover:underline cursor-pointer p-3 w-full h-9 border-gray-300 border rounded-md text-sm">
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
