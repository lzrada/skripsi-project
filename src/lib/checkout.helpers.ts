import { CartItem } from "@/types/cart";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { formatPrice, getCookieValue, getUidFromCookie } from "@/lib/format";

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
  // Simpan data order ke sessionStorage agar URL tidak terlalu panjang (mencegah 404)
  const successData = {
    orderId,
    total,
    subtotal,
    diskonKupon,
    couponCode,
    paymentMethod,
    isCod,
    items: orderItems.map((i) => ({
      id: i.id,
      name: i.name,
      price: i.price,
      qty: i.qty,
      image: i.image ?? "",
    })),
  };

  sessionStorage.setItem("checkout_success", JSON.stringify(successData));
  router.replace(`/user/checkout/success?orderId=${orderId}`);
}
