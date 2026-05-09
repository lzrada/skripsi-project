import ChartLine from "@/components/(admin)/ui/ChartLine";
import { StatusSummary } from "@/components/(admin)/dashboard/StatusSummary";

interface ChartAndStatusSectionProps {
  loading: boolean;
  pendingOrders: number;
  processOrders: number;
  doneOrders: number;
  totalOrders: number;
  totalRevenue: number;
}

export function ChartAndStatusSection({ loading, pendingOrders, processOrders, doneOrders, totalOrders, totalRevenue }: ChartAndStatusSectionProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 mb-5">
      <div className="xl:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <ChartLine />
      </div>
      <StatusSummary loading={loading} pendingOrders={pendingOrders} processOrders={processOrders} doneOrders={doneOrders} totalOrders={totalOrders} totalRevenue={totalRevenue} />
    </div>
  );
}
