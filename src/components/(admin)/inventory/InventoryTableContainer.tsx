import { InventoryDesktopTable } from "@/components/(admin)/inventory/InventoryDesktopTable";
import { InventoryMobileCards } from "@/components/(admin)/inventory/InventoryMobileCards";

interface ProductStock {
  id: string;
  name: string;
  category: string;
  stock: number;
  reorderPoint: number;
  averageDailySales: number;
  leadTimeDays: number;
  price: number;
  lastRestockedAt?: string;
}

interface InventoryTableContainerProps {
  filtered: ProductStock[];
  onEditROP: (product: ProductStock) => void;
  onRestock: (product: ProductStock) => void;
  restockingId: string | null;
}

export function InventoryTableContainer({ filtered, onEditROP, onRestock, restockingId }: InventoryTableContainerProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <InventoryDesktopTable filtered={filtered} onEditROP={onEditROP} onRestock={onRestock} restockingId={restockingId} />
      <InventoryMobileCards filtered={filtered} onEditROP={onEditROP} onRestock={onRestock} restockingId={restockingId} />
    </div>
  );
}
