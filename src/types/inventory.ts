export interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  reorderPoint: number;
  lowStockAlert: boolean;
}

export interface InventoryManagement {
  items: InventoryItem[];
  calculateReorderPoint(item: InventoryItem): number;
  checkLowStock(item: InventoryItem): boolean;
}
