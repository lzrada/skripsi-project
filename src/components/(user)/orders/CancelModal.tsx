"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark, faRotateLeft } from "@fortawesome/free-solid-svg-icons";

interface Props {
  orderId: string;
  isPaid?: boolean;
  loading?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

export default function CancelModal({ orderId, isPaid = false, loading = false, error = null, onConfirm, onClose }: Props) {
  return (
    <>
      <div onClick={!loading ? onClose : undefined} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faCircleXmark} className="w-7 h-7 text-red-500" />
            </div>
            <p className="text-gray-800 font-bold text-lg">Batalkan Pesanan?</p>
            <p className="text-sm text-gray-500">
              Pesanan <span className="font-semibold text-gray-700">#{orderId.slice(0, 8).toUpperCase()}</span> akan dibatalkan dan stok produk dikembalikan.
            </p>

            {isPaid && (
              <div className="w-full bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-2 text-left">
                <FontAwesomeIcon icon={faRotateLeft} className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-blue-700">Refund Otomatis</p>
                  <p className="text-xs text-blue-600 mt-0.5">Karena pembayaran sudah diproses, dana akan dikembalikan ke metode pembayaran asalmu dalam 3–14 hari kerja.</p>
                </div>
              </div>
            )}

            {error && (
              <div className="w-full bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                <p className="text-xs text-red-600 font-medium">{error}</p>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-5">
            <button onClick={onClose} disabled={loading} className="flex-1 py-2.5 border-2 border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50">
              Kembali
            </button>
            <button onClick={onConfirm} disabled={loading} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  {isPaid ? "Memproses Refund..." : "Membatalkan..."}
                </>
              ) : isPaid ? (
                "Ya, Batalkan & Refund"
              ) : (
                "Ya, Batalkan"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
