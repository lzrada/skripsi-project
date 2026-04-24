import { Firestore } from "@google-cloud/firestore";

const firestore = new Firestore();

export class InventoryService {
  // Calculate reorder point
  calculateReorderPoint(averageDailySales: number, leadTime: number): number {
    return averageDailySales * leadTime;
  }

  // Get low stock products below reorder point
  async getLowStockProducts(threshold: number): Promise<{ id: string; name: string; stock: number; reorderPoint: number }[]> {
    const productsRef = firestore.collection("products");
    const snapshot = await productsRef.where("stock", "<", threshold).get();
    return snapshot.docs.map((doc) => doc.data());
  }

  // Calculate economic order quantity
  calculateEOQ(demand: number, orderingCost: number, holdingCost: number): number {
    return Math.sqrt((2 * demand * orderingCost) / holdingCost);
  }

  // Subscribe to inventory alerts in real-time
  subscribeToInventoryAlerts(callback: (data: any) => void): void {
    const productsRef = firestore.collection("products");
    productsRef.onSnapshot((snapshot) => {
      snapshot.forEach((doc) => {
        callback(doc.data());
      });
    });
  }

  // Mark products as restocked
  async markAsRestocked(productId: string): Promise<void> {
    const productRef = firestore.collection("products").doc(productId);
    await productRef.update({ restocked: true });
  }
}
