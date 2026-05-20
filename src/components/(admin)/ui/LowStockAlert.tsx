"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/config/firebase";
import { isLowStock, isCriticalStock, calculateReorderPoint } from "@/constants/inventory";
import type { LowStockProduct } from "@/types/inventory";
import { doc, updateDoc } from "firebase/firestore";

function RestockModal({ product, onClose, onDone }: { product: LowStockProduct; onClose: () => void; onDone: () => void }) {
  const [qty, setQty] = useState<number>(product.reorderPoint * 2 || 10);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    if (!qty || qty <= 0) {
      setError("Jumlah harus lebih dari 0.");
      return;
    }
    setSaving(true);
    try {
      const productRef = doc(db, "products", product.id);
      await updateDoc(productRef, {
        stock: product.stock + qty,
        lastRestockedAt: new Date().toISOString(),
        restocked: true,
      });
      onDone();
    } catch (err) {
      console.error("Restock error:", err);
      setError("Gagal menyimpan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Tambah Stok Produk</h3>
            <p className="text-xs text-slate-500 truncate max-w-50">{product.name}</p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 mb-4 flex justify-between text-xs text-slate-600">
          <span>Stok saat ini</span>
          <span className="font-bold text-slate-800">{product.stock} unit</span>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Jumlah yang ditambahkan</label>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => {
              setError("");
              setQty(Number(e.target.value));
            }}
            className="w-full border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#1E2753] transition"
          />
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          {qty > 0 && (
            <p className="text-xs text-emerald-600 mt-1.5 font-medium">
              Stok setelah restock: <span className="font-bold">{product.stock + qty} unit</span>
            </p>
          )}
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-5 text-xs text-amber-700">
          <span className="font-semibold">Reorder Point produk ini: </span>
          {product.reorderPoint} unit — tambahkan stok di atas angka ini agar notifikasi hilang.
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition">
            Batal
          </button>
          <button onClick={handleConfirm} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-[#1E2753] text-white font-bold text-sm hover:bg-[#2d3a8c] transition disabled:opacity-60">
            {saving ? "Menyimpan..." : "Konfirmasi Restock"}
          </button>
        </div>
      </div>
    </div>
  );
}

const LowStockAlert = () => {
  const [products, setProducts] = useState<LowStockProduct[]>([]);
  const [modalProduct, setModalProduct] = useState<LowStockProduct | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe langsung ke Firestore, filter pakai isCriticalStock + isLowStock
    // agar konsisten dengan halaman Monitoring Stok
    const q = query(collection(db, "products"), orderBy("name"));
    const unsubscribe = onSnapshot(q, (snap) => {
      const all: LowStockProduct[] = snap.docs.map((d) => {
        const item = d.data();
        const avgSales: number = item.averageDailySales ?? 0;
        const leadTime: number = item.leadTimeDays ?? 3;
        const reorderPoint: number = item.reorderPoint ?? (avgSales > 0 ? calculateReorderPoint(avgSales, leadTime) : 5);
        return {
          id: d.id,
          name: item.name ?? "",
          stock: item.stock ?? 0,
          reorderPoint,
          averageDailySales: avgSales,
          leadTimeDays: leadTime,
        };
      });

      // Tampilkan produk yang Stok Kritis (≤ 2) ATAU Perlu Restock (≤ ROP)
      // Sama persis logika yang dipakai halaman Monitoring Stok
      const needsAlert = all.filter((p) => isCriticalStock(p.stock) || isLowStock(p.stock, p.reorderPoint));
      setProducts(needsAlert);
    });

    return () => unsubscribe();
  }, []);

  const handleDone = () => {
    if (modalProduct) {
      setSuccessId(modalProduct.id);
      setTimeout(() => setSuccessId(null), 3000);
    }
    setModalProduct(null);
  };

  if (products.length === 0)
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
          <h2 className="text-sm font-bold text-slate-800">Stok Menipis</h2>
        </div>
        <div className="py-6 text-center text-slate-400">
          <svg className="w-8 h-8 mx-auto mb-2 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs font-medium text-emerald-600">Semua stok aman</p>
        </div>
      </div>
    );

  return (
    <>
      {modalProduct && <RestockModal product={modalProduct} onClose={() => setModalProduct(null)} onDone={handleDone} />}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
          <h2 className="text-sm font-bold text-slate-800">Stok Menipis</h2>
          <span className="ml-auto text-xs font-semibold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{products.length} produk</span>
        </div>

        <p className="text-xs text-slate-500 mb-3 leading-relaxed">
          Produk di bawah ini memiliki stok <span className="font-semibold text-slate-700">kritis atau di bawah Reorder Point (ROP)</span>. Klik <span className="font-semibold">Restock</span> untuk menambah stok.
        </p>

        <ul className="space-y-2">
          {products.map((product) => {
            const isCritical = isCriticalStock(product.stock);
            const justRestocked = successId === product.id;

            return (
              <li
                key={product.id}
                className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${justRestocked ? "border-emerald-200 bg-emerald-50" : isCritical ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"}`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-slate-700 truncate">{product.name}</p>
                    {isCritical && !justRestocked && <span className="shrink-0 text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">KRITIS</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <p className={`text-xs font-medium ${justRestocked ? "text-emerald-600" : isCritical ? "text-red-500" : "text-amber-600"}`}>{justRestocked ? "✓ Berhasil direstock" : `Sisa stok: ${product.stock}`}</p>
                    <span className="text-[10px] text-slate-400">ROP: {product.reorderPoint}</span>
                  </div>
                </div>

                <button
                  onClick={() => setModalProduct(product)}
                  className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition ${
                    justRestocked ? "bg-emerald-500 text-white border border-emerald-500" : "bg-white border border-slate-200 text-slate-700 hover:bg-[#1E2753] hover:text-white hover:border-[#1E2753]"
                  }`}
                >
                  {justRestocked ? "✓ Done" : "Restock"}
                </button>
              </li>
            );
          })}
        </ul>

        <a href="/admin/inventory-monitoring" className="mt-4 flex items-center justify-center gap-1 text-xs font-semibold text-[#1E2753] hover:underline">
          Lihat Monitoring Lengkap →
        </a>
      </div>
    </>
  );
};

export default LowStockAlert;
