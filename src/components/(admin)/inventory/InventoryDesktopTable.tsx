import Link from "next/link";
import { formatPrice } from "@/components/(admin)/inventory/inventoryHelpers";
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

interface InventoryDesktopTableProps {
  filtered: ProductStock[];
  onEditROP: (product: ProductStock) => void;
  onRestock: (product: ProductStock) => void;
  restockingId: string | null;
}

export function InventoryDesktopTable({ filtered, onEditROP, onRestock, restockingId }: InventoryDesktopTableProps) {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Produk</th>
            <th className="text-center px-4 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Stok</th>
            <th className="text-center px-4 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">ROP</th>
            {/* <th className="text-center px-4 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Avg/Hari</th> */}
            <th className="text-center px-4 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Lead Time</th>
            <th className="text-center px-4 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Status</th>
            <th className="text-center px-4 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-12 text-slate-400 text-sm">
                Tidak ada produk ditemukan
              </td>
            </tr>
          ) : (
            filtered.map((p) => (
              <tr key={p.id} className={`hover:bg-slate-50 transition ${isCriticalStock(p.stock) ? "bg-red-50/50" : ""}`}>
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-800 truncate max-w-[200px]">{p.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {p.category} · {formatPrice(p.price)}
                  </p>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className={`text-lg font-black ${isCriticalStock(p.stock) ? "text-red-600" : isLowStock(p.stock, p.reorderPoint) ? "text-amber-600" : "text-green-600"}`}>{p.stock}</span>
                  <StockBar stock={p.stock} rop={p.reorderPoint} />
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="font-bold text-slate-700">{p.reorderPoint}</span>
                </td>
                {/* <td className="px-4 py-4 text-center text-slate-500">{p.averageDailySales > 0 ? p.averageDailySales : "-"}</td> */}
                <td className="px-4 py-4 text-center text-slate-500">{p.leadTimeDays} hari</td>
                <td className="px-4 py-4 text-center">
                  <StockBadge stock={p.stock} rop={p.reorderPoint} />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => onEditROP(p)} className="text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition">
                      Atur ROP
                    </button>
                    {isLowStock(p.stock, p.reorderPoint) && (
                      <button
                        onClick={() => onRestock(p)}
                        disabled={restockingId === p.id}
                        className="text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                      >
                        {restockingId === p.id ? "..." : "Tandai Restock"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
