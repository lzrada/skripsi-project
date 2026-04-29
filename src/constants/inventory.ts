export const DEFAULT_REORDER_POINT = 5;

export const MINIMUM_STOCK_THRESHOLD = 2;

export function calculateInventoryLevel(currentStock: number, reorderPoint: number = DEFAULT_REORDER_POINT): string {
  if (currentStock <= MINIMUM_STOCK_THRESHOLD) {
    return "Stok Kritis";
  } else if (currentStock <= reorderPoint) {
    return "Perlu Restock";
  }
  return "Stok Aman";
}

export function isLowStock(currentStock: number, reorderPoint: number = DEFAULT_REORDER_POINT): boolean {
  return currentStock <= reorderPoint;
}

export function isCriticalStock(currentStock: number): boolean {
  return currentStock <= MINIMUM_STOCK_THRESHOLD;
}
