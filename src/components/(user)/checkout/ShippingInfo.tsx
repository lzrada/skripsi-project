// src/components/(user)/checkout/ShippingInfo.tsx
"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTruck } from "@fortawesome/free-solid-svg-icons";

export default function ShippingInfo() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
          <FontAwesomeIcon icon={faTruck} className="w-3.5 h-3.5 text-[#1E2753]" />
        </div>
        <p className="text-sm font-bold text-gray-800">Metode Pengiriman</p>
      </div>
      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3.5">
        <div>
          <p className="text-sm font-semibold text-green-700">Pengiriman Toko</p>
          <p className="text-xs text-green-600 mt-0.5">Estimasi 1–2 hari · Wilayah Blitar & sekitarnya</p>
        </div>
        <span className="text-sm font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">GRATIS</span>
      </div>
    </div>
  );
}
