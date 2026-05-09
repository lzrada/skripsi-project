import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { type OrderStatus, statusConfig } from "@/types/order";

interface OrderFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  activeTab: OrderStatus | "Semua";
  onTabChange: (tab: OrderStatus | "Semua") => void;
  statuses: (OrderStatus | "Semua")[];
  countByStatus: (status: OrderStatus | "Semua") => number;
}

export function OrderFilterBar({ search, onSearchChange, activeTab, onTabChange, statuses, countByStatus }: OrderFilterBarProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-5 flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <FontAwesomeIcon icon={faSearch} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
        <input
          type="text"
          placeholder="Cari no. pesanan atau nama penerima..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#1E2753] focus:ring-2 focus:ring-[#1E2753]/10 transition"
        />
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {statuses.map((status) => (
          <button
            type="button"
            key={status}
            onClick={() => onTabChange(status)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${activeTab === status ? "bg-[#1E2753] text-white border-[#1E2753]" : "bg-white text-slate-500 border-slate-200 hover:border-[#1E2753]/50"}`}
          >
            {status === "Semua" ? "Semua" : statusConfig[status as OrderStatus].label}
            <span className="opacity-60"> ({countByStatus(status)})</span>
          </button>
        ))}
      </div>
    </div>
  );
}
