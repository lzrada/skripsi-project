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
 *
 * Sesuai BAB III skripsi — Gambar 3.7:
 *   "Flowchart Monitoring Stok dengan Metode Reorder Point"
 *
 * Contoh: jika rata-rata penjualan 2 unit/hari dan lead time 3 hari,
 * maka ROP = 2 × 3 = 6 unit. Artinya: ketika stok menyentuh 6,
 * sistem akan memberi peringatan restock.
 */
export function calculateReorderPoint(averageDailySales: number, leadTimeDays: number): number {
  return Math.ceil(averageDailySales * leadTimeDays);
}

/**
 * Tentukan level stok berdasarkan perbandingan dengan ROP.
 *
 * Sesuai Flowchart BAB III Gambar 3.6:
 *   "Flowchart validasi Stok dengan Algoritma Inventory First"
 *
 * Logika:
 *   - Stok <= MINIMUM_STOCK_THRESHOLD → "Stok Kritis" (blokir transaksi)
 *   - Stok <= reorderPoint            → "Perlu Restock" (notif admin)
 *   - Stok > reorderPoint             → "Stok Aman"
 */
export function calculateInventoryLevel(currentStock: number, reorderPoint: number = DEFAULT_REORDER_POINT): "Stok Kritis" | "Perlu Restock" | "Stok Aman" {
  if (currentStock <= MINIMUM_STOCK_THRESHOLD) return "Stok Kritis";
  if (currentStock <= reorderPoint) return "Perlu Restock";
  return "Stok Aman";
}

/**
 * Algoritma Inventory First:
 * Cek apakah stok tersedia untuk memenuhi permintaan.
 *
 * Sesuai BAB III skripsi — Gambar 3.6:
 *   "Flowchart validasi Stok dengan Algoritma Inventory First"
 *
 * Dipakai di halaman keranjang & checkout untuk memastikan
 * qty pesanan tidak melebihi stok yang tersedia.
 *
 * @param requestedQty - jumlah yang dipesan user
 * @param currentStock - stok aktual di Firestore
 * @returns true jika stok mencukupi, false jika tidak
 */
export function inventoryFirstCheck(requestedQty: number, currentStock: number): boolean {
  return currentStock >= requestedQty && currentStock > 0;
}

/** Cek apakah stok sudah menyentuh/di bawah Reorder Point */
export function isLowStock(currentStock: number, reorderPoint: number = DEFAULT_REORDER_POINT): boolean {
  return currentStock <= reorderPoint;
}

/** Cek apakah stok berada di kondisi kritis */
export function isCriticalStock(currentStock: number): boolean {
  return currentStock <= MINIMUM_STOCK_THRESHOLD;
}
