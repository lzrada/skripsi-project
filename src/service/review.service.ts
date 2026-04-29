import { db } from "@/config/firebase";
import { collection, addDoc, onSnapshot, query, where, orderBy, serverTimestamp, doc, getDocs, runTransaction } from "firebase/firestore";
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

export const checkUserCanReviewService = async (uid: string, productId: string): Promise<{ canReview: boolean; reason?: string }> => {
  const ordersSnap = await getDocs(query(collection(db, "orders"), where("uid", "==", uid), where("status", "==", "Selesai")));

  const hasBought = ordersSnap.docs.some((d) => {
    const items: { id: string }[] = d.data().items ?? [];
    return items.some((item) => item.id === productId);
  });

  if (!hasBought) {
    return { canReview: false, reason: "Kamu harus membeli dan menyelesaikan pesanan produk ini terlebih dahulu sebelum dapat memberikan ulasan." };
  }

  const existingReview = await getDocs(query(collection(db, "reviews"), where("productId", "==", productId), where("uid", "==", uid)));

  if (!existingReview.empty) {
    return { canReview: false, reason: "Kamu sudah memberikan ulasan untuk produk ini." };
  }

  return { canReview: true };
};

export const addReviewService = async (productId: string, uid: string, userName: string, userPhoto: string | undefined, rating: number, comment: string): Promise<void> => {
  const check = await checkUserCanReviewService(uid, productId);
  if (!check.canReview) {
    throw new Error(check.reason);
  }

  await runTransaction(db, async (transaction) => {
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
