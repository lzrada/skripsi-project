import { calculateInventoryLevel } from "@/constants/inventory";

interface StockBadgeProps {
  stock: number;
  rop: number;
}

export function StockBadge({ stock, rop }: StockBadgeProps) {
  const level = calculateInventoryLevel(stock, rop);
  const map = {
    "Stok Kritis": "bg-red-100 text-red-700 border-red-200",
    "Perlu Restock": "bg-amber-100 text-amber-700 border-amber-200",
    "Stok Aman": "bg-green-100 text-green-700 border-green-200",
  };
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${map[level]}`}>{level}</span>;
}
