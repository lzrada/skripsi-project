import { db } from "@/config/firebase";
import { collection, onSnapshot, query, where, doc, updateDoc } from "firebase/firestore";

export interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  reorderPoint: number;
}

// Hitung reorder point berdasarkan rata-rata penjualan harian & lead time
export function calculateReorderPoint(averageDailySales: number, leadTime: number): number {
  return averageDailySales * leadTime;
}

// Hitung Economic Order Quantity (EOQ)
export function calculateEOQ(demand: number, orderingCost: number, holdingCost: number): number {
  return Math.sqrt((2 * demand * orderingCost) / holdingCost);
}

// Subscribe realtime ke produk dengan stok di bawah threshold
export const subscribeToLowStockProductsService = (threshold: number, callback: (products: LowStockProduct[]) => void) => {
  try {
    const q = query(collection(db, "products"), where("stock", "<", threshold));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const products: LowStockProduct[] = snapshot.docs.map((docItem) => {
        const data = docItem.data();
        return {
          id: docItem.id,
          name: data.name ?? "",
          stock: data.stock ?? 0,
          reorderPoint: data.reorderPoint ?? threshold,
        };
      });
      callback(products);
    });
    return unsubscribe;
  } catch (error) {
    console.error("subscribeToLowStockProductsService Error:", error);
    return () => {};
  }
};

// Subscribe realtime ke semua produk untuk alert inventory
export const subscribeToInventoryAlertsService = (callback: (products: LowStockProduct[]) => void) => {
  try {
    const q = query(collection(db, "products"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const products: LowStockProduct[] = snapshot.docs.map((docItem) => {
        const data = docItem.data();
        return {
          id: docItem.id,
          name: data.name ?? "",
          stock: data.stock ?? 0,
          reorderPoint: data.reorderPoint ?? 0,
        };
      });
      callback(products);
    });
    return unsubscribe;
  } catch (error) {
    console.error("subscribeToInventoryAlertsService Error:", error);
    return () => {};
  }
};

// Tandai produk sebagai sudah direstok
export const markAsRestockedService = async (productId: string): Promise<void> => {
  try {
    const productRef = doc(db, "products", productId);
    await updateDoc(productRef, { restocked: true });
  } catch (error) {
    console.error("markAsRestockedService Error:", error);
    throw error;
  }
};
