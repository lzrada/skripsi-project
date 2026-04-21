"use client";

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faLocationDot, faMoneyBill, faWallet, faTruck, faCreditCard, faBox, faHeadset, faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { categoryIcon, categoryGradient, defaultCategoryIcon, defaultGradient } from "@/constants/category";
import { type Order, statusConfig } from "@/types/order";
import OrderTracking from "@/components/(user)/orders/OrderTracking";

const paymentIcon: Record<string, IconDefinition> = {
  "Transfer Bank": faMoneyBill,
  "E-Wallet": faWallet,
  COD: faTruck,
  "Kartu Kredit / Debit": faCreditCard,
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const decodedId = decodeURIComponent(id);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const snap = await getDoc(doc(db, "orders", decodedId));

        if (!snap.exists()) {
          setOrder(null);
          return;
        }

        const data = snap.data();

        setOrder({
          id: snap.id,
          date: data.date ?? "",
          status: data.status ?? "Menunggu Konfirmasi",
          items: data.items ?? [],
          total: data.total ?? 0,
          paymentMethod: data.paymentMethod ?? "",
          address: data.address ?? "",
          phone: data.phone ?? "",
          recipientName: data.recipientName ?? "",
          note: data.note ?? "",
        });
      } catch (error) {
        console.error("Gagal mengambil detail order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [decodedId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 flex flex-col items-center gap-4 text-gray-400">
        <FontAwesomeIcon icon={faBox} className="w-12 h-12 text-gray-200" />
        <p className="font-semibold text-gray-600">Memuat detail pesanan...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 flex flex-col items-center gap-4 text-gray-400">
        <FontAwesomeIcon icon={faBox} className="w-12 h-12 text-gray-200" />
        <p className="font-semibold text-gray-600">Pesanan tidak ditemukan</p>
        <Link href="/user/orders" className="px-5 py-2.5 bg-[#1E2753] text-white rounded-xl text-sm font-semibold hover:bg-[#2a3470] transition-colors">
          Kembali ke Pesanan
        </Link>
      </div>
    );
  }

  const currentOrder = order;
  const status = statusConfig[currentOrder.status];
  const subtotal = currentOrder.items.reduce((acc, item) => acc + item.price * item.qty, 0);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/user/orders" className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500">
          <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
        </Link>

        <div>
          <h1 className="text-xl font-bold text-gray-800">Detail Pesanan</h1>
          <p className="text-xs text-gray-400">
            #{currentOrder.id} • {formatDate(currentOrder.date)}
          </p>
        </div>

        <span className={`ml-auto flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${status.bg} ${status.color}`}>
          <FontAwesomeIcon icon={status.icon} className="w-3 h-3" />
          {status.label}
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm font-bold text-gray-800 mb-5">Status Pesanan</p>
        <OrderTracking status={currentOrder.status} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-3">
          <FontAwesomeIcon icon={faLocationDot} className="w-4 h-4 text-[#E85D04]" />
          <p className="text-sm font-bold text-gray-800">Alamat Pengiriman</p>
        </div>

        <p className="text-sm font-semibold text-gray-700">{currentOrder.recipientName}</p>
        <p className="text-xs text-gray-500 mt-0.5">{currentOrder.phone}</p>
        <p className="text-xs text-gray-500 mt-0.5">{currentOrder.address}</p>

        {currentOrder.note && <p className="text-xs text-gray-400 mt-1 italic">Catatan: {currentOrder.note}</p>}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm font-bold text-gray-800 mb-4">Produk Dipesan</p>

        <div className="space-y-3">
          {currentOrder.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${categoryGradient[item.category] ?? defaultGradient} flex items-center justify-center flex-shrink-0`}>
                <FontAwesomeIcon icon={categoryIcon[item.category] ?? defaultCategoryIcon} className="w-5 h-5 text-white/80" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 line-clamp-1">{item.name}</p>
                <p className="text-xs text-gray-400">
                  x{item.qty} • {formatPrice(item.price)}
                </p>
              </div>

              <p className="text-sm font-bold text-[#1E2753] flex-shrink-0">{formatPrice(item.price * item.qty)}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 mt-4 pt-4 space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Subtotal ({currentOrder.items.length} produk)</span>
            <span className="font-medium text-gray-700">{formatPrice(subtotal)}</span>
          </div>

          <div className="flex justify-between text-xs text-gray-500">
            <span>Ongkos Kirim</span>
            <span className="font-medium text-green-600">Gratis</span>
          </div>

          <div className="flex justify-between text-sm font-bold text-gray-800 pt-2 border-t border-gray-100">
            <span>Total Pembayaran</span>
            <span className="text-[#1E2753]">{formatPrice(currentOrder.total)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm font-bold text-gray-800 mb-3">Informasi Pembayaran</p>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
            <FontAwesomeIcon icon={paymentIcon[currentOrder.paymentMethod] ?? faMoneyBill} className="w-4 h-4 text-[#1E2753]" />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700">{currentOrder.paymentMethod}</p>
            <p className="text-xs text-gray-400">{currentOrder.status === "Menunggu Konfirmasi" ? "Menunggu konfirmasi pembayaran" : "Pembayaran dikonfirmasi"}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pb-4">
        <a
          href="https://wa.me/62"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:border-[#1E2753] hover:text-[#1E2753] transition-all"
        >
          <FontAwesomeIcon icon={faHeadset} className="w-4 h-4" />
          Hubungi CS
        </a>

        {currentOrder.status === "Selesai" && (
          <Link href="/user/dashboard-user" className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1E2753] text-white rounded-xl text-sm font-semibold hover:bg-[#2a3470] transition-all">
            <FontAwesomeIcon icon={faRotateLeft} className="w-4 h-4" />
            Beli Lagi
          </Link>
        )}
      </div>
    </div>
  );
}
