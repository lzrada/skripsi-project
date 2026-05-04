// src/constants/inventory.ts

/** Default nilai Reorder Point jika tidak diset per-produk */
export const DEFAULT_REORDER_POINT = 5;

/** Alias — agar komponen lama yang import REORDER_POINT tidak error */
export const REORDER_POINT = DEFAULT_REORDER_POINT;

/** Batas stok kritis (di bawah ini = bahaya, perlu restock segera) */
export const MINIMUM_STOCK_THRESHOLD = 2;

/**
 * Hitung Reorder Point (ROP) menggunakan rumus:
 *   ROP = rata-rata penjualan harian × lead time (hari)
 * Sesuai metode Reorder Point pada skripsi BAB II pasal 2.1.10
 */
export function calculateReorderPoint(
  averageDailySales: number,
  leadTimeDays: number
): number {
  return Math.ceil(averageDailySales * leadTimeDays);
}

/**
 * Tentukan level stok berdasarkan perbandingan dengan ROP.
 * Flowchart: Stok <= ROP? → notifikasi stok minimum
 */
export function calculateInventoryLevel(
  currentStock: number,
  reorderPoint: number = DEFAULT_REORDER_POINT
): "Stok Kritis" | "Perlu Restock" | "Stok Aman" {
  if (currentStock <= MINIMUM_STOCK_THRESHOLD) return "Stok Kritis";
  if (currentStock <= reorderPoint) return "Perlu Restock";
  return "Stok Aman";
}

/** Cek apakah stok sudah menyentuh/di bawah Reorder Point */
export function isLowStock(
  currentStock: number,
  reorderPoint: number = DEFAULT_REORDER_POINT
): boolean {
  return currentStock <= reorderPoint;
}

/** Cek apakah stok berada di kondisi kritis */
export function isCriticalStock(currentStock: number): boolean {
  return currentStock <= MINIMUM_STOCK_THRESHOLD;
}
