import { CartItem } from "@/service/cart.service";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

export function getUidFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  return (
    document.cookie
      .split("; ")
      .find((r) => r.startsWith("uid="))
      ?.split("=")[1] ?? null
  );
}

export function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  return (
    document.cookie
      .split("; ")
      .find((r) => r.startsWith(`${name}=`))
      ?.split("=")[1] ?? null
  );
}

export interface RedirectSuccessParams {
  router: AppRouterInstance;
  orderId: string;
  orderItems: CartItem[];
  subtotal: number;
  total: number;
  diskonKupon: number;
  couponCode: string;
  paymentMethod: string;
  isCod: boolean;
}

export function redirectToSuccess({ router, orderId, orderItems, subtotal, total, diskonKupon, couponCode, paymentMethod, isCod }: RedirectSuccessParams) {
  const itemsParam = encodeURIComponent(
    JSON.stringify(
      orderItems.map((i) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        qty: i.qty,
        image: i.image ?? "",
      })),
    ),
  );

  const q = new URLSearchParams({
    orderId,
    total: String(total),
    subtotal: String(subtotal),
    diskon: String(diskonKupon),
    coupon: couponCode,
    method: paymentMethod,
    isCod: String(isCod),
    items: itemsParam,
  });

  router.replace(`/user/checkout/success?${q.toString()}`);
}
