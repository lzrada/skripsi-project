// src/lib/checkout.helpers.ts
// ✅ Tidak lagi mendefinisikan formatPrice / getCookieValue sendiri
// Semua diimpor dari @/lib/format

import { CartItem } from "@/service/cart.service";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { formatPrice, getCookieValue, getUidFromCookie } from "@/lib/format";

// Re-export agar komponen lama yang import dari sini tetap bekerja tanpa ubah import
export { formatPrice, getCookieValue, getUidFromCookie };

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
