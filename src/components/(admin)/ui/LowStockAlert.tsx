"use client";

import { useEffect, useState } from "react";
import { subscribeToLowStockProductsService, markAsRestockedService } from "@/service/inventory.service";
import { REORDER_POINT } from "@/constants/inventory";
import type { LowStockProduct } from "@/types/inventory";

const LowStockAlert = () => {
  const [products, setProducts] = useState<LowStockProduct[]>([]);
  const [restocking, setRestocking] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToLowStockProductsService(REORDER_POINT, (data) => {
      setProducts(data);
    });
    return () => unsubscribe();
  }, []);

  const handleRestock = async (productId: string) => {
    try {
      setRestocking(productId);
      await markAsRestockedService(productId);
    } catch (error) {
      console.error("LowStockAlert handleRestock Error:", error);
    } finally {
      setRestocking(null);
    }
  };

  if (products.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
        <h2 className="text-sm font-bold text-slate-800">Stok Menipis</h2>
        <span className="ml-auto text-xs font-semibold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{products.length} produk</span>
      </div>

      <ul className="space-y-2">
        {products.map((product) => {
          const isCritical = product.stock <= 5;
          return (
            <li key={product.id} className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${isCritical ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"}`}>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-700 truncate">{product.name}</p>
                <p className={`text-xs mt-0.5 font-medium ${isCritical ? "text-red-500" : "text-amber-600"}`}>Sisa stok: {product.stock}</p>
              </div>
              <button
                onClick={() => handleRestock(product.id)}
                disabled={restocking === product.id}
                className="flex-shrink-0 text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-lg shadow-sm transition disabled:opacity-50"
              >
                {restocking === product.id ? "..." : "Restock"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default LowStockAlert;
