"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faBoxOpen, faHandHoldingDollar, faReceipt, faArrowRight, faShoppingBag } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { OWNER_WHATSAPP } from "@/constants/Owner_number";

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  image: string;
}

function buildWhatsAppUrl(orderId: string, orderCode: string, items: OrderItem[], total: number, method: string, isCod: boolean): string {
  const itemLines = items.map((item) => `- ${item.name} x${item.qty} = ${formatPrice(item.price * item.qty)}`).join("\n");

  const message =
    `Halo, saya ingin konfirmasi pesanan baru:\n\n` +
    `No. Pesanan: #${orderCode}\n` +
    `Produk:\n${itemLines}\n\n` +
    `Total Bayar: ${formatPrice(total)}\n` +
    `Metode: ${isCod ? "COD (Bayar di Tempat)" : method}\n` +
    `ID Pesanan: ${orderId}\n\n` +
    `Mohon segera diproses, terima kasih!`;

  return `https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

function SuccessContent() {
  const searchParams = useSearchParams();

  // Baca dari sessionStorage (data disimpan saat redirect dari checkout)
  const [data, setData] = useState<{
    orderId: string;
    total: number;
    subtotal: number;
    diskonKupon: number;
    couponCode: string;
    paymentMethod: string;
    isCod: boolean;
    items: OrderItem[];
  } | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("checkout_success");
    if (raw) {
      try {
        setData(JSON.parse(raw));
        sessionStorage.removeItem("checkout_success");
      } catch {}
    }
  }, []);

  const orderId = data?.orderId ?? searchParams.get("orderId") ?? "-";
  const total = data?.total ?? Number(searchParams.get("total") ?? 0);
  const subtotal = data?.subtotal ?? Number(searchParams.get("subtotal") ?? 0);
  const diskon = data?.diskonKupon ?? Number(searchParams.get("diskon") ?? 0);
  const coupon = data?.couponCode ?? searchParams.get("coupon") ?? "";
  const method = data?.paymentMethod ?? searchParams.get("method") ?? "Online";
  const isCod = data?.isCod ?? searchParams.get("isCod") === "true";
  const orderItems: OrderItem[] = data?.items ?? [];

  const orderCode = orderId.slice(0, 8).toUpperCase();
  const waUrl = buildWhatsAppUrl(orderId, orderCode, orderItems, total, method, isCod);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto space-y-4">
        {/* Header Sukses */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <FontAwesomeIcon icon={faCheckCircle} className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Pesanan Berhasil! 🎉</h1>
          <p className="text-sm text-gray-500">{isCod ? "Pesanan kamu sudah dibuat. Siapkan pembayaran saat barang tiba." : "Pembayaran diterima. Pesananmu sedang diproses!"}</p>
        </div>

        {/* Info Pesanan */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ringkasan Pesanan</p>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">No. Pesanan</span>
              <span className="font-bold text-[#1E2753] font-mono">#{orderCode}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium text-gray-700">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Ongkos Kirim</span>
              <span className="font-medium text-green-600">Gratis</span>
            </div>
            {diskon > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Diskon{coupon && <span className="font-semibold text-green-600 ml-1">({coupon})</span>}</span>
                <span className="font-medium text-red-500">-{formatPrice(diskon)}</span>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
            <span className="text-sm font-bold text-gray-800">Total Bayar</span>
            <span className="text-xl font-bold text-[#1E2753]">{formatPrice(total)}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Metode Bayar</span>
            <span className="font-semibold text-gray-700">{method}</span>
          </div>

          {isCod && (
            <div className="flex items-start gap-2 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2.5 mt-1">
              <FontAwesomeIcon icon={faHandHoldingDollar} className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
              <p className="text-xs text-orange-700">
                Siapkan uang pas <strong>{formatPrice(total)}</strong> saat kurir tiba.
              </p>
            </div>
          )}
        </div>

        {/* Daftar Produk */}
        {orderItems.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <FontAwesomeIcon icon={faBoxOpen} className="w-4 h-4 text-[#1E2753]" />
              <p className="text-sm font-bold text-gray-800">
                Produk Dipesan <span className="text-gray-400 font-normal">({orderItems.length})</span>
              </p>
            </div>
            <div className="space-y-3">
              {orderItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 shrink-0 overflow-hidden flex items-center justify-center">
                    {item.image ? <Image src={item.image} alt={item.name} width={48} height={48} className="object-contain w-full h-full p-1" /> : <span className="text-xl">📦</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-700 line-clamp-2">{item.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      x{item.qty} · {formatPrice(item.price)}
                    </p>
                  </div>
                  <p className="text-xs font-bold text-[#1E2753] shrink-0">{formatPrice(item.price * item.qty)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tombol Aksi */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Link href="/user/products" className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition">
              <FontAwesomeIcon icon={faShoppingBag} className="w-4 h-4" />
              Lanjut Belanja
            </Link>
            <Link href={`/user/orders/${orderId}`} className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#1E2753] text-white font-bold text-sm hover:bg-[#2a3470] transition">
              <FontAwesomeIcon icon={faReceipt} className="w-4 h-4" />
              Lihat Pesanan
              <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
            </Link>
          </div>

          {/* Tombol WhatsApp */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#1ebe5d] active:scale-[0.98] transition text-white font-bold text-sm shadow-md shadow-green-200"
          >
            <FontAwesomeIcon icon={faWhatsapp} className="w-5 h-5" />
            Konfirmasi Pesanan via WhatsApp
          </a>
          <p className="text-center text-[11px] text-gray-400 px-2">Ketuk tombol di atas untuk mengirim detail pesanan ke pemilik toko secara otomatis.</p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#1E2753] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Memuat halaman...</p>
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
