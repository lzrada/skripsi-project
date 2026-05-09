import Link from "next/link";
import type { LowStockProduct } from "@/service/inventory.service";

interface LowStockBannerProps {
  loading: boolean;
  lowStockProducts: LowStockProduct[];
}

export function LowStockBanner({ loading, lowStockProducts }: LowStockBannerProps) {
  if (loading || lowStockProducts.length === 0) return null;

  return (
    <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-red-700">{lowStockProducts.length} produk stoknya di bawah Reorder Point!</p>
          <p className="text-xs text-red-500 mt-0.5">Segera lakukan restock untuk menghindari kehabisan stok.</p>
        </div>
      </div>
      <Link href="/admin/inventory-monitoring" className="flex-shrink-0 text-xs font-semibold text-red-600 bg-red-100 hover:bg-red-200 px-4 py-2 rounded-xl transition">
        Lihat Detail →
      </Link>
    </div>
  );
}
