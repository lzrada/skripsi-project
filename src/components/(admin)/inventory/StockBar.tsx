import { isCriticalStock, isLowStock } from "@/constants/inventory";

interface StockBarProps {
  stock: number;
  rop: number;
}

export function StockBar({ stock, rop }: StockBarProps) {
  const max = Math.max(rop * 3, stock, 1);
  const pct = Math.min((stock / max) * 100, 100);
  const color = isCriticalStock(stock) ? "bg-red-500" : isLowStock(stock, rop) ? "bg-amber-400" : "bg-green-500";
  return (
    <div className="w-full bg-slate-100 rounded-full h-2 mt-1">
      <div className={`h-2 rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
