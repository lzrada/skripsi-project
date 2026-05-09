import { Timestamp } from "firebase/firestore";
import { faMoneyBill, faWallet, faTruck, faCreditCard } from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

export function formatOrderDate(order: any): string {
  let d: Date | null = null;
  if (order.date && typeof order.date === "string") {
    const parsed = new Date(order.date);
    if (!isNaN(parsed.getTime())) d = parsed;
  }
  if (!d && order.createdAt instanceof Timestamp) d = order.createdAt.toDate();
  if (!d && order.createdAt?.seconds) d = new Date(order.createdAt.seconds * 1000);
  if (!d) return "—";
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

const PAYMENT_ICONS: Record<string, IconDefinition> = {
  "Transfer Bank": faMoneyBill,
  "E-Wallet": faWallet,
  COD: faTruck,
  "Kartu Kredit / Debit": faCreditCard,
};

export function getPaymentIcon(method: string): IconDefinition {
  return PAYMENT_ICONS[method] ?? faMoneyBill;
}
