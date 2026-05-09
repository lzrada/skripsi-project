"use client";

import { useState } from "react";
import { calculateReorderPoint } from "@/constants/inventory";
import { updateReorderPointService, updateStockParamsService } from "@/service/inventory.service";
import { StockBadge } from "@/components/(admin)/inventory/StockBadge";

interface ProductStock {
  id: string;
  name: string;
  stock: number;
  reorderPoint: number;
  averageDailySales: number;
  leadTimeDays: number;
}

interface EditROPModalProps {
  product: ProductStock;
  onClose: () => void;
  onSaved: () => void;
}

export function EditROPModal({ product, onClose, onSaved }: EditROPModalProps) {
  const [mode, setMode] = useState<"manual" | "auto">("auto");
  const [manualROP, setManualROP] = useState(product.reorderPoint);
  const [avgSales, setAvgSales] = useState(product.averageDailySales || 1);
  const [leadTime, setLeadTime] = useState(product.leadTimeDays || 3);
  const [saving, setSaving] = useState(false);

  const autoROP = calculateReorderPoint(avgSales, leadTime);
  const finalROP = mode === "auto" ? autoROP : manualROP;

  async function handleSave() {
    setSaving(true);
    try {
      if (mode === "auto") {
        await updateStockParamsService(product.id, {
          averageDailySales: avgSales,
          leadTimeDays: leadTime,
        });
      } else {
        await updateReorderPointService(product.id, manualROP);
      }
      onSaved();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Atur Reorder Point</h3>
            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">{product.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold leading-none">
            ×
          </button>
        </div>

        {/* Info stok saat ini */}
        <div className="bg-slate-50 rounded-xl p-3 mb-5 flex gap-4 text-sm">
          <div className="text-center flex-1">
            <p className="text-slate-400 text-xs">Stok Sekarang</p>
            <p className="font-bold text-slate-800 text-lg">{product.stock}</p>
          </div>
          <div className="text-center flex-1">
            <p className="text-slate-400 text-xs">ROP Saat Ini</p>
            <p className="font-bold text-amber-600 text-lg">{product.reorderPoint}</p>
          </div>
          <div className="text-center flex-1">
            <p className="text-slate-400 text-xs">Status</p>
            <StockBadge stock={product.stock} rop={product.reorderPoint} />
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex rounded-xl border border-slate-200 overflow-hidden mb-5">
          <button onClick={() => setMode("auto")} className={`flex-1 py-2 text-sm font-semibold transition ${mode === "auto" ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}>
            Hitung Otomatis
          </button>
          <button onClick={() => setMode("manual")} className={`flex-1 py-2 text-sm font-semibold transition ${mode === "manual" ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}>
            Input Manual
          </button>
        </div>

        {mode === "auto" ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 bg-blue-50 border border-blue-100 rounded-lg p-3">
              <span className="font-semibold text-blue-700">Rumus ROP:</span> Rata-rata Penjualan Harian × Lead Time
            </p>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Rata-rata Penjualan Harian (unit)</label>
              <input type="number" min={0} value={avgSales} onChange={(e) => setAvgSales(Number(e.target.value))} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Lead Time (hari pengiriman dari supplier)</label>
              <input type="number" min={1} value={leadTime} onChange={(e) => setLeadTime(Number(e.target.value))} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
              <p className="text-xs text-amber-600">Hasil Perhitungan ROP</p>
              <p className="text-2xl font-black text-amber-700 mt-1">{autoROP} unit</p>
              <p className="text-xs text-amber-500 mt-0.5">
                {avgSales} × {leadTime} = {autoROP}
              </p>
            </div>
          </div>
        ) : (
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Nilai Reorder Point (unit)</label>
            <input type="number" min={0} value={manualROP} onChange={(e) => setManualROP(Number(e.target.value))} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <p className="text-xs text-slate-400 mt-2">Sistem akan memberi notifikasi saat stok ≤ {manualROP} unit.</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
            Batal
          </button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50">
            {saving ? "Menyimpan..." : `Simpan ROP = ${finalROP}`}
          </button>
        </div>
      </div>
    </div>
  );
}
