export const REORDER_POINT = 50; // Example reorder point
export const MINIMUM_STOCK_THRESHOLD = 20; // Minimum stock threshold

export function calculateInventoryLevel(currentStock: number): string {
  if (currentStock < REORDER_POINT) {
    return "Reorder required";
  } else if (currentStock < MINIMUM_STOCK_THRESHOLD) {
    return "Warning: Low stock";
  }
  return "Stock level is sufficient";
}
