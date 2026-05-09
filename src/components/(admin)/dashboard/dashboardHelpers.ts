import { Timestamp } from "firebase/firestore";
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

export function formatCompact(price: number): string {
  if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(1)}M`;
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(1)}Jt`;
  if (price >= 1_000) return `${(price / 1_000).toFixed(0)}Rb`;
  return `Rp${price.toLocaleString("id-ID")}`;
}

export function resolveOrderDate(order: any): Date | null {
  if (order.date && typeof order.date === "string") {
    const d = new Date(order.date);
    if (!isNaN(d.getTime())) return d;
  }
  if (order.createdAt instanceof Timestamp) {
    return order.createdAt.toDate();
  }
  if (order.createdAt?.seconds) {
    return new Date(order.createdAt.seconds * 1000);
  }
  return null;
}

export function formatOrderDate(order: any): string {
  const d = resolveOrderDate(order);
  if (!d) return "—";
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}
