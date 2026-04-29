"use client";

import { subscribeToOrderByIdService } from "@/service/order.service";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faLocationDot, faMoneyBill, faWallet, faTruck, faCreditCard, faBox, faHeadset, faRotateLeft, faStar } from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { categoryIcon, categoryGradient, defaultCategoryIcon, defaultGradient } from "@/constants/category";
import { type Order, statusConfig } from "@/types/order";
import OrderTracking from "@/components/(user)/orders/OrderTracking";
import { WA_URL } from "@/constants/contact";
import { checkUserCanReviewService, addReviewService } from "@/service/review.service";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { toast } from "@/components/ui/Toast";

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

function getUid(): string | null {
  if (typeof document === "undefined") return null;
  return (
    document.cookie
      .split("; ")
      .find((r) => r.startsWith("uid="))
      ?.split("=")[1] ?? null
  );
}

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} type="button" onClick={() => onChange(i)} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(0)} className="p-0.5">
          <FontAwesomeIcon icon={faStar} className={`w-6 h-6 transition-colors ${i <= (hovered || value) ? "text-amber-400" : "text-gray-300"}`} />
        </button>
      ))}
    </div>
  );
}

interface ReviewModalProps {
  productId: string;
  productName: string;
  uid: string;
  onClose: () => void;
  onSuccess: (productId: string) => void;
}

