import { db } from "@/config/firebase";
import { collection, onSnapshot, query, where, orderBy, serverTimestamp, doc, getDocs, runTransaction, limit } from "firebase/firestore";
import { Review } from "@/types/product";

export const subscribeToProductReviews = (productId: string, callback: (reviews: Review[]) => void) => {
  const q = query(collection(db, "reviews"), where("productId", "==", productId), orderBy("createdAt", "desc"), limit(50));

  return onSnapshot(
    q,
    (snapshot) => {
      const reviews: Review[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Review, "id">),
      }));
      callback(reviews);
    },
    (error) => {
      // Fallback kalau composite index Firestore belum dibuat
      console.warn("Fallback reviews query (index belum ada):", error.message);
      const fallbackQ = query(collection(db, "reviews"), where("productId", "==", productId), limit(50));
      onSnapshot(fallbackQ, (snapshot) => {
        const reviews: Review[] = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Review, "id">) })).sort((a: any, b: any) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
        callback(reviews);
      });
    },
  );
};

export const checkUserCanReviewService = async (uid: string, productId: string): Promise<{ canReview: boolean; reason?: string }> => {
  const ordersSnap = await getDocs(query(collection(db, "orders"), where("uid", "==", uid)));

  const eligible = ordersSnap.docs.find((d) => {
    const data = d.data();
    const items: { id: string }[] = data.items ?? [];
    const hasProduct = items.some((item) => item.id === productId);
    if (!hasProduct) return false;
    // Bisa review kalau order Selesai (dari admin) ATAU paymentStatus paid (dari Midtrans)
    return data.status === "Selesai" || data.paymentStatus === "paid";
  });

  if (!eligible) {
    return {
      canReview: false,
      reason: "Kamu harus membeli dan menyelesaikan pesanan produk ini terlebih dahulu.",
    };
  }

  const existingSnap = await getDocs(query(collection(db, "reviews"), where("productId", "==", productId), where("uid", "==", uid), limit(1)));

  if (!existingSnap.empty) {
    return { canReview: false, reason: "sudah memberikan ulasan" };
  }

  return { canReview: true };
};

export const addReviewService = async (productId: string, uid: string, userName: string, userPhoto: string | undefined, rating: number, comment: string): Promise<void> => {
  const check = await checkUserCanReviewService(uid, productId);
  if (!check.canReview) {
    throw new Error(check.reason?.includes("sudah memberikan ulasan") ? "Kamu sudah memberikan ulasan untuk produk ini." : check.reason);
  }

  const productRef = doc(db, "products", productId);
  const reviewRef = doc(collection(db, "reviews"));

  await runTransaction(db, async (transaction) => {
    // ✅ SEMUA READ DULU sebelum write apapun
    const productSnap = await transaction.get(productRef);
    if (!productSnap.exists()) throw new Error("Produk tidak ditemukan");

    const data = productSnap.data();
    const currentTotal = data.totalReviews || 0;
    const currentSum = (data.averageRating || 0) * currentTotal;
    const newTotal = currentTotal + 1;
    const newAvg = Number(((currentSum + rating) / newTotal).toFixed(1));

    // ✅ BARU WRITE setelah semua read selesai
    transaction.set(reviewRef, {
      productId,
      uid,
      userName,
      userPhoto: userPhoto || null,
      rating,
      comment: comment.trim(),
      createdAt: serverTimestamp(),
    });

    transaction.update(productRef, {
      averageRating: newAvg,
      totalReviews: newTotal,
    });
  });
};
