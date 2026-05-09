import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faGear, faTruck, faCircleCheck, faCircleXmark, faBoxOpen } from "@fortawesome/free-solid-svg-icons";
import { type OrderStatus, statusConfig } from "@/types/order";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

const STATUS_ICON: Record<string, IconDefinition> = {
  "Menunggu Konfirmasi": faClock,
  Diproses: faGear,
  Dikirim: faTruck,
  Selesai: faCircleCheck,
  Dibatalkan: faCircleXmark,
};

interface OrderStatsCardProps {
  statuses: OrderStatus[];
  activeTab: OrderStatus | "Semua";
  onTabChange: (status: OrderStatus) => void;
  countByStatus: (status: OrderStatus) => number;
  loading: boolean;
}

export function OrderStatsCard({ statuses, activeTab, onTabChange, countByStatus, loading }: OrderStatsCardProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {statuses.map((status) => {
        const config = statusConfig[status];
        const count = countByStatus(status);
        return (
          <button
            key={status}
            type="button"
            onClick={() => onTabChange(status)}
            className={`text-left bg-white rounded-2xl border p-4 shadow-sm hover:shadow-md transition-all ${activeTab === status ? "border-[#1E2753] ring-2 ring-[#1E2753]/10" : "border-slate-200"}`}
          >
            <div className="flex items-center justify-between mb-2">
              <FontAwesomeIcon icon={STATUS_ICON[status] ?? faBoxOpen} className={`w-4 h-4 ${config.color}`} />
              {count > 0 && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${config.bg} ${config.color}`}>{count}</span>}
            </div>
            <p className="text-xl font-black text-slate-800">{loading ? "—" : count}</p>
            <p className={`text-[10px] font-semibold mt-0.5 ${config.color}`}>{config.label}</p>
          </button>
        );
      })}
    </div>
  );
}
