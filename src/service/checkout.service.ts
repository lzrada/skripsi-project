import { CartItem } from "@/types/cart";
import { createOrderService, CreateOrderPayload } from "./order.service";
import { clearCartService } from "./cart.service";
import { incrementCouponUsageService } from "./coupon.service";
import { createMidtransTransaction, openMidtransSnap } from "./payment.service";

export interface CheckoutAddress {
  nama: string;
  telepon: string;
  alamat: string;
  kota: string;
  kodePos: string;
  catatan: string;
}

export type PaymentMethodId = "transfer" | "kartu" | "ewallet" | "cod";

export interface PaymentMethod {
  id: PaymentMethodId;
  label: string;
  desc: string;
  useMidtrans: boolean;
  midtransType?: "transfer" | "kartu" | "ewallet";
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "transfer", label: "Transfer Bank", desc: "BCA, BRI, BNI, Mandiri", useMidtrans: true, midtransType: "transfer" },
  { id: "kartu", label: "Kartu Kredit / Debit", desc: "Visa, Mastercard", useMidtrans: true, midtransType: "kartu" },
  { id: "ewallet", label: "E-Wallet", desc: "GoPay, OVO, Dana, ShopeePay", useMidtrans: true, midtransType: "ewallet" },
  { id: "cod", label: "Bayar di Tempat (COD)", desc: "Hanya wilayah Blitar & sekitarnya", useMidtrans: false },
];

export interface CheckoutPayload {
  uid: string;
  address: CheckoutAddress;
  paymentMethodId: PaymentMethodId;
  orderItems: CartItem[];
  subtotal: number;
  diskonKupon: number;
  couponCode: string;
  couponId: string;
  userEmail: string;
}

export type CheckoutResult = { status: "success"; orderId: string } | { status: "pending" } | { status: "cancelled" } | { status: "error"; message: string };

export function calculateTotal(subtotal: number, diskonKupon: number): number {
  return Math.max(subtotal - diskonKupon, 0);
}

// FIX: tambahkan image agar tersimpan ke Firestore
export function buildOrderItems(items: CartItem[]) {
  return items.map((i) => ({
    id: i.id,
    name: i.name,
    price: i.price,
    qty: i.qty,
    category: i.category,
    image: i.image ?? "",
  }));
}

async function processCodCheckout(payload: CheckoutPayload): Promise<CheckoutResult> {
  const { uid, address, orderItems, subtotal, diskonKupon, couponCode, couponId } = payload;
  const total = calculateTotal(subtotal, diskonKupon);
  const method = PAYMENT_METHODS.find((m) => m.id === "cod")!;

  const orderId = await createOrderService({
    uid,
    recipientName: address.nama,
    phone: address.telepon,
    address: address.alamat,
    kota: address.kota,
    kodePos: address.kodePos,
    note: address.catatan,
    paymentMethod: method.label,
    items: buildOrderItems(orderItems),
    subtotal, // ← required field
    shippingFee: 0, // ← required field (COD tidak pakai shipping fee dari sini)
    total,
    paymentStatus: "unpaid",
    ...(couponCode ? { couponCode, diskonKupon, couponId } : {}),
  });

  await clearCartService(
    uid,
    orderItems.map((i) => i.id),
  );
  if (couponId && diskonKupon > 0) await incrementCouponUsageService(couponId);

  return { status: "success", orderId };
}

async function processMidtransCheckout(payload: CheckoutPayload): Promise<CheckoutResult> {
  const { uid, address, paymentMethodId, orderItems, subtotal, diskonKupon, couponCode, couponId, userEmail } = payload;
  const total = calculateTotal(subtotal, diskonKupon);
  const method = PAYMENT_METHODS.find((m) => m.id === paymentMethodId)!;

  const { token } = await createMidtransTransaction({
    items: buildOrderItems(orderItems),
    user: { name: address.nama, email: userEmail },
    totalPrice: total,
    paymentType: method.midtransType!,
  });

  const snapResult = await openMidtransSnap(token);

  if (snapResult.status === "close" || snapResult.status === "error") {
    if (snapResult.status === "error") {
      return { status: "error", message: "Pembayaran gagal. Silakan coba lagi." };
    }
    return { status: "cancelled" };
  }

  const paymentStatus = snapResult.status === "success" ? "paid" : "pending";

  const orderId = await createOrderService({
    uid,
    recipientName: address.nama,
    phone: address.telepon,
    address: address.alamat,
    kota: address.kota,
    kodePos: address.kodePos,
    note: address.catatan,
    paymentMethod: method.label,
    items: buildOrderItems(orderItems),
    subtotal, // ← required field
    shippingFee: 0, // ← required field
    total,
    paymentStatus,
    midtransResult: snapResult.result,
    ...(couponCode ? { couponCode, diskonKupon, couponId } : {}),
  });

  if (paymentStatus === "paid") {
    await clearCartService(
      uid,
      orderItems.map((i) => i.id),
    );
    if (couponId && diskonKupon > 0) await incrementCouponUsageService(couponId);
  }

  return snapResult.status === "success" ? { status: "success", orderId } : { status: "pending" };
}

export async function processCheckout(payload: CheckoutPayload): Promise<CheckoutResult> {
  const method = PAYMENT_METHODS.find((m) => m.id === payload.paymentMethodId);
  if (!method) return { status: "error", message: "Metode pembayaran tidak valid." };

  if (method.useMidtrans) {
    return processMidtransCheckout(payload);
  } else {
    return processCodCheckout(payload);
  }
}
