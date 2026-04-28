// src/app/(users-side)/user/checkout/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faExclamationCircle, faTicket } from "@fortawesome/free-solid-svg-icons";

import { subscribeToCartService, clearCartService, CartItem } from "@/service/cart.service";
import { createOrderService } from "@/service/order.service";
import { incrementCouponUsageService } from "@/service/coupon.service";
import { toast } from "@/components/ui/Toast";
import { createMidtransTransaction } from "@/service/payment.service";

import { paymentMethods, PaymentMethod } from "@/components/(user)/checkout/PaymentMethods";
import AddressForm from "@/components/(user)/checkout/AdressForm";
import ShippingInfo from "@/components/(user)/checkout/ShippingInfo";
import PaymentMethodSelector from "@/components/(user)/checkout/PaymentMethodSelector";
import OrderSummary from "@/components/(user)/checkout/OrderSummary";
import ConfirmOrderModal from "@/components/(user)/checkout/ConfirmOrderModal";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

function getUid(): string | null {
  if (typeof document === "undefined") return null;
  return (
    document.cookie
      .split("; ")
      .find((r) => r.startsWith("uid="))
      ?.split("=")[1] ?? null
  );
}

function redirectToSuccess({
  router,
  orderId,
  orderItems,
  subtotal,
  total,
  diskonKupon,
  couponCode,
  paymentMethod,
  isCod,
}: {
  router: ReturnType<typeof useRouter>;
  orderId: string;
  orderItems: CartItem[];
  subtotal: number;
  total: number;
  diskonKupon: number;
  couponCode: string;
  paymentMethod: string;
  isCod: boolean;
}) {
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

// ─── Main Checkout Form ────────────────────────────────────────────────────────

function CheckoutForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const selectedIds = searchParams.get("ids")?.split(",") ?? [];
  const couponCode = searchParams.get("coupon") ?? "";
  const couponId = searchParams.get("couponId") ?? "";
  const diskonKupon = Number(searchParams.get("discount") ?? 0);

  const [uid, setUid] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<CartItem[]>([]);
  const [selectedPayment, setSelectedPayment] = useState("transfer");
  const [showOrderDetail, setShowOrderDetail] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    nama: "",
    telepon: "",
    alamat: "",
    kota: "",
    kodePos: "",
    catatan: "",
  });

  useEffect(() => {
    const u = getUid();
    setUid(u);
    if (!u) return;
    const unsub = subscribeToCartService(u, (items) => {
      const filtered = selectedIds.length > 0 ? items.filter((i) => selectedIds.includes(i.id)) : items;
      setOrderItems(filtered);
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds.join(",")]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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

  // ── COD ────────────────────────────────────────────────────────────────────
  const handleCodOrder = async () => {
    if (!uid) return;
    setLoading(true);
    const snapshot = [...orderItems];
    try {
      const id = await createOrderService({
        uid,
        recipientName: form.nama,
        phone: form.telepon,
        address: form.alamat,
        kota: form.kota,
        kodePos: form.kodePos,
        note: form.catatan,
        paymentMethod: selectedMethod.label,
        items: snapshot.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, category: i.category })),
        total,
        paymentStatus: "unpaid",
        ...(couponCode ? { couponCode, diskonKupon, couponId } : {}),
      });

      await clearCartService(
        uid,
        snapshot.map((i) => i.id),
      );
      if (couponId && diskonKupon > 0) await incrementCouponUsageService(couponId);

      redirectToSuccess({ router, orderId: id, orderItems: snapshot, subtotal, total, diskonKupon, couponCode, paymentMethod: selectedMethod.label, isCod: true });
    } catch (err: any) {
      toast.error(err?.message ?? "Gagal membuat pesanan, coba lagi.");
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  // ── Midtrans ────────────────────────────────────────────────────────────────
  const handleMidtransOrder = async () => {
    if (!uid) return;
    setLoading(true);
    const snapshot = [...orderItems];
    try {
      const midtrans = await createMidtransTransaction({
        items: snapshot,
        user: { name: form.nama, email: "user@email.com" },
        totalPrice: total,
        paymentType: selectedMethod.paymentType,
      });

      if (!window.snap) {
        toast.error("Payment gateway belum siap. Coba refresh halaman.");
        setLoading(false);
        return;
      }

      window.snap.pay(midtrans.token, {
        onSuccess: async (result: any) => {
          // Midtrans hanya panggil onSuccess kalau pembayaran benar-benar berhasil
          const id = await createOrderService({
            uid,
            recipientName: form.nama,
            phone: form.telepon,
            address: form.alamat,
            kota: form.kota,
            kodePos: form.kodePos,
            note: form.catatan,
            paymentMethod: selectedMethod.label,
            items: snapshot.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, category: i.category })),
            total,
            paymentStatus: "paid",
            midtransResult: result,
            ...(couponCode ? { couponCode, diskonKupon, couponId } : {}),
          });

          await clearCartService(
            uid,
            snapshot.map((i) => i.id),
          );
          if (couponId && diskonKupon > 0) await incrementCouponUsageService(couponId);

          redirectToSuccess({ router, orderId: id, orderItems: snapshot, subtotal, total, diskonKupon, couponCode, paymentMethod: selectedMethod.label, isCod: false });
        },
        onPending: async (result: any) => {
          // Pembayaran belum selesai (misal: transfer bank belum dibayar)
          // Tetap buat order dengan status pending supaya admin bisa lihat
          await createOrderService({
            uid,
            recipientName: form.nama,
            phone: form.telepon,
            address: form.alamat,
            kota: form.kota,
            kodePos: form.kodePos,
            note: form.catatan,
            paymentMethod: selectedMethod.label,
            items: snapshot.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, category: i.category })),
            total,
            paymentStatus: "pending",
            midtransResult: result,
            ...(couponCode ? { couponCode, diskonKupon, couponId } : {}),
          });

          await clearCartService(
            uid,
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

  return (
    <>
      {showConfirm && (
        <ConfirmOrderModal
          form={form}
          paymentLabel={selectedMethod.label}
          isCod={isCod}
          orderItems={orderItems}
          subtotal={subtotal}
          diskonKupon={diskonKupon}
          couponCode={couponCode}
          total={total}
          loading={loading}
          onConfirm={handleOrder}
          onClose={() => !loading && setShowConfirm(false)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/user/cart" className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition text-gray-500">
            <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Checkout</h1>
            <p className="text-xs text-gray-400">{orderItems.length} produk dipilih</p>
          </div>
        </div>

        {/* Error Banner */}
        {formError && (
          <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
            <FontAwesomeIcon icon={faExclamationCircle} className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-600 font-medium">{formError}</p>
          </div>
        )}

        {/* Kupon Banner */}
        {couponCode && diskonKupon > 0 && (
          <div className="mb-4 flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
            <FontAwesomeIcon icon={faTicket} className="w-4 h-4 text-green-600 shrink-0" />
            <p className="text-sm text-green-700">
              Kupon <strong>{couponCode}</strong> aktif — hemat <strong>{formatPrice(diskonKupon)}</strong>
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Kiri: Form ── */}
          <div className="lg:col-span-2 space-y-4">
            <AddressForm form={form} formError={formError} onChange={handleInput} />
            <ShippingInfo />
            <PaymentMethodSelector selectedPayment={selectedPayment} onSelect={setSelectedPayment} />
          </div>

          {/* ── Kanan: Ringkasan ── */}
          <div className="space-y-4">
            <OrderSummary
              orderItems={orderItems}
              subtotal={subtotal}
              diskonKupon={diskonKupon}
              couponCode={couponCode}
              total={total}
              isCod={isCod}
              onCheckout={handleCheckoutClick}
              showOrderDetail={showOrderDetail}
              setShowOrderDetail={setShowOrderDetail}
            />

            {/* Trust Badges */}
            <div className="bg-gray-50 rounded-2xl p-3 flex items-center justify-center gap-4 text-center">
              {[
                { icon: "🔒", text: "Transaksi Aman" },
                { icon: "✅", text: "Garansi Toko" },
                { icon: "🚚", text: "Gratis Ongkir" },
              ].map((b) => (
                <div key={b.text} className="flex flex-col items-center gap-1">
                  <span className="text-lg">{b.icon}</span>
                  <span className="text-[10px] font-medium text-gray-500">{b.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutForm />
    </Suspense>
  );
}
