// src/service/review.service.ts
import { db } from "@/config/firebase";
import { collection, addDoc, onSnapshot, query, where, orderBy, serverTimestamp, doc, updateDoc, runTransaction } from "firebase/firestore";
import { Review } from "@/types/product";

export const subscribeToProductReviews = (productId: string, callback: (reviews: Review[]) => void) => {
  const q = query(collection(db, "reviews"), where("productId", "==", productId), orderBy("createdAt", "desc"));

  return onSnapshot(q, (snapshot) => {
    const reviews: Review[] = snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Review, "id">),
    }));
    callback(reviews);
  });
};

export const addReviewService = async (productId: string, uid: string, userName: string, userPhoto: string | undefined, rating: number, comment: string): Promise<void> => {
  await runTransaction(db, async (transaction) => {
    // 1. Tambah review baru
    const reviewRef = doc(collection(db, "reviews"));
    transaction.set(reviewRef, {
      productId,
      uid,
      userName,
      userPhoto: userPhoto || null,
      rating,
      comment: comment.trim(),
      createdAt: serverTimestamp(),
    });

    // 2. Update average rating & total reviews di produk
    const productRef = doc(db, "products", productId);
    const productSnap = await transaction.get(productRef);

    if (!productSnap.exists()) throw new Error("Produk tidak ditemukan");

    const productData = productSnap.data();
    const currentTotalReviews = productData.totalReviews || 0;
    const currentSumRating = (productData.averageRating || 0) * currentTotalReviews;

    const newTotalReviews = currentTotalReviews + 1;
    const newAverageRating = (currentSumRating + rating) / newTotalReviews;

    transaction.update(productRef, {
      averageRating: Number(newAverageRating.toFixed(1)),
      totalReviews: newTotalReviews,
    });
  });
};
