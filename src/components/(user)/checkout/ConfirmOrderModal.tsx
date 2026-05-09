"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxOpen, faUser, faPhone, faMapMarkerAlt, faHandHoldingDollar, faLock, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { CartItem } from "@/types/cart";

interface Props {
  form: { nama: string; telepon: string; alamat: string; kota: string; kodePos: string; catatan: string };
  paymentLabel: string;
  isCod: boolean;
  orderItems: CartItem[];
  subtotal: number;
  diskonKupon: number;
  couponCode: string;
  total: number;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmOrderModal({ form, paymentLabel, isCod, orderItems, subtotal, diskonKupon, couponCode, total, loading, onConfirm, onClose }: Props) {
  const formatPrice = (price: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4" onClick={onClose}>
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="bg-[#1E2753] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <FontAwesomeIcon icon={faBoxOpen} className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base">Konfirmasi Pesanan</h3>
              <p className="text-white/60 text-xs">Periksa kembali sebelum memesan</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-3">
          {/* Alamat */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Alamat Pengiriman</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faUser} className="w-3.5 h-3.5 text-[#1E2753]" />
                <span className="text-sm font-semibold text-gray-800">{form.nama}</span>
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faPhone} className="w-3.5 h-3.5 text-[#1E2753]" />
                <span className="text-sm text-gray-600">{form.telepon}</span>
              </div>
              <div className="flex items-start gap-2">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="w-3.5 h-3.5 text-[#E85D04] mt-0.5" />
                <span className="text-sm text-gray-600">
                  {form.alamat}
                  {form.kota && `, ${form.kota}`}
                  {form.kodePos && ` ${form.kodePos}`}
                </span>
              </div>
              {form.catatan && <p className="text-xs text-gray-400 italic mt-1 pl-5">📝 {form.catatan}</p>}
            </div>
          </div>

          {/* Produk */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Produk ({orderItems.length})</p>
            <div className="space-y-2.5">
              {orderItems.map((item) => (
                <div key={item.id} className="flex justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-400">
                      x{item.qty} · {formatPrice(item.price)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-[#1E2753]">{formatPrice(item.price * item.qty)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Rincian Harga */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Metode Bayar</span>
              <span className="font-semibold">{paymentLabel}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Ongkos Kirim</span>
              <span className="text-green-600 font-semibold">Gratis</span>
            </div>
            {diskonKupon > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Diskon {couponCode && `(${couponCode})`}</span>
                <span className="text-red-500 font-semibold">-{formatPrice(diskonKupon)}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-[#1E2753]">{formatPrice(total)}</span>
            </div>
          </div>

          {/* Info khusus metode */}
          {isCod ? (
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-xs text-orange-700 flex gap-2">
              <FontAwesomeIcon icon={faHandHoldingDollar} className="mt-0.5" />
              <p>
                Bayar saat barang tiba sebesar <strong>{formatPrice(total)}</strong>
              </p>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 flex gap-2">
              <FontAwesomeIcon icon={faLock} className="mt-0.5" />
              <p>Kamu akan diarahkan ke halaman pembayaran Midtrans</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} disabled={loading} className="flex-1 py-3 border-2 border-gray-200 rounded-2xl text-gray-600 font-semibold hover:bg-gray-50">
              Cek Lagi
            </button>
            <button onClick={onConfirm} disabled={loading} className="flex-1 py-3 bg-[#1E2753] text-white rounded-2xl font-bold hover:bg-[#2a3470]">
              {loading ? "Memproses..." : isCod ? "Ya, Buat Pesanan!" : "Lanjut Bayar →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
