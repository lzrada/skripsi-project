import Link from "next/link";
import { formatPrice, formatOrderDate } from "@/components/(admin)/dashboard/dashboardHelpers";

const statusBadge: Record<string, { bg: string; text: string; dot: string }> = {
  "Menunggu Konfirmasi": { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  Diproses: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
  Dikirim: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-400" },
  Selesai: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400" },
  Dibatalkan: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-400" },
};

interface RecentOrdersSectionProps {
  loading: boolean;
  recentOrders: any[];
}

export function RecentOrdersSection({ loading, recentOrders }: RecentOrdersSectionProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-5">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-slate-800">Pesanan Terbaru</h3>
        <Link href="/admin/orders-management" className="text-xs font-semibold text-[#1E2753] hover:underline">
          Lihat Semua →
        </Link>
      </div>

      {loading ? (
        <div className="p-6 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : recentOrders.length === 0 ? (
        <div className="py-16 text-center text-slate-400">
          <svg className="w-10 h-10 mx-auto mb-2 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <p className="text-sm">Belum ada pesanan masuk</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          {recentOrders.map((order) => {
            const s = statusBadge[order.status] ?? statusBadge["Menunggu Konfirmasi"];
            const shortStatus = order.status === "Menunggu Konfirmasi" ? "Menunggu" : order.status;

            return (
              <Link key={order.id} href="/admin/orders-management" className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-700">#{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-xs text-slate-400 truncate">{order.recipientName ?? "—"}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-slate-800">{formatPrice(order.total ?? 0)}</p>
                  <p className="text-xs text-slate-400">{formatOrderDate(order)}</p>
                </div>
                <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${s.bg} ${s.text} shrink-0`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                  {shortStatus}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
