"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { subscribeToCartService, clearCartService, CartItem } from "@/service/cart.service";
import { createOrderService } from "@/service/order.service";
import { incrementCouponUsageService } from "@/service/coupon.service";
import { createMidtransTransaction } from "@/service/payment.service";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { paymentMethods, PaymentMethod } from "@/components/(user)/checkout/PaymentMethods";
import { toast } from "@/components/(user)/ui/Toast";
import { getUidFromCookie, redirectToSuccess } from "@/lib/checkout.helpers";

export interface CheckoutForm {
  nama: string;
  telepon: string;
  alamat: string;
  kota: string;
  kodePos: string;
  catatan: string;
}

export function useCheckout(selectedIds: string[], couponCode: string, couponId: string, diskonKupon: number) {
  const router = useRouter();

  const [uid, setUid] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [orderItems, setOrderItems] = useState<CartItem[]>([]);
  const [selectedPayment, setSelectedPayment] = useState("transfer");
  const [showOrderDetail, setShowOrderDetail] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState<CheckoutForm>({
    nama: "",
    telepon: "",
    alamat: "",
    kota: "",
    kodePos: "",
    catatan: "",
  });

  // ── Init uid + email + cart ──────────────────────────────────────────────
  useEffect(() => {
    const u = getUidFromCookie();
    setUid(u);
    if (!u) return;

    getCurrentUser(u).then((user) => {
      if (user?.email) setUserEmail(user.email);
    });

    const unsub = subscribeToCartService(u, (items) => {
      const filtered = selectedIds.length > 0 ? items.filter((i) => selectedIds.includes(i.id)) : items;
      setOrderItems(filtered);
    });

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds.join(",")]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError("");
  };

  const subtotal = orderItems.reduce((acc, i) => acc + i.price * i.qty, 0);
  const total = Math.max(subtotal - diskonKupon, 0);
  const selectedMethod = paymentMethods.find((p) => p.id === selectedPayment) as PaymentMethod;
  const isCod = !selectedMethod.useMidtrans;

  const handleCheckoutClick = () => {
    if (!form.nama.trim()) return setFormError("Nama lengkap wajib diisi.");
    if (!form.telepon.trim()) return setFormError("Nomor telepon wajib diisi.");
    if (!form.alamat.trim()) return setFormError("Alamat lengkap wajib diisi.");
    if (!uid) {
      window.location.href = "/login";
      return;
    }
    setFormError("");
    setShowConfirm(true);
  };

  // ── Shared: build order items ────────────────────────────────────────────
  const buildItems = (snapshot: CartItem[]) => snapshot.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, category: i.category }));

  const buildOrderBase = (snapshot: CartItem[]) => ({
    uid: uid!,
    recipientName: form.nama,
    phone: form.telepon,
    address: form.alamat,
    kota: form.kota,
    kodePos: form.kodePos,
    note: form.catatan,
    paymentMethod: selectedMethod.label,
    items: buildItems(snapshot),
    total,
    ...(couponCode ? { couponCode, diskonKupon, couponId } : {}),
  });

  const afterSuccess = async (snapshot: CartItem[], orderId: string, isCodOrder: boolean) => {
    await clearCartService(
      uid!,
      snapshot.map((i) => i.id),
    );
    if (couponId && diskonKupon > 0) await incrementCouponUsageService(couponId);
    redirectToSuccess({
      router,
      orderId,
      orderItems: snapshot,
      subtotal,
      total,
      diskonKupon,
      couponCode,
      paymentMethod: selectedMethod.label,
      isCod: isCodOrder,
    });
  };

  // ── COD ──────────────────────────────────────────────────────────────────
  const handleCodOrder = async () => {
    if (!uid) return;
    setLoading(true);
    const snapshot = [...orderItems];
    try {
      const id = await createOrderService({ ...buildOrderBase(snapshot), paymentStatus: "unpaid" });
      await afterSuccess(snapshot, id, true);
    } catch (err: any) {
      toast.error(err?.message ?? "Gagal membuat pesanan, coba lagi.");
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  // ── Midtrans ─────────────────────────────────────────────────────────────
  const handleMidtransOrder = async () => {
    if (!uid) return;
    setLoading(true);
    const snapshot = [...orderItems];
    try {
      const { token } = await createMidtransTransaction({
        items: buildItems(snapshot),
        user: { name: form.nama, email: userEmail || "pelanggan@rizky-elektronik.com" },
        totalPrice: total,
        paymentType: selectedMethod.paymentType,
      });

      if (!window.snap) {
        toast.error("Payment gateway belum siap. Coba refresh halaman.");
        setLoading(false);
        return;
      }

      window.snap.pay(token, {
        onSuccess: async (result: any) => {
          const id = await createOrderService({
            ...buildOrderBase(snapshot),
            paymentStatus: "paid",
            midtransResult: result,
          });
          await afterSuccess(snapshot, id, false);
        },
        onPending: async (result: any) => {
          await createOrderService({
            ...buildOrderBase(snapshot),
            paymentStatus: "pending",
            midtransResult: result,
          });
          await clearCartService(
            uid!,
            snapshot.map((i) => i.id),
          );
          if (couponId && diskonKupon > 0) await incrementCouponUsageService(couponId);
          setShowConfirm(false);
          toast.info("Pembayaran pending. Selesaikan pembayaran sebelum batas waktu.");
        },
        onError: (err: any) => {
          console.error(err);
          toast.error("Pembayaran gagal. Silakan coba lagi.");
        },
        onClose: () => {
          toast.info("Kamu menutup jendela pembayaran.");
          setLoading(false);
        },
      });
    } catch (err) {
      console.error(err);
      setFormError("Gagal memproses pembayaran. Coba lagi.");
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = () => {
    if (isCod) handleCodOrder();
    else handleMidtransOrder();
  };

  return {
    uid,
    form,
    formError,
    orderItems,
    selectedPayment,
    setSelectedPayment,
    showOrderDetail,
    setShowOrderDetail,
    loading,
    showConfirm,
    setShowConfirm,
    subtotal,
    total,
    selectedMethod,
    isCod,
    handleInput,
    handleCheckoutClick,
    handleOrder,
  };
}
