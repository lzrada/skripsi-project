"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faLocationDot, faPhone, faUser, faNoteSticky, faTruck, faMoneyBill, faRotateLeft, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { type Order, statusConfig } from "@/types/order";
import { subscribeToOrderByIdService, cancelOrderService, cancelAndRefundOrderService } from "@/service/order.service";
import { categoryIcon, categoryGradient, defaultCategoryIcon, defaultGradient } from "@/constants/category";
import OrderTracking from "@/components/(user)/orders/OrderTracking";
import ReviewModal from "@/components/(user)/orders/ReviewModal";
import CancelModal from "@/components/(user)/orders/CancelModal";
import { toast } from "@/components/(user)/ui/Toast";
import { OWNER_WHATSAPP } from "@/constants/Owner_number";

function getUid(): string | null {
  if (typeof document === "undefined") return null;
  return (
    document.cookie
      .split("; ")
      .find((r) => r.startsWith("uid="))
      ?.split("=")[1] ?? null
  );
}

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
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildWhatsAppUrl(order: Order): string {
  const orderCode = order.id.slice(0, 8).toUpperCase();
  const itemLines = order.items.map((item) => `- ${item.name} x${item.qty} = ${formatPrice(item.price * item.qty)}`).join("\n");

  const message =
    `Halo, saya ingin konfirmasi pesanan:\n\n` +
    `No. Pesanan: #${orderCode}\n` +
    `Status: ${order.status}\n` +
    `Produk:\n${itemLines}\n\n` +
    `Total Bayar: ${formatPrice(order.total)}\n` +
    `Metode: ${order.paymentMethod}\n` +
    `Nama: ${order.recipientName}\n` +
    `Telepon: ${order.phone}\n` +
    `Alamat: ${order.address}\n` +
    `ID Pesanan: ${order.id}\n\n` +
    `Mohon segera diproses, terima kasih!`;

  return `https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

function ItemImage({ image, name, category }: { image?: string; name: string; category: string }) {
  if (image) {
    return (
      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
        <Image src={image} alt={name} width={48} height={48} className="w-full h-full object-contain p-1" />
      </div>
    );
  }
  return (
    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${categoryGradient[category] ?? defaultGradient} flex items-center justify-center flex-shrink-0`}>
      <FontAwesomeIcon icon={categoryIcon[category] ?? defaultCategoryIcon} className="w-5 h-5 text-white/80" />
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const uid = getUid();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Review
  const [reviewTarget, setReviewTarget] = useState<{ id: string; name: string } | null>(null);
  const [reviewedIds, setReviewedIds] = useState<string[]>([]);

  // Cancel
  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const unsub = subscribeToOrderByIdService(id, (data) => {
      if (!data) {
        setNotFound(true);
      } else {
        setOrder(data);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  const confirmCancel = async () => {
    if (!order) return;
    setCancelling(true);
    setCancelError(null);
    try {
      const isPaid = order.paymentStatus === "paid";
      const midtransOrderId = (order.midtransResult as any)?.order_id;
      if (isPaid && midtransOrderId) {
        await cancelAndRefundOrderService(order.id, midtransOrderId, order.total);
        toast.success("Pesanan dibatalkan. Dana dikembalikan dalam 3–14 hari kerja.");
      } else {
        await cancelOrderService(order.id);
        toast.success("Pesanan berhasil dibatalkan.");
      }
      setShowCancel(false);
    } catch (err: any) {
      setCancelError(err?.message ?? "Gagal membatalkan. Coba lagi.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <FontAwesomeIcon icon={faSpinner} className="w-6 h-6 text-gray-300 animate-spin" />
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 font-semibold mb-4">Pesanan tidak ditemukan.</p>
        <Link href="/user/orders" className="text-[#1E2753] font-semibold underline text-sm">
          Kembali ke Pesanan
        </Link>
      </div>
    );
  }

  const status = statusConfig[order.status];
  const canCancel = order.status === "Menunggu Konfirmasi";
  const canReview = order.status === "Selesai";
  // Tampilkan tombol WA selama pesanan belum selesai/dibatalkan
  const canWhatsApp = order.status !== "Selesai" && order.status !== "Dibatalkan";

  return (
    <>
      {reviewTarget && uid && (
        <ReviewModal
          productId={reviewTarget.id}
          productName={reviewTarget.name}
          uid={uid}
          onClose={() => setReviewTarget(null)}
          onSuccess={(pid) => {
            setReviewedIds((prev) => [...prev, pid]);
            setReviewTarget(null);
          }}
        />
      )}

      {showCancel && (
        <CancelModal
          orderId={order.id}
          isPaid={order.paymentStatus === "paid"}
          loading={cancelling}
          error={cancelError}
          onConfirm={confirmCancel}
          onClose={() => {
            setShowCancel(false);
            setCancelError(null);
          }}
        />
      )}

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/user/orders" className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition text-gray-500">
            <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-800">Detail Pesanan</h1>
            <p className="text-xs text-gray-400 truncate">#{order.id}</p>
          </div>
          <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${status.bg} ${status.color}`}>
            <FontAwesomeIcon icon={status.icon} className="w-3 h-3" />
            {status.label}
          </span>
        </div>

        {/* Tracking */}
        <OrderTracking status={order.status} />

        {/* Produk */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <p className="text-sm font-bold text-gray-800">
              Produk <span className="text-gray-400">({order.items.length})</span>
            </p>
          </div>
          <div className="divide-y divide-gray-50">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                <ItemImage image={item.image} name={item.name} category={item.category} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 line-clamp-2">{item.name}</p>
                  <p className="text-xs text-gray-400">
                    x{item.qty} · {formatPrice(item.price)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <p className="text-sm font-bold text-[#1E2753]">{formatPrice(item.price * item.qty)}</p>
                  {canReview && !reviewedIds.includes(item.id) && (
                    <button onClick={() => setReviewTarget({ id: item.id, name: item.name })} className="text-[10px] font-semibold text-[#E85D04] border border-[#E85D04]/30 bg-orange-50 hover:bg-orange-100 px-2 py-1 rounded-lg transition">
                      Beri Ulasan
                    </button>
                  )}
                  {canReview && reviewedIds.includes(item.id) && <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-lg">✓ Diulas</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ringkasan Pembayaran */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
          <p className="text-sm font-bold text-gray-800">Ringkasan Pembayaran</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal Produk</span>
              <span className="text-gray-800">{formatPrice(order.items.reduce((s, i) => s + i.price * i.qty, 0))}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Ongkos Kirim</span>
              <span className="text-gray-800">{(order.shippingFee ?? 0) > 0 ? formatPrice(order.shippingFee) : <span className="text-green-600 font-semibold">Gratis</span>}</span>
            </div>
            {(order.diskonKupon ?? 0) > 0 && (
              <div className="flex justify-between text-gray-500">
                <span>Diskon{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                <span className="text-red-500 font-semibold">-{formatPrice(order.diskonKupon!)}</span>
              </div>
            )}
          </div>
          <div className="border-t pt-3 flex justify-between items-center">
            <span className="font-bold text-gray-800">Total</span>
            <span className="text-lg font-bold text-[#1E2753]">{formatPrice(order.total)}</span>
          </div>
        </div>

        {/* Info Pengiriman */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
          <p className="text-sm font-bold text-gray-800">Informasi Pengiriman</p>
          <div className="space-y-2.5 text-sm">
            <div className="flex items-start gap-2.5">
              <FontAwesomeIcon icon={faUser} className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{order.recipientName}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <FontAwesomeIcon icon={faPhone} className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{order.phone}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <FontAwesomeIcon icon={faLocationDot} className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{order.address}</span>
            </div>
            {order.note && (
              <div className="flex items-start gap-2.5">
                <FontAwesomeIcon icon={faNoteSticky} className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-500 italic">{order.note}</span>
              </div>
            )}
          </div>
        </div>

        {/* Info Pembayaran */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-2.5">
          <p className="text-sm font-bold text-gray-800">Informasi Pembayaran</p>
          <div className="flex items-center gap-2.5 text-sm">
            <FontAwesomeIcon icon={faMoneyBill} className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="text-gray-700">{order.paymentMethod}</span>
          </div>
        </div>

        {/* Aksi */}
        <div className="space-y-3">
          {/* Tombol WhatsApp — tampil selama pesanan aktif */}
          {canWhatsApp && (
            <a
              href={buildWhatsAppUrl(order)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#1ebe5d] active:scale-[0.98] transition text-white font-bold text-sm shadow-md shadow-green-200"
            >
              <FontAwesomeIcon icon={faWhatsapp} className="w-5 h-5" />
              Konfirmasi Pesanan via WhatsApp
            </a>
          )}

          {/* Batalkan / Beli Lagi */}
          <div className="flex gap-3">
            {canCancel && (
              <button onClick={() => setShowCancel(true)} className="flex-1 py-3 border-2 border-red-400 text-red-500 rounded-2xl text-sm font-semibold hover:bg-red-500 hover:text-white transition-all">
                Batalkan Pesanan
              </button>
            )}
            {order.status === "Selesai" && (
              <Link href="/user/dashboard-user" className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1E2753] text-white rounded-2xl text-sm font-semibold hover:bg-[#2a3470] transition-all">
                <FontAwesomeIcon icon={faRotateLeft} className="w-3.5 h-3.5" />
                Beli Lagi
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
