// src/components/(user)/checkout/PaymentMethodSelector.tsx
"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShield, faHandHoldingDollar, faLock } from "@fortawesome/free-solid-svg-icons";
import { paymentMethods } from "./PaymentMethods";

interface Props {
  selectedPayment: string;
  onSelect: (id: string) => void;
}

export default function PaymentMethodSelector({ selectedPayment, onSelect }: Props) {
  const selectedMethod = paymentMethods.find((p) => p.id === selectedPayment)!;
  const isCod = !selectedMethod.useMidtrans;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
          <FontAwesomeIcon icon={faShield} className="w-3.5 h-3.5 text-[#1E2753]" />
        </div>
        <p className="text-sm font-bold text-gray-800">Metode Pembayaran</p>
      </div>

      <div className="space-y-2">
        {paymentMethods.map((method) => (
          <label
            key={method.id}
            className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${selectedPayment === method.id ? "border-[#1E2753] bg-[#1E2753]/5" : "border-gray-100 hover:border-gray-200 bg-white"}`}
          >
            <input type="radio" name="payment" value={method.id} checked={selectedPayment === method.id} onChange={() => onSelect(method.id)} className="accent-[#1E2753]" />
            <div className={`w-9 h-9 rounded-xl ${method.bg} flex items-center justify-center shrink-0`}>
              <FontAwesomeIcon icon={method.icon} className={`w-4 h-4 ${method.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800">{method.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{method.desc}</p>
            </div>
            {!method.useMidtrans && <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full shrink-0">COD</span>}
            {method.useMidtrans && <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full shrink-0">Online</span>}
          </label>
        ))}
      </div>

      <div className="mt-3">
        {isCod ? (
          <div className="flex items-start gap-2 bg-orange-50 border border-orange-100 rounded-xl px-3.5 py-3">
            <FontAwesomeIcon icon={faHandHoldingDollar} className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
            <p className="text-xs text-orange-700">
              Bayar langsung ke kurir saat barang tiba. Hanya tersedia di wilayah <strong>Blitar & sekitarnya</strong>.
            </p>
          </div>
        ) : (
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3.5 py-3">
            <FontAwesomeIcon icon={faLock} className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              Pembayaran diproses aman via <strong>Midtrans</strong>. Popup akan langsung menampilkan metode <strong>{selectedMethod.label}</strong> yang kamu pilih.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
