"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/config/firebase";

const CATEGORY_COLORS: Record<string, string> = {
  Televisi: "#334155",
  Kulkas: "#0891b2",
  AC: "#0ea5e9",
  "Mesin Cuci": "#0d9488",
  "Kipas Angin": "#6366f1",
  Audio: "#db2777",
  Laptop: "#374151",
  HP: "#059669",
  Lainnya: "#9ca3af",
};

const CategoryBreakdown = () => {
  const [salesData, setSalesData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "orders"), (snap) => {
      const counts: Record<string, number> = {};
      snap.docs.forEach((d) => {
        const items: { category: string; qty: number }[] = d.data().items ?? [];
        items.forEach((item) => {
          const cat = item.category || "Lainnya";
          counts[cat] = (counts[cat] ?? 0) + (item.qty ?? 1);
        });
      });
      setSalesData(counts);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const entries = Object.entries(salesData).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((acc, [, v]) => acc + v, 0);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="h-4 bg-slate-100 rounded w-40 mb-4 animate-pulse" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-8 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <p className="text-sm text-slate-400 text-center py-4">Belum ada data penjualan per kategori.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h2 className="text-sm font-bold text-slate-800 mb-4">Penjualan per Kategori</h2>
      <ul className="space-y-3">
        {entries.map(([category, count]) => {
          const pct = total > 0 ? (count / total) * 100 : 0;
          const color = CATEGORY_COLORS[category] ?? CATEGORY_COLORS["Lainnya"];
          return (
            <li key={category}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">{category}</span>
                <span className="text-slate-500">
                  {count} ({pct.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
              </div>
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-slate-400 mt-4">Total terjual: {total} item</p>
    </div>
  );
};

export default CategoryBreakdown;
