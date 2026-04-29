import { db } from "@/config/firebase";
import { collection, onSnapshot, query, doc, updateDoc } from "firebase/firestore";
import { isLowStock, isCriticalStock, DEFAULT_REORDER_POINT } from "@/constants/inventory";

export interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  reorderPoint: number;
  suggestedReorder?: number;
}

export function calculateReorderPoint(averageDailySales: number, leadTime: number): number {
  return Math.ceil(averageDailySales * leadTime);
}

export const subscribeToLowStockProductsService = (callback: (products: LowStockProduct[]) => void) => {
  try {
    const q = query(collection(db, "products"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allProducts: LowStockProduct[] = snapshot.docs.map((docItem) => {
        const data = docItem.data();
        const stock = data.stock ?? 0;
        const reorderPoint = data.reorderPoint ?? DEFAULT_REORDER_POINT;

        return {
          id: docItem.id,
          name: data.name ?? "",
          stock,
          reorderPoint,
          suggestedReorder: isLowStock(stock, reorderPoint) ? reorderPoint * 2 : undefined,
        };
      });

      const lowStockProducts = allProducts.filter((p) => isLowStock(p.stock, p.reorderPoint));

      if (typeof callback === "function") {
        callback(lowStockProducts);
      }
    });

    return unsubscribe;
  } catch (error) {
    console.error("subscribeToLowStockProductsService Error:", error);
    return () => {};
  }
};

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
          reorderPoint: data.reorderPoint ?? DEFAULT_REORDER_POINT,
        };
      });

      if (typeof callback === "function") {
        callback(products);
      }
    });

    return unsubscribe;
  } catch (error) {
    console.error("subscribeToInventoryAlertsService Error:", error);
    return () => {};
  }
};

export const updateReorderPointService = async (productId: string, newReorderPoint: number): Promise<void> => {
  try {
    const productRef = doc(db, "products", productId);
    await updateDoc(productRef, {
      reorderPoint: newReorderPoint,
    });
  } catch (error) {
    console.error("updateReorderPointService Error:", error);
    throw error;
  }
};

export const markAsRestockedService = async (productId: string): Promise<void> => {
  try {
    const productRef = doc(db, "products", productId);
    await updateDoc(productRef, {
      restocked: true,
      lastRestockedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("markAsRestockedService Error:", error);
    throw error;
  }
};
