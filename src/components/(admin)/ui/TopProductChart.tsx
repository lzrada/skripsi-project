"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/config/firebase";

interface TopProduct {
  name: string;
  quantitySold: number;
  revenue: number;
}

const formatRevenue = (val: number) => {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}jt`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}rb`;
  return val.toString();
};

const TopProductsChart = () => {
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "orders"), (snap) => {
      const map: Record<string, TopProduct> = {};
      snap.docs.forEach((d) => {
        const data = d.data();
        const items: { name: string; price: number; qty: number }[] = data.items ?? [];
        items.forEach((item) => {
          if (!map[item.name]) {
            map[item.name] = { name: item.name, quantitySold: 0, revenue: 0 };
          }
          map[item.name].quantitySold += item.qty ?? 1;
          map[item.name].revenue += (item.price ?? 0) * (item.qty ?? 1);
        });
      });

      const sorted = Object.values(map)
        .sort((a, b) => b.quantitySold - a.quantitySold)
        .slice(0, 5);

      setProducts(sorted);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const maxQty = products[0]?.quantitySold ?? 1;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="h-4 bg-slate-100 rounded w-48 mb-4 animate-pulse" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <p className="text-sm text-slate-400 text-center py-4">Belum ada data produk terlaris.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h2 className="text-sm font-bold text-slate-800 mb-4">5 Produk Terlaris</h2>
      <ul className="space-y-3">
        {products.map((product, index) => {
          const pct = maxQty > 0 ? (product.quantitySold / maxQty) * 100 : 0;
          return (
            <li key={product.name}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium truncate max-w-[60%]">
                  <span className="text-slate-400 mr-1">#{index + 1}</span>
                  {product.name}
                </span>
                <span className="text-slate-500 flex-shrink-0">
                  {product.quantitySold} terjual · Rp {formatRevenue(product.revenue)}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-2 rounded-full bg-[#1E2753] transition-all duration-700" style={{ width: `${pct}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default TopProductsChart;
