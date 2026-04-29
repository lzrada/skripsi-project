// src/service/inventory.service.ts
import { db } from "@/config/firebase";
import { collection, onSnapshot, query, doc, updateDoc } from "firebase/firestore";

export interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  reorderPoint: number;
  suggestedReorder?: number;
}

// Hitung Reorder Point (sesuai teori skripsi)
export function calculateReorderPoint(averageDailySales: number, leadTime: number): number {
  return Math.ceil(averageDailySales * leadTime);
}

// Hitung EOQ (opsional)
export function calculateEOQ(demand: number, orderingCost: number, holdingCost: number): number {
  return Math.sqrt((2 * demand * orderingCost) / holdingCost);
}

// ==================== MONITORING REORDER POINT ====================
// Subscribe ke produk dengan stok rendah
export const subscribeToLowStockProductsService = (callback: (products: LowStockProduct[]) => void) => {
  try {
    const q = query(collection(db, "products"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allProducts: LowStockProduct[] = snapshot.docs.map((docItem) => {
        const data = docItem.data();
        const stock = data.stock ?? 0;
        const reorderPoint = data.reorderPoint ?? 5;

        return {
          id: docItem.id,
          name: data.name ?? "",
          stock,
          reorderPoint,
          suggestedReorder: stock < reorderPoint ? reorderPoint * 2 : undefined,
        };
      });

      // Filter hanya produk yang perlu diperhatikan (stok <= reorderPoint)
      const lowStockProducts = allProducts.filter((p) => p.stock <= p.reorderPoint);

      // Pengecekan penting agar tidak error "callback is not a function"
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

// Subscribe ke semua produk (untuk dashboard inventory)
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
          reorderPoint: data.reorderPoint ?? 5,
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

// Update Reorder Point
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

// Tandai sudah direstock
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
