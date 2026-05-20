// src/service/inventory.service.ts
import { db } from "@/config/firebase";
import { collection, onSnapshot, query, doc, updateDoc } from "firebase/firestore";
import { isLowStock, DEFAULT_REORDER_POINT, calculateReorderPoint } from "@/constants/inventory";

export interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  reorderPoint: number;
  suggestedReorder?: number;
  averageDailySales?: number;
  leadTimeDays?: number;
}

export const subscribeToLowStockProductsService = (ropThreshold: number = DEFAULT_REORDER_POINT, callback: (products: LowStockProduct[]) => void) => {
  try {
    const q = query(collection(db, "products"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allProducts: LowStockProduct[] = snapshot.docs.map((docItem) => {
        const data = docItem.data();
        const stock: number = data.stock ?? 0;
        const avgSales: number = data.averageDailySales ?? 0;
        const leadTime: number = data.leadTimeDays ?? 3;

        const reorderPoint: number = avgSales > 0 ? calculateReorderPoint(avgSales, leadTime) : (data.reorderPoint ?? ropThreshold);

        return {
          id: docItem.id,
          name: data.name ?? "",
          stock,
          reorderPoint,
          averageDailySales: avgSales,
          leadTimeDays: leadTime,
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

/**
 * Subscribe ke SEMUA produk beserta status inventorinya.
 * Dipakai halaman monitoring stok admin.
 */
export const subscribeToInventoryAlertsService = (callback: (products: LowStockProduct[]) => void) => {
  try {
    const q = query(collection(db, "products"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const products: LowStockProduct[] = snapshot.docs.map((docItem) => {
        const data = docItem.data();
        const avgSales: number = data.averageDailySales ?? 0;
        const leadTime: number = data.leadTimeDays ?? 3;
        const reorderPoint: number = avgSales > 0 ? calculateReorderPoint(avgSales, leadTime) : (data.reorderPoint ?? DEFAULT_REORDER_POINT);

        return {
          id: docItem.id,
          name: data.name ?? "",
          stock: data.stock ?? 0,
          reorderPoint,
          averageDailySales: avgSales,
          leadTimeDays: leadTime,
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

/** Update reorderPoint manual per-produk di Firestore */
export const updateReorderPointService = async (productId: string, newReorderPoint: number): Promise<void> => {
  try {
    const productRef = doc(db, "products", productId);
    await updateDoc(productRef, { reorderPoint: newReorderPoint });
  } catch (error) {
    console.error("updateReorderPointService Error:", error);
    throw error;
  }
};

/**
 * Update rata-rata penjualan harian & lead time, lalu hitung + simpan ROP otomatis.
 * Admin bisa set ini dari halaman monitoring.
 */
export const updateStockParamsService = async (productId: string, params: { averageDailySales: number; leadTimeDays: number }): Promise<void> => {
  try {
    const productRef = doc(db, "products", productId);
    const computedROP = calculateReorderPoint(params.averageDailySales, params.leadTimeDays);
    await updateDoc(productRef, {
      averageDailySales: params.averageDailySales,
      leadTimeDays: params.leadTimeDays,
      reorderPoint: computedROP,
    });
  } catch (error) {
    console.error("updateStockParamsService Error:", error);
    throw error;
  }
};

/** Tandai produk sudah di-restock */
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