function ReviewModal({ productId, productName, uid, onClose, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.warning("Pilih rating bintang terlebih dahulu.");
      return;
    }
    if (comment.trim().length < 5) {
      toast.warning("Ulasan minimal 5 karakter.");
      return;
    }
    setSubmitting(true);
    try {
      const userSnap = await getDoc(doc(db, "users", uid));
      const userData = userSnap.data();
      await addReviewService(productId, uid, userData?.fullName ?? "Pengguna", userData?.photoURL ?? undefined, rating, comment);
      toast.success("Ulasan berhasil dikirim!");
      onSuccess(productId);
      onClose();
    } catch (err: any) {
      toast.error(err?.message ?? "Gagal mengirim ulasan.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-base font-bold text-gray-800">Beri Ulasan</p>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg font-bold">
            ✕
          </button>
        </div>
        <p className="text-sm text-gray-500 line-clamp-2">{productName}</p>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Rating</p>
          <StarInput value={rating} onChange={setRating} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Ulasan</p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Bagikan pengalamanmu dengan produk ini..."
            rows={4}
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:border-[#1E2753]"
          />
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border-2 border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:border-gray-300 transition">
            Batal
          </button>
          <button onClick={handleSubmit} disabled={submitting || rating === 0} className="flex-1 py-2.5 bg-[#1E2753] text-white rounded-xl text-sm font-semibold hover:bg-[#2a3470] transition disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? "Mengirim..." : "Kirim Ulasan"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const decodedId = decodeURIComponent(id);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  const [reviewableItems, setReviewableItems] = useState<Set<string>>(new Set());
  const [reviewedItems, setReviewedItems] = useState<Set<string>>(new Set());
  const [activeReviewProduct, setActiveReviewProduct] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    const uid = getUid();

    const unsub = subscribeToOrderByIdService(decodedId, (data) => {
      if (!data) {
        setOrder(null);
        setLoading(false);
        return;
      }

      if (uid && data.uid !== uid) {
        setForbidden(true);
        setLoading(false);
        return;
      }

      setOrder(data);
      setLoading(false);

      if (data.status === "Selesai" && uid) {
        Promise.all(
          data.items.map((item) =>
            checkUserCanReviewService(uid, item.id).then((result) => ({
              id: item.id,
              canReview: result.canReview,
              alreadyReviewed: result.reason?.includes("sudah memberikan ulasan") ?? false,
            })),
          ),
        ).then((results) => {
          const canReview = new Set<string>();
          const reviewed = new Set<string>();
          results.forEach((r) => {
            if (r.canReview) canReview.add(r.id);
            if (r.alreadyReviewed) reviewed.add(r.id);
          });
          setReviewableItems(canReview);
          setReviewedItems(reviewed);
        });
      }
    });

    return () => unsub();
  }, [decodedId]);

  const handleReviewSuccess = (productId: string) => {
    setReviewableItems((prev) => {
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });
    setReviewedItems((prev) => new Set(prev).add(productId));
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 flex flex-col items-center gap-4 text-gray-400">
        <FontAwesomeIcon icon={faBox} className="w-12 h-12 text-gray-200" />
        <p className="font-semibold text-gray-600">Memuat detail pesanan...</p>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 flex flex-col items-center gap-4 text-gray-400">
        <FontAwesomeIcon icon={faBox} className="w-12 h-12 text-gray-200" />
        <p className="font-semibold text-gray-600">Kamu tidak punya akses ke pesanan ini</p>
        <Link href="/user/orders" className="px-5 py-2.5 bg-[#1E2753] text-white rounded-xl text-sm font-semibold hover:bg-[#2a3470] transition-colors">
          Kembali ke Pesanan
        </Link>
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

  const status = statusConfig[order.status];
  const subtotal = order.items.reduce((acc, item) => acc + item.price * item.qty, 0);
  const uid = getUid();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      {activeReviewProduct && uid && <ReviewModal productId={activeReviewProduct.id} productName={activeReviewProduct.name} uid={uid} onClose={() => setActiveReviewProduct(null)} onSuccess={handleReviewSuccess} />}

      <div className="flex items-center gap-3">
        <Link href="/user/orders" className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500">
          <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Detail Pesanan</h1>
          <p className="text-xs text-gray-400">
            #{order.id} • {formatDate(order.date)}
          </p>
        </div>
        <span className={`ml-auto flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${status.bg} ${status.color}`}>
          <FontAwesomeIcon icon={status.icon} className="w-3 h-3" />
          {status.label}
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm font-bold text-gray-800 mb-5">Status Pesanan</p>
        <OrderTracking status={order.status} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-3">
          <FontAwesomeIcon icon={faLocationDot} className="w-4 h-4 text-[#E85D04]" />
          <p className="text-sm font-bold text-gray-800">Alamat Pengiriman</p>
        </div>
        <p className="text-sm font-semibold text-gray-700">{order.recipientName}</p>
        <p className="text-xs text-gray-500 mt-0.5">{order.phone}</p>
        <p className="text-xs text-gray-500 mt-0.5">{order.address}</p>
        {order.note && <p className="text-xs text-gray-400 mt-1 italic">Catatan: {order.note}</p>}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm font-bold text-gray-800 mb-4">Produk Dipesan</p>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${categoryGradient[item.category] ?? defaultGradient} flex items-center justify-center flex-shrink-0`}>
                <FontAwesomeIcon icon={categoryIcon[item.category] ?? defaultCategoryIcon} className="w-5 h-5 text-white/80" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 line-clamp-1">{item.name}</p>
                <p className="text-xs text-gray-400">
                  x{item.qty} • {formatPrice(item.price)}
                </p>
                {order.status === "Selesai" && (
                  <div className="mt-1">
                    {reviewedItems.has(item.id) ? (
                      <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <FontAwesomeIcon icon={faStar} className="w-3 h-3 text-amber-400" />
                        Sudah diulas
                      </span>
                    ) : reviewableItems.has(item.id) ? (
                      <button onClick={() => setActiveReviewProduct({ id: item.id, name: item.name })} className="text-xs text-[#1E2753] font-semibold flex items-center gap-1 hover:underline">
                        <FontAwesomeIcon icon={faStar} className="w-3 h-3 text-amber-400" />
                        Beri Ulasan
                      </button>
                    ) : null}
                  </div>
                )}
              </div>
              <p className="text-sm font-bold text-[#1E2753] flex-shrink-0">{formatPrice(item.price * item.qty)}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 mt-4 pt-4 space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Subtotal ({order.items.length} produk)</span>
            <span className="font-medium text-gray-700">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Ongkos Kirim</span>
            <span className="font-medium text-green-600">Gratis</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-gray-800 pt-2 border-t border-gray-100">
            <span>Total Pembayaran</span>
            <span className="text-[#1E2753]">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm font-bold text-gray-800 mb-3">Informasi Pembayaran</p>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
            <FontAwesomeIcon icon={paymentIcon[order.paymentMethod] ?? faMoneyBill} className="w-4 h-4 text-[#1E2753]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">{order.paymentMethod}</p>
            <p className="text-xs text-gray-400">{order.status === "Menunggu Konfirmasi" ? "Menunggu konfirmasi pembayaran" : "Pembayaran dikonfirmasi"}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pb-4">
        <a
          href={WA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:border-[#1E2753] hover:text-[#1E2753] transition-all"
        >
          <FontAwesomeIcon icon={faHeadset} className="w-4 h-4" />
          Hubungi CS
        </a>
        {order.status === "Selesai" && (
          <Link href="/user/dashboard-user" className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1E2753] text-white rounded-xl text-sm font-semibold hover:bg-[#2a3470] transition-all">
            <FontAwesomeIcon icon={faRotateLeft} className="w-4 h-4" />
            Beli Lagi
          </Link>
        )}
      </div>
    </div>
  );
}
