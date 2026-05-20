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

const CheckoutButton = ({ fullWidth, selectedCount, hasStockViolation, checkoutHref }: { fullWidth?: boolean; selectedCount: number; hasStockViolation: boolean; checkoutHref: string }) => (
  <Link
    href={checkoutHref}
    onClick={(e) => {
      if (hasStockViolation || selectedCount === 0) e.preventDefault();
    }}
    className={`${fullWidth ? "block w-full" : "shrink-0 px-6"} py-3.5 rounded-xl text-center font-black text-sm transition-all duration-200 ${
      selectedCount > 0 && !hasStockViolation ? "bg-[#1E2753] text-white hover:bg-[#2a3470] active:scale-95 shadow-sm" : "bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none"
    }`}
  >
    {hasStockViolation ? "Stok Tidak Valid" : `Checkout (${selectedCount} produk)`}
  </Link>
);

export function CartSummaryDesktop(props: Props) {
  const { selectedCount, subtotal, diskonKupon, total, hasStockViolation, appliedCoupon, couponInput, couponLoading, onCouponInputChange, onApplyCoupon, onRemoveCoupon, checkoutHref } = props;

  return (
    <div className="sticky top-24 space-y-4">
        {/* Kode Kupon */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <FontAwesomeIcon icon={faTicket} className="w-4 h-4 text-[#E85D04]" />
            <p className="text-sm font-bold text-gray-800">Kode Kupon</p>
          </div>
          <div className="px-5 py-4">
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
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
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E2753] focus:ring-2 focus:ring-[#1E2753]/10 uppercase tracking-wider font-mono transition"
                />
                <button
                  onClick={onApplyCoupon}
                  disabled={couponLoading || !couponInput.trim()}
                  className="px-4 py-2.5 bg-[#1E2753] text-white rounded-xl text-sm font-bold hover:bg-[#2a3470] disabled:opacity-50 transition whitespace-nowrap"
                >
                  {couponLoading ? "..." : "Pakai"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Ringkasan Belanja */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-sm font-bold text-gray-800">Ringkasan Belanja</p>
          </div>
          <div className="px-5 py-4 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Total Harga ({selectedCount} produk)</span>
              <span className="font-semibold text-gray-700">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Ongkos Kirim</span>
              <span className="font-semibold text-emerald-600">Gratis</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">
                  Diskon <span className="text-emerald-600 font-bold">({appliedCoupon.code})</span>
                </span>
                <span className="font-semibold text-red-500">-{formatPrice(diskonKupon)}</span>
              </div>
            )}
            <div className="border-t border-gray-100 pt-3">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-gray-800">Total Pembayaran</span>
                <span className="text-xl font-black text-[#1E2753]">{formatPrice(total)}</span>
              </div>
              {hasStockViolation && selectedCount > 0 && <p className="text-xs text-red-500 font-semibold text-center mb-3">⚠ Perbaiki stok item di atas sebelum checkout</p>}
              <CheckoutButton fullWidth={true} selectedCount={selectedCount} hasStockViolation={hasStockViolation} checkoutHref={checkoutHref} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4 space-y-3">
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
  );
}

export function CartSummaryMobile(props: Props) {
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const { selectedCount, subtotal, diskonKupon, total, hasStockViolation, appliedCoupon, couponInput, couponLoading, onCouponInputChange, onApplyCoupon, onRemoveCoupon, checkoutHref } = props;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.10)]">
      {mobileExpanded && (
        <div className="px-4 pt-4 pb-2 space-y-3 border-b border-gray-100 max-h-[60vh] overflow-y-auto">
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
          <div className="space-y-1.5 pb-1">
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Total Harga ({selectedCount} produk)</span>
              <span className="text-xs font-semibold text-gray-700">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Ongkos Kirim</span>
              <span className="text-xs font-semibold text-emerald-600">Gratis</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Diskon ({appliedCoupon.code})</span>
                <span className="text-xs font-semibold text-red-500">-{formatPrice(diskonKupon)}</span>
              </div>
            )}
          </div>
          {hasStockViolation && selectedCount > 0 && <p className="text-xs text-red-500 font-semibold text-center">⚠ Perbaiki stok item di atas sebelum checkout</p>}
        </div>
      )}
      <div className="px-4 py-3 flex items-center gap-3">
        <button onClick={() => setMobileExpanded((v) => !v)} className="flex flex-col items-start min-w-0 flex-1">
          <div className="flex items-center gap-1 text-gray-400 mb-0.5">
            <span className="text-[10px] font-medium">{selectedCount > 0 ? `${selectedCount} produk dipilih` : "Belum ada produk dipilih"}</span>
            <FontAwesomeIcon icon={mobileExpanded ? faChevronDown : faChevronUp} className="w-2.5 h-2.5" />
          </div>
          <span className="text-base font-black text-[#1E2753] leading-none">{formatPrice(total)}</span>
          {appliedCoupon && <span className="text-[10px] text-emerald-600 font-semibold mt-0.5">Hemat {formatPrice(diskonKupon)} 🎉</span>}
        </button>
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
  );
}

export default function CartSummary(props: Props) {
  return (
    <>
      <div className="hidden lg:block">
        <CartSummaryDesktop {...props} />
      </div>
      <div className="lg:hidden">
        <CartSummaryMobile {...props} />
      </div>
    </>
  );
}
