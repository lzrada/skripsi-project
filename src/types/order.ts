import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faClock, faGear, faTruck, faCircleCheck, faCircleXmark } from "@fortawesome/free-solid-svg-icons";

export type OrderStatus = "Menunggu Konfirmasi" | "Diproses" | "Dikirim" | "Selesai" | "Dibatalkan";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  category: string;
}

export interface Order {
  id: string;
  uid: string;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  address: string;
  phone: string;
  recipientName: string;
  note?: string;
  paymentStatus: "pending" | "paid" | "failed";
  midtransResult?: Record<string, unknown>;
}

export const statusConfig: Record<OrderStatus, { label: string; color: string; bg: string; icon: IconDefinition }> = {
  "Menunggu Konfirmasi": { label: "Menunggu Konfirmasi", color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: faClock },
  Diproses: { label: "Diproses", color: "text-blue-600", bg: "bg-blue-50 border-blue-200", icon: faGear },
  Dikirim: { label: "Dikirim", color: "text-purple-600", bg: "bg-purple-50 border-purple-200", icon: faTruck },
  Selesai: { label: "Selesai", color: "text-green-600", bg: "bg-green-50 border-green-200", icon: faCircleCheck },
  Dibatalkan: { label: "Dibatalkan", color: "text-red-500", bg: "bg-red-50 border-red-200", icon: faCircleXmark },
};

export const statusSteps: OrderStatus[] = ["Menunggu Konfirmasi", "Diproses", "Dikirim", "Selesai"];
