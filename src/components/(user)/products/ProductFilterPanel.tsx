"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const CATEGORIES = ["Televisi", "Kulkas", "AC", "Mesin Cuci", "Kipas Angin", "Audio", "Laptop", "HP"];

export const PRICE_RANGES = [
  { label: "Semua Harga", min: 0, max: Infinity },
  { label: "< Rp 500.000", min: 0, max: 500000 },
  { label: "Rp 500rb – 1jt", min: 500000, max: 1000000 },
  { label: "Rp 1jt – 3jt", min: 1000000, max: 3000000 },
  { label: "Rp 3jt – 5jt", min: 3000000, max: 5000000 },
  { label: "> Rp 5jt", min: 5000000, max: Infinity },
];

interface Props {
  activeCategory: string;
  priceRange: number;
  conditionFilter: "semua" | "baru" | "bekas";
  onCategoryChange: (cat: string) => void;
  onPriceChange: (idx: number) => void;
  onConditionChange: (c: "semua" | "baru" | "bekas") => void;
  onReset: () => void;
  hasFilter: boolean;
}

export default function ProductFilterPanel({ activeCategory, priceRange, conditionFilter, onCategoryChange, onPriceChange, onConditionChange, onReset, hasFilter }: Props) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-5 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Kategori */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Kategori</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onCategoryChange("")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${!activeCategory ? "bg-[#1E2753] text-white border-[#1E2753]" : "bg-white text-gray-600 border-gray-200 hover:border-[#1E2753]"}`}
            >
              Semua
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat === activeCategory ? "" : cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${activeCategory === cat ? "bg-[#1E2753] text-white border-[#1E2753]" : "bg-white text-gray-600 border-gray-200 hover:border-[#1E2753]"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Harga */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Rentang Harga</p>
          <div className="flex flex-col gap-2">
            {PRICE_RANGES.map((range, idx) => (
              <button
                key={range.label}
                onClick={() => onPriceChange(idx)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all ${priceRange === idx ? "bg-[#1E2753] text-white border-[#1E2753]" : "bg-white text-gray-600 border-gray-200 hover:border-[#1E2753]"}`}
              >
                <span className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${priceRange === idx ? "bg-white border-white" : "border-gray-300"}`} />
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Kondisi */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Kondisi Barang</p>
          <div className="flex flex-col gap-2">
            {(["semua", "baru", "bekas"] as const).map((c) => (
              <button
                key={c}
                onClick={() => onConditionChange(c)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all capitalize ${conditionFilter === c ? "bg-[#1E2753] text-white border-[#1E2753]" : "bg-white text-gray-600 border-gray-200 hover:border-[#1E2753]"}`}
              >
                <span className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${conditionFilter === c ? "bg-white border-white" : "border-gray-300"}`} />
                {c === "semua" ? "Semua Kondisi" : c === "baru" ? "Baru" : "Bekas / Second"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {hasFilter && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
          <button onClick={onReset} className="flex items-center gap-1.5 px-3 py-2 bg-red-50 border border-red-100 rounded-xl text-xs font-medium text-red-500 hover:bg-red-100 transition-all">
            <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
            Reset Semua Filter
          </button>
        </div>
      )}
    </div>
  );
}
