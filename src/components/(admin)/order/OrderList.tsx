import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxOpen } from "@fortawesome/free-solid-svg-icons";
import { type Order, type OrderStatus } from "@/types/order";
import { OrderRow } from "@/components/(admin)/order/OrderRow";

interface OrderListProps {
  orders: Order[];
  loading: boolean;
  search: string;
  onStatusChange: (id: string, status: OrderStatus) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
  onClearSearch: () => void;
}

export function OrderList({ orders, loading, search, onStatusChange, onCancel, onClearSearch }: OrderListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, index) => (
          <SkeletonOrder key={index} />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 py-20 text-center">
        <FontAwesomeIcon icon={faBoxOpen} className="text-5xl mb-3 text-slate-200" />
        <p className="font-semibold text-slate-500">{search ? "Pesanan tidak ditemukan" : "Belum ada pesanan"}</p>
        {search && (
          <button type="button" onClick={onClearSearch} className="mt-3 text-xs text-[#1E2753] font-semibold hover:underline">
            Hapus pencarian
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <OrderRow key={order.id} order={order} onStatusChange={onStatusChange} onCancel={onCancel} />
      ))}
    </div>
  );
}

function SkeletonOrder() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 animate-pulse">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-slate-200 rounded" />
          <div>
            <div className="w-24 h-4 bg-slate-200 rounded mb-1.5" />
            <div className="w-40 h-3 bg-slate-100 rounded" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-28 h-7 bg-slate-100 rounded-full" />
          <div className="w-20 h-5 bg-slate-200 rounded" />
          <div className="w-24 h-8 bg-slate-100 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
