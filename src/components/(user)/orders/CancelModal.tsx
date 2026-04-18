"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";

interface CancelModalProps {
  orderId: string;
  onConfirm: () => void;
  onClose: () => void;
}

export default function CancelModal({ orderId, onConfirm, onClose }: CancelModalProps) {
  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faCircleXmark} className="w-7 h-7 text-red-500" />
            </div>
            <p className="text-gray-800 font-bold text-lg">Batalkan Pesanan?</p>
            <p className="text-sm text-gray-500">
              Pesanan <span className="font-semibold text-gray-700">#{orderId}</span> akan dibatalkan. Tindakan ini tidak bisa diurungkan.
            </p>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={onClose} className="flex-1 py-2.5 border-2 border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
              Kembali
            </button>
            <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors">
              Ya, Batalkan
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
