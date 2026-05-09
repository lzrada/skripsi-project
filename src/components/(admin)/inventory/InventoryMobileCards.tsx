import { StockBadge } from "@/components/(admin)/inventory/StockBadge";
import { StockBar } from "@/components/(admin)/inventory/StockBar";
import { isCriticalStock, isLowStock } from "@/constants/inventory";

interface ProductStock {
  id: string;
  name: string;
  category: string;
  stock: number;
  reorderPoint: number;
  averageDailySales: number;
  leadTimeDays: number;
  price: number;
  lastRestockedAt?: string;
}

interface InventoryMobileCardsProps {
  filtered: ProductStock[];
  onEditROP: (product: ProductStock) => void;
  onRestock: (product: ProductStock) => void;
  restockingId: string | null;
}

export function InventoryMobileCards({ filtered, onEditROP, onRestock, restockingId }: InventoryMobileCardsProps) {
  return (
    <div className="md:hidden divide-y divide-slate-100">
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">Tidak ada produk ditemukan</div>
      ) : (
        filtered.map((p) => (
          <div key={p.id} className={`p-4 ${isCriticalStock(p.stock) ? "bg-red-50/50" : ""}`}>
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm truncate">{p.name}</p>
                <p className="text-xs text-slate-400">{p.category}</p>
              </div>
              <StockBadge stock={p.stock} rop={p.reorderPoint} />
            </div>
            <div className="grid grid-cols-3 gap-3 mb-3 text-center">
              <div className="bg-slate-50 rounded-lg p-2">
                <p className="text-xs text-slate-400">Stok</p>
                <p className={`font-black text-base ${isCriticalStock(p.stock) ? "text-red-600" : isLowStock(p.stock, p.reorderPoint) ? "text-amber-600" : "text-green-600"}`}>{p.stock}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-2">
                <p className="text-xs text-slate-400">ROP</p>
                <p className="font-black text-base text-amber-600">{p.reorderPoint}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-2">
                <p className="text-xs text-slate-400">Lead Time</p>
                <p className="font-black text-base text-slate-700">{p.leadTimeDays}h</p>
              </div>
            </div>
            <StockBar stock={p.stock} rop={p.reorderPoint} />
            <div className="flex gap-2 mt-3">
              <button onClick={() => onEditROP(p)} className="flex-1 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 py-2 rounded-lg transition">
                Atur ROP
              </button>
              {isLowStock(p.stock, p.reorderPoint) && (
                <button
                  onClick={() => onRestock(p)}
                  disabled={restockingId === p.id}
                  className="flex-1 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 py-2 rounded-lg transition disabled:opacity-50"
                >
                  {restockingId === p.id ? "..." : "Tandai Restock"}
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
