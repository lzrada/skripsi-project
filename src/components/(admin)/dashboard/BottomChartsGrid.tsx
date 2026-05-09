import LowStockAlert from "@/components/(admin)/ui/LowStockAlert";
import CategoryBreakdown from "@/components/(admin)/ui/CategoryBreakdown";
import TopProductsChart from "@/components/(admin)/ui/TopProductChart";

export function BottomChartsGrid() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
      <LowStockAlert />
      <CategoryBreakdown />
      <TopProductsChart />
    </div>
  );
}
