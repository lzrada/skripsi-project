// src/components/ui/WhatsAppButton.tsx
"use client";

import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import { WA_URL } from "@/constants/contact"; // ✅ dari konstanta

export default function WhatsAppButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 left-4 z-50 flex flex-col items-start gap-2">
      {open && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-64 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <FaWhatsapp className="text-white text-lg" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">Rizky Elektronik</p>
                <p className="text-[10px] text-green-500 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block animate-pulse" />
                  Online sekarang
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-300 hover:text-gray-500 transition-colors">
              <FiX className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-green-50 rounded-xl p-3 mb-3">
            <p className="text-xs text-gray-600 leading-relaxed">Halo! 👋 Ada yang bisa kami bantu? Chat kami untuk tanya produk, stok, harga, atau pengiriman.</p>
          </div>

          <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
            <FaWhatsapp className="text-lg" />
            Chat Sekarang
          </a>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 relative"
        aria-label="Chat WhatsApp"
      >
        {open ? <FiX className="w-6 h-6" /> : <FaWhatsapp className="text-2xl" />}
        {!open && (
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full">
            <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />
          </span>
        )}
      </button>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
      `}</style>
    </div>
  );
}
