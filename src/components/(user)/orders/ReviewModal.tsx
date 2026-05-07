"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { addReviewService } from "@/service/review.service";
import { toast } from "@/components/ui/Toast";

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

interface Props {
  productId: string;
  productName: string;
  uid: string;
  onClose: () => void;
  onSuccess: (productId: string) => void;
}

export default function ReviewModal({ productId, productName, uid, onClose, onSuccess }: Props) {
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
      toast.success("Ulasan berhasil dikirim! 🎉");
      onSuccess(productId);
      onClose();
    } catch (err: any) {
      toast.error(err?.message ?? "Gagal mengirim ulasan.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
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
