"use client";

import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp, faHandHoldingDollar, faLock, faSpinner, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { CartItem } from "@/types/cart";
import { ShippingResult } from "@/lib/shipping";
import { ShippingStatus } from "@/hooks/UseCheckout";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

interface Props {
  orderItems: CartItem[];
  subtotal: number;
  shippingFee: number;
  shipping: ShippingResult | null;
  shippingStatus: ShippingStatus;
  isCalculatingShipping: boolean;
  diskonKupon: number;
  couponCode: string;
  total: number;
  isCod: boolean;
  onCheckout: () => void;
  showOrderDetail: boolean;
  setShowOrderDetail: (show: boolean) => void;
}

export default function OrderSummary({ orderItems, subtotal, shippingFee, shipping, shippingStatus, isCalculatingShipping, diskonKupon, couponCode, total, isCod, onCheckout, showOrderDetail, setShowOrderDetail }: Props) {
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

          <div className="flex justify-between items-start">
            <span className="text-gray-500">Ongkos Kirim</span>
            {isCalculatingShipping ? (
              <span className="flex items-center gap-1.5 text-gray-400 text-xs">
                <FontAwesomeIcon icon={faSpinner} className="w-3 h-3 animate-spin" />
                Menghitung...
              </span>
            ) : shippingStatus === "found" && shipping ? (
              shipping.isFree ? (
                <span className="text-green-600 font-semibold">Gratis 🎉</span>
              ) : (
                <span className="font-semibold">{formatPrice(shippingFee)}</span>
              )
            ) : shippingStatus === "not_found" ? (
              <span className="flex items-center gap-1 text-red-500 text-xs font-semibold">
                <FontAwesomeIcon icon={faTriangleExclamation} className="w-3 h-3" />
                Kota tidak dikenali
              </span>
            ) : (
              <span className="text-gray-400 text-xs italic">— isi kota dulu</span>
            )}
          </div>

          {shippingStatus === "found" && shipping && !isCalculatingShipping && (
            <p className="text-xs text-gray-400 text-right">
              {shipping.label} · est. {shipping.estimasi}
            </p>
          )}

          {shippingStatus === "not_found" && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-600 flex items-start gap-2">
              <FontAwesomeIcon icon={faTriangleExclamation} className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>Kota tidak dikenali. Hubungi toko via WhatsApp untuk konfirmasi ongkos kirim sebelum melanjutkan pesanan.</span>
            </div>
          )}

          {diskonKupon > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500">Diskon {couponCode && `(${couponCode})`}</span>
              <span className="text-red-500">-{formatPrice(diskonKupon)}</span>
            </div>
          )}
        </div>

        <div className="border-t pt-3 flex justify-between items-center">
          <span className="font-bold">Total</span>
          <span className="text-xl font-bold text-[#1E2753]">{shippingStatus === "not_found" ? <span className="text-sm text-red-400 italic">Konfirmasi dulu</span> : formatPrice(total)}</span>
        </div>

        <button
          onClick={onCheckout}
          disabled={orderItems.length === 0 || shippingStatus === "calculating" || shippingStatus === "not_found"}
          className="w-full py-3.5 bg-[#1E2753] text-white rounded-xl font-bold hover:bg-[#2a3470] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
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
