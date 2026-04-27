// src/components/checkout/PaymentMethodSelector.tsx
"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { paymentMethods } from "./PaymentMethods"; // kita buat file terpisah
import { faShield } from "@fortawesome/free-solid-svg-icons";

interface Props {
  selectedPayment: string;
  onSelect: (id: string) => void;
}

export default function PaymentMethodSelector({ selectedPayment, onSelect }: Props) {
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
          <label key={method.id} className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${selectedPayment === method.id ? "border-[#1E2753] bg-[#1E2753]/5" : "border-gray-100 hover:border-gray-200"}`}>
            <input type="radio" name="payment" value={method.id} checked={selectedPayment === method.id} onChange={() => onSelect(method.id)} className="accent-[#1E2753]" />
            <div className={`w-9 h-9 rounded-xl ${method.bg} flex items-center justify-center`}>
              <FontAwesomeIcon icon={method.icon} className={`w-4 h-4 ${method.color}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">{method.label}</p>
              <p className="text-xs text-gray-400">{method.desc}</p>
            </div>
            {!method.useMidtrans && <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">COD</span>}
            {method.useMidtrans && <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Online</span>}
          </label>
        ))}
      </div>
    </div>
  );
}
