// src/components/checkout/OrderSummary.tsx
"use client";

import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp, faHandHoldingDollar, faLock } from "@fortawesome/free-solid-svg-icons";
import { CartItem } from "@/service/cart.service";

const formatPrice = (price: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);

interface Props {
  orderItems: CartItem[];
  subtotal: number;
  diskonKupon: number;
  couponCode: string;
  total: number;
  isCod: boolean;
  onCheckout: () => void;
  showOrderDetail: boolean;
  setShowOrderDetail: (show: boolean) => void;
}

export default function OrderSummary({ orderItems, subtotal, diskonKupon, couponCode, total, isCod, onCheckout, showOrderDetail, setShowOrderDetail }: Props) {
  return (
    <div className="space-y-4">
      {/* Detail Produk */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <button onClick={() => setShowOrderDetail(!showOrderDetail)} className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50">
          <p className="text-sm font-bold text-gray-800">
            Detail Produk <span className="text-gray-400">({orderItems.length})</span>
          </p>
          <FontAwesomeIcon icon={showOrderDetail ? faChevronUp : faChevronDown} className="w-3 h-3" />
        </button>

        {showOrderDetail && (
          <div className="px-4 pb-4 space-y-3 border-t">
            {orderItems.map((item) => (
              <div key={item.id} className="flex gap-3 pt-3">
                <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                  {item.image ? <Image src={item.image} alt={item.name} width={48} height={48} className="object-contain p-1" /> : <span>📦</span>}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold line-clamp-2">{item.name}</p>
                  <p className="text-xs text-gray-400">
                    x{item.qty} · {formatPrice(item.price)}
                  </p>
                </div>
                <p className="text-xs font-bold text-[#1E2753]">{formatPrice(item.price * item.qty)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ringkasan Pembayaran */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        <p className="text-sm font-bold text-gray-800">Ringkasan Pembayaran</p>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal Produk</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Ongkos Kirim</span>
            <span className="text-green-600">Gratis</span>
          </div>
          {diskonKupon > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500">Diskon {couponCode && `(${couponCode})`}</span>
              <span className="text-red-500">-{formatPrice(diskonKupon)}</span>
            </div>
          )}
        </div>

        <div className="border-t pt-3 flex justify-between items-center">
          <span className="font-bold">Total</span>
          <span className="text-xl font-bold text-[#1E2753]">{formatPrice(total)}</span>
        </div>

        <button onClick={onCheckout} disabled={orderItems.length === 0} className="w-full py-3.5 bg-[#1E2753] text-white rounded-xl font-bold hover:bg-[#2a3470] disabled:opacity-60 flex items-center justify-center gap-2">
          {isCod ? (
            <>
              <FontAwesomeIcon icon={faHandHoldingDollar} /> Buat Pesanan COD
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faLock} /> Bayar Sekarang
            </>
          )}
        </button>
      </div>
    </div>
  );
}
