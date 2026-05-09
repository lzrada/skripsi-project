interface StatCard {
  label: string;
  value: number;
  color: "blue" | "red" | "amber" | "green";
  icon: string;
  onClick: () => void;
  active: boolean;
}

function StatCardComponent({ label, value, color, icon, onClick, active }: StatCard) {
  const colorMap = {
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    red: "border-red-200 bg-red-50 text-red-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    green: "border-green-200 bg-green-50 text-green-700",
  };
  const activeRing = {
    blue: "ring-2 ring-blue-400",
    red: "ring-2 ring-red-400",
    amber: "ring-2 ring-amber-400",
    green: "ring-2 ring-green-400",
  };

  return (
    <button onClick={onClick} className={`bg-white rounded-2xl border p-4 text-left transition shadow-sm hover:shadow-md ${colorMap[color]} ${active ? activeRing[color] : "border-slate-200"}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xl">{icon}</span>
        {active && <span className="w-2 h-2 rounded-full bg-current opacity-60" />}
      </div>
      <p className="text-2xl font-black">{value}</p>
      <p className="text-xs font-medium opacity-70 mt-0.5">{label}</p>
    </button>
  );
}

interface InventoryStatsCardsProps {
  total: number;
  kritis: number;
  restock: number;
  aman: number;
  filter: "semua" | "kritis" | "restock" | "aman";
  onFilterChange: (filter: "semua" | "kritis" | "restock" | "aman") => void;
}

export function InventoryStatsCards({ total, kritis, restock, aman, filter, onFilterChange }: InventoryStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCardComponent label="Total Produk" value={total} color="blue" icon="📦" onClick={() => onFilterChange("semua")} active={filter === "semua"} />
      <StatCardComponent label="Stok Kritis" value={kritis} color="red" icon="🚨" onClick={() => onFilterChange("kritis")} active={filter === "kritis"} />
      <StatCardComponent label="Perlu Restock" value={restock} color="amber" icon="⚠️" onClick={() => onFilterChange("restock")} active={filter === "restock"} />
      <StatCardComponent label="Stok Aman" value={aman} color="green" icon="✅" onClick={() => onFilterChange("aman")} active={filter === "aman"} />
    </div>
  );
}
