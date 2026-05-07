"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faStarHalfAlt, faShield, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarEmpty } from "@fortawesome/free-regular-svg-icons";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { Review } from "@/types/product";
import { subscribeToProductReviews, addReviewService, checkUserCanReviewService } from "@/service/review.service";

function getUidFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  return (
    document.cookie
      .split("; ")
      .find((r) => r.startsWith("uid="))
      ?.split("=")[1] ?? null
  );
}

function formatDate(dateStr: any) {
  if (!dateStr) return "";
  const date = dateStr?.toDate ? dateStr.toDate() : new Date(dateStr);
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function StarDisplay({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sizeClass = size === "md" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <FontAwesomeIcon key={i} icon={rating >= i ? faStar : rating >= i - 0.5 ? faStarHalfAlt : faStarEmpty} className={`${sizeClass} ${rating >= i - 0.5 ? "text-amber-400" : "text-gray-300"}`} />
      ))}
    </div>
  );
}

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} type="button" onClick={() => onChange(i)} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(0)} className="p-0.5">
          <FontAwesomeIcon icon={faStar} className={`w-7 h-7 transition-colors ${i <= (hovered || value) ? "text-amber-400" : "text-gray-300"}`} />
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({ productId, totalReviews, averageRating }: { productId: string; totalReviews: number; averageRating: number }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [canReview, setCanReview] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const unsub = subscribeToProductReviews(productId, setReviews);
    return () => unsub();
  }, [productId]);

  useEffect(() => {
    const uid = getUidFromCookie();
    if (!uid) return;
    checkUserCanReviewService(uid, productId).then((result) => {
      if (result.canReview) setCanReview(true);
      else if (result.reason?.includes("sudah memberikan ulasan")) setAlreadyReviewed(true);
    });
  }, [productId]);

  const handleSubmitReview = async () => {
    const uid = getUidFromCookie();
    if (!uid) {
      alert("Silakan login terlebih dahulu!");
      return;
    }
    if (reviewRating === 0) {
      alert("Pilih rating bintang terlebih dahulu.");
      return;
    }
    if (reviewComment.trim().length < 5) {
      alert("Ulasan minimal 5 karakter.");
      return;
    }
    setSubmittingReview(true);
    try {
      const userSnap = await getDoc(doc(db, "users", uid));
      const userData = userSnap.data();
      await addReviewService(productId, uid, userData?.fullName ?? "Pengguna", userData?.photoURL ?? undefined, reviewRating, reviewComment);
      setReviewRating(0);
      setReviewComment("");
      setCanReview(false);
      setAlreadyReviewed(true);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-6">
      {averageRating > 0 && (
        <div className="flex items-center gap-6 p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-100">
          <div className="text-center flex-shrink-0">
            <p className="text-5xl font-black text-amber-500">{averageRating.toFixed(1)}</p>
            <StarDisplay rating={averageRating} size="md" />
            <p className="text-xs text-gray-400 mt-1">dari {totalReviews} ulasan</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter((r) => r.rating === star).length;
              const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-3 flex-shrink-0">{star}</span>
                  <FontAwesomeIcon icon={faStar} className="w-2.5 h-2.5 text-amber-400 flex-shrink-0" />
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div className="h-1.5 bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-400 w-4 flex-shrink-0">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {canReview && (
        <div className="border-2 border-[#1E2753]/10 bg-blue-50/30 rounded-2xl p-5 space-y-4">
          <p className="text-sm font-bold text-gray-800">Tulis Ulasanmu</p>
          <StarInput value={reviewRating} onChange={setReviewRating} />
          <textarea
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Bagikan pengalamanmu — kondisi barang, kualitas, kesesuaian deskripsi..."
            rows={4}
            className="w-full text-sm border-2 border-gray-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:border-[#1E2753] transition bg-white"
          />
          <button
            onClick={handleSubmitReview}
            disabled={submittingReview || reviewRating === 0 || reviewComment.trim().length < 5}
            className="w-full py-3 bg-[#1E2753] text-white rounded-xl text-sm font-semibold hover:bg-[#2a3470] transition disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {submittingReview && <FontAwesomeIcon icon={faSpinner} className="w-3.5 h-3.5 animate-spin" />}
            {submittingReview ? "Mengirim..." : "Kirim Ulasan"}
          </button>
        </div>
      )}

      {alreadyReviewed && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <p className="text-sm text-green-700 font-medium">Kamu sudah memberikan ulasan untuk produk ini. Terima kasih! 🙏</p>
        </div>
      )}

      {!canReview && !alreadyReviewed && (
        <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
          <FontAwesomeIcon icon={faShield} className="w-4 h-4 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm text-gray-700 font-semibold">Ulasan Terverifikasi</p>
            <p className="text-xs text-gray-500 mt-0.5">Hanya pembeli yang telah menyelesaikan pesanan yang dapat memberikan ulasan.</p>
          </div>
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-4xl mb-3">💬</p>
          <p className="text-sm font-semibold text-gray-600">Belum ada ulasan</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="flex gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-[#1E2753] flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden ring-2 ring-white">
                {r.userPhoto ? <Image src={r.userPhoto} alt={r.userName} width={40} height={40} className="object-cover w-full h-full" /> : (r.userName?.[0]?.toUpperCase() ?? "U")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <p className="text-sm font-bold text-gray-800">{r.userName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StarDisplay rating={r.rating} />
                      <span className="text-[10px] bg-green-100 text-green-600 font-semibold px-1.5 py-0.5 rounded-full">Pembelian Terverifikasi</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 shrink-0 mt-0.5">{formatDate(r.createdAt)}</p>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
