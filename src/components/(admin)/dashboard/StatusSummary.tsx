import { formatPrice } from "@/components/(admin)/dashboard/dashboardHelpers";

interface StatusSummaryProps {
  loading: boolean;
  pendingOrders: number;
  processOrders: number;
  doneOrders: number;
  totalOrders: number;
  totalRevenue: number;
}

export function StatusSummary({ loading, pendingOrders, processOrders, doneOrders, totalOrders, totalRevenue }: StatusSummaryProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h3 className="font-bold text-slate-700 text-sm mb-4">Status Pesanan</h3>
      <div className="space-y-3">
        {[
          { label: "Menunggu Konfirmasi", count: pendingOrders, color: "bg-amber-400", track: "bg-amber-100" },
          { label: "Diproses / Dikirim", count: processOrders, color: "bg-blue-400", track: "bg-blue-100" },
          { label: "Selesai", count: doneOrders, color: "bg-emerald-400", track: "bg-emerald-100" },
          { label: "Total Pesanan", count: totalOrders, color: "bg-slate-400", track: "bg-slate-100" },
        ].map((item) => (
          <div key={item.label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600">{item.label}</span>
              <span className="font-bold text-slate-800">{loading ? "—" : item.count}</span>
            </div>
            <div className={`w-full h-1.5 rounded-full ${item.track}`}>
              <div
                className={`h-1.5 rounded-full ${item.color} transition-all duration-700`}
                style={{
                  width: totalOrders > 0 && !loading ? `${Math.min((item.count / totalOrders) * 100, 100)}%` : "0%",
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-500 mb-1">Total Pendapatan</p>
        <p className="text-xl font-bold text-[#1E2753]">{loading ? "—" : formatPrice(totalRevenue)}</p>
      </div>
    </div>
  );
}
