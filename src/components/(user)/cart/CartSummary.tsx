"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShield, faTruck, faTag, faTicket, faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { formatPrice } from "@/lib/format";
import { useState } from "react";

interface AppliedCoupon {
  id: string;
  code: string;
  discount: number;
}

interface Props {
  selectedCount: number;
  subtotal: number;
  diskonKupon: number;
  total: number;
  hasStockViolation: boolean;
  appliedCoupon: AppliedCoupon | null;
  couponInput: string;
  couponLoading: boolean;
  onCouponInputChange: (val: string) => void;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
  checkoutHref: string;
}

export default function CartSummary({ selectedCount, subtotal, diskonKupon, total, hasStockViolation, appliedCoupon, couponInput, couponLoading, onCouponInputChange, onApplyCoupon, onRemoveCoupon, checkoutHref }: Props) {
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const CheckoutButton = () => (
    <Link
      href={checkoutHref}
      onClick={(e) => {
        if (hasStockViolation || selectedCount === 0) e.preventDefault();
      }}
      className={`block w-full py-3.5 rounded-xl text-center font-black text-sm transition-all duration-200 ${
        selectedCount > 0 && !hasStockViolation ? "bg-[#1E2753] text-white hover:bg-[#2a3470] active:scale-95 shadow-sm" : "bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none"
      }`}
    >
      {hasStockViolation ? "Stok Tidak Valid" : `Checkout (${selectedCount} produk)`}
    </Link>
  );

  return (
    <>
      {/* ── Desktop: sidebar biasa ── */}
      <div className="hidden lg:block space-y-4">
        {/* Kupon */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <FontAwesomeIcon icon={faTicket} className="w-4 h-4 text-[#E85D04]" />
            <p className="text-sm font-bold text-gray-800">Kode Kupon</p>
          </div>
          {appliedCoupon ? (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
              <div>
                <p className="text-xs font-bold text-emerald-700">✓ {appliedCoupon.code}</p>
                <p className="text-xs text-emerald-600 mt-0.5">Hemat {formatPrice(appliedCoupon.discount)}</p>
              </div>
              <button onClick={onRemoveCoupon} className="text-xs text-red-500 hover:underline ml-2 flex-shrink-0 font-semibold">
                Hapus
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => onCouponInputChange(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && onApplyCoupon()}
                placeholder="Masukkan kode kupon"
                className="flex-1 border-2 border-gray-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1E2753] uppercase tracking-wider font-mono"
              />
              <button onClick={onApplyCoupon} disabled={couponLoading || !couponInput.trim()} className="px-3 py-2 bg-[#1E2753] text-white rounded-xl text-xs font-bold hover:bg-[#2a3470] disabled:opacity-50 transition">
                {couponLoading ? "..." : "Pakai"}
              </button>
            </div>
          )}
        </div>

        {/* Ringkasan harga */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
          <p className="text-sm font-bold text-gray-800">Ringkasan Belanja</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Total Harga ({selectedCount} produk)</span>
              <span className="font-semibold text-gray-700">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Ongkos Kirim</span>
              <span className="font-semibold text-emerald-600">Gratis</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-gray-500">
                <span>
                  Diskon <span className="text-emerald-600 font-bold">({appliedCoupon.code})</span>
                </span>
                <span className="font-semibold text-red-500">-{formatPrice(diskonKupon)}</span>
              </div>
            )}
          </div>
          <div className="border-t border-gray-100 pt-3">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-bold text-gray-800">Total Pembayaran</span>
              <span className="text-lg font-black text-[#1E2753]">{formatPrice(total)}</span>
            </div>
            {hasStockViolation && selectedCount > 0 && <p className="text-xs text-red-500 font-semibold text-center mb-2">⚠ Perbaiki stok item di atas sebelum checkout</p>}
            <CheckoutButton />
          </div>
        </div>

        {/* Trust badges */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2.5">
          {[
            { icon: faShield, text: "Transaksi aman & terpercaya", color: "text-blue-500" },
            { icon: faTruck, text: "Gratis ongkir wilayah Blitar", color: "text-emerald-500" },
            { icon: faTag, text: "Harga terbaik dijamin", color: "text-orange-500" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3">
              <FontAwesomeIcon icon={item.icon} className={`w-4 h-4 ${item.color} flex-shrink-0`} />
              <span className="text-xs text-gray-500">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Mobile: sticky bottom bar ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.10)]">
        {/* Panel expandable — kupon + rincian harga */}
        {mobileExpanded && (
          <div className="px-4 pt-4 pb-2 space-y-3 border-b border-gray-100 max-h-[60vh] overflow-y-auto">
            {/* Kupon */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FontAwesomeIcon icon={faTicket} className="w-3.5 h-3.5 text-[#E85D04]" />
                <p className="text-xs font-bold text-gray-800">Kode Kupon</p>
              </div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                  <div>
                    <p className="text-xs font-bold text-emerald-700">✓ {appliedCoupon.code}</p>
                    <p className="text-[11px] text-emerald-600 mt-0.5">Hemat {formatPrice(appliedCoupon.discount)}</p>
                  </div>
                  <button onClick={onRemoveCoupon} className="text-xs text-red-500 hover:underline ml-2 flex-shrink-0 font-semibold">
                    Hapus
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => onCouponInputChange(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && onApplyCoupon()}
                    placeholder="Masukkan kode kupon"
                    className="flex-1 border-2 border-gray-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1E2753] uppercase tracking-wider font-mono"
                  />
                  <button onClick={onApplyCoupon} disabled={couponLoading || !couponInput.trim()} className="px-3 py-2 bg-[#1E2753] text-white rounded-xl text-xs font-bold hover:bg-[#2a3470] disabled:opacity-50 transition">
                    {couponLoading ? "..." : "Pakai"}
                  </button>
                </div>
              )}
            </div>

            {/* Rincian harga */}
            <div className="space-y-1.5 text-sm pb-1">
              <div className="flex justify-between text-gray-500">
                <span className="text-xs">Total Harga ({selectedCount} produk)</span>
                <span className="text-xs font-semibold text-gray-700">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span className="text-xs">Ongkos Kirim</span>
                <span className="text-xs font-semibold text-emerald-600">Gratis</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-gray-500">
                  <span className="text-xs">Diskon ({appliedCoupon.code})</span>
                  <span className="text-xs font-semibold text-red-500">-{formatPrice(diskonKupon)}</span>
                </div>
              )}
            </div>

            {hasStockViolation && selectedCount > 0 && <p className="text-xs text-red-500 font-semibold text-center">⚠ Perbaiki stok item di atas sebelum checkout</p>}
          </div>
        )}

        {/* Bottom bar utama */}
        <div className="px-4 py-3 flex items-center gap-3">
          {/* Toggle expand */}
          <button onClick={() => setMobileExpanded((v) => !v)} className="flex flex-col items-start min-w-0 flex-1">
            <div className="flex items-center gap-1 text-gray-400 mb-0.5">
              <span className="text-[10px] font-medium">{selectedCount > 0 ? `${selectedCount} produk dipilih` : "Belum ada produk dipilih"}</span>
              <FontAwesomeIcon icon={mobileExpanded ? faChevronDown : faChevronUp} className="w-2.5 h-2.5" />
            </div>
            <span className="text-base font-black text-[#1E2753] leading-none">{formatPrice(total)}</span>
            {appliedCoupon && <span className="text-[10px] text-emerald-600 font-semibold mt-0.5">Hemat {formatPrice(diskonKupon)} 🎉</span>}
          </button>

          {/* Tombol checkout */}
          <Link
            href={checkoutHref}
            onClick={(e) => {
              if (hasStockViolation || selectedCount === 0) e.preventDefault();
            }}
            className={`shrink-0 px-6 py-3 rounded-xl text-center font-black text-sm transition-all duration-200 ${
              selectedCount > 0 && !hasStockViolation ? "bg-[#1E2753] text-white hover:bg-[#2a3470] active:scale-95 shadow-sm" : "bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none"
            }`}
          >
            {hasStockViolation ? "Stok ❌" : "Checkout →"}
          </Link>
        </div>
      </div>
    </>
  );
}
