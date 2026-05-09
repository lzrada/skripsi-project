import { FaSearch } from "react-icons/fa";

interface ProductFilterBarProps {
  search: string;
  categoryFilter: string;
  categories: string[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

export function ProductFilterBar({ search, categoryFilter, categories, onSearchChange, onCategoryChange }: ProductFilterBarProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-5 flex flex-col md:flex-row gap-3">
      <div className="relative flex-1">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
        <input
          type="text"
          value={search}
          placeholder="Cari nama atau kategori..."
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#1E2753] focus:ring-2 focus:ring-[#1E2753]/10 transition"
        />
      </div>
      <div className="flex gap-2 flex-wrap">
        {categories.map((category) => (
          <button
            type="button"
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${categoryFilter === category ? "bg-[#1E2753] text-white border-[#1E2753]" : "bg-white text-slate-500 border-slate-200 hover:border-[#1E2753]/50"}`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}
