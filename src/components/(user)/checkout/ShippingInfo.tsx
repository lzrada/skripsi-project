// src/components/(user)/checkout/ShippingInfo.tsx
"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTruck, faSearch, faSpinner, faCircleCheck, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { ShippingResult, geocodeAddress, calculateShipping } from "@/lib/shipping";
import { STORE_CONFIG } from "@/constants/shipping";

const formatPrice = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

interface Props {
  shipping: ShippingResult | null;
  isCalculating: boolean;
  onShippingResult: (result: ShippingResult | null, isCalculating: boolean) => void;
}

export default function ShippingInfo({ shipping, isCalculating, onShippingResult }: Props) {
  const [inputAlamat, setInputAlamat] = useState("");
  const [geocodeError, setGeocodeError] = useState("");

  const handleCekOngkir = async () => {
    if (!inputAlamat.trim()) {
      setGeocodeError("Masukkan kota atau alamat tujuan terlebih dahulu.");
      return;
    }
    setGeocodeError("");
    onShippingResult(null, true);

    const coords = await geocodeAddress(inputAlamat);

    if (!coords) {
      setGeocodeError('Alamat tidak ditemukan. Coba tulis lebih lengkap, contoh: "Kota Malang" atau "Tulungagung, Jawa Timur".');
      onShippingResult(null, false);
      return;
    }

    const result = calculateShipping(coords.lat, coords.lng);
    onShippingResult(result, false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
          <FontAwesomeIcon icon={faTruck} className="w-3.5 h-3.5 text-[#1E2753]" />
        </div>
        <p className="text-sm font-bold text-gray-800">Ongkos Kirim</p>
      </div>

      {/* Input cek ongkir */}
      <div className="mb-3">
        <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Kota / Alamat Tujuan Pengiriman</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputAlamat}
            onChange={(e) => {
              setInputAlamat(e.target.value);
              setGeocodeError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleCekOngkir()}
            placeholder='Contoh: "Kota Blitar" atau "Tulungagung"'
            className="flex-1 border-2 border-gray-100 bg-gray-50 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#1E2753] focus:bg-white transition"
          />
          <button
            type="button"
            onClick={handleCekOngkir}
            disabled={isCalculating}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1E2753] hover:bg-[#2a3470] disabled:opacity-60 text-white text-xs font-bold rounded-xl transition whitespace-nowrap"
          >
            <FontAwesomeIcon icon={isCalculating ? faSpinner : faSearch} className={`w-3 h-3 ${isCalculating ? "animate-spin" : ""}`} />
            {isCalculating ? "Menghitung..." : "Cek Ongkir"}
          </button>
        </div>

        {geocodeError && (
          <p className="text-xs text-red-500 mt-1.5 flex items-start gap-1">
            <FontAwesomeIcon icon={faInfoCircle} className="w-3 h-3 mt-0.5 flex-shrink-0" />
            {geocodeError}
          </p>
        )}
      </div>

      {/* Hasil ongkir */}
      {shipping && !isCalculating && (
        <div className={`flex items-center justify-between rounded-xl px-4 py-3.5 border ${shipping.isFree ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
          <div className="flex items-start gap-2">
            {shipping.isFree && <FontAwesomeIcon icon={faCircleCheck} className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />}
            <div>
              <p className={`text-sm font-semibold ${shipping.isFree ? "text-green-700" : "text-amber-700"}`}>{shipping.isFree ? "Gratis Ongkir! 🎉" : "Ongkir Berbayar"}</p>
              <p className={`text-xs mt-0.5 ${shipping.isFree ? "text-green-600" : "text-amber-600"}`}>
                {shipping.label} · Estimasi {shipping.estimasi}
              </p>
            </div>
          </div>

          <span className={`text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap ${shipping.isFree ? "text-green-600 bg-green-100" : "text-amber-700 bg-amber-100"}`}>{shipping.isFree ? "GRATIS" : formatPrice(shipping.fee)}</span>
        </div>
      )}

      {/* Info radius */}
      {!shipping && !isCalculating && (
        <p className="text-[11px] text-slate-400 text-center mt-1">
          Gratis ongkir untuk jarak ≤ <strong>{STORE_CONFIG.freeShippingRadiusKm} km</strong> dari toko · Rp {STORE_CONFIG.ratePerKm.toLocaleString("id-ID")}/km setelahnya
        </p>
      )}
    </div>
  );
}
