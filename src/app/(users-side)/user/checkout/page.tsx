// src/app/(users-side)/user/checkout/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faLocationDot,
  faTruck,
  faShield,
  faMoneyBill,
  faCreditCard,
  faWallet,
  faChevronDown,
  faChevronUp,
  faExclamationCircle,
  faBoxOpen,
  faUser,
  faPhone,
  faMapMarkerAlt,
  faTicket,
  faLock,
  faHandHoldingDollar,
} from "@fortawesome/free-solid-svg-icons";
import { subscribeToCartService, clearCartService, CartItem } from "@/service/cart.service";
import { createOrderService } from "@/service/order.service";
import { incrementCouponUsageService } from "@/service/coupon.service";
import { toast } from "@/components/ui/Toast";
import { createMidtransTransaction } from "@/service/payment.service";

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

const paymentMethods = [
  {
    id: "transfer",
    label: "Transfer Bank",
    desc: "BCA, BRI, BNI, Mandiri",
    icon: faMoneyBill,
    color: "text-blue-500",
    bg: "bg-blue-50",
    useMidtrans: true,
    paymentType: "transfer" as const,
  },
  {
    id: "kartu",
    label: "Kartu Kredit / Debit",
    desc: "Visa, Mastercard",
    icon: faCreditCard,
    color: "text-purple-500",
    bg: "bg-purple-50",
    useMidtrans: true,
    paymentType: "kartu" as const,
  },
  {
    id: "ewallet",
    label: "E-Wallet",
    desc: "GoPay, OVO, Dana, ShopeePay",
    icon: faWallet,
    color: "text-green-500",
    bg: "bg-green-50",
    useMidtrans: true,
    paymentType: "ewallet" as const,
  },
  {
    id: "cod",
    label: "Bayar di Tempat (COD)",
    desc: "Hanya wilayah Blitar & sekitarnya",
    icon: faHandHoldingDollar,
    color: "text-orange-500",
    bg: "bg-orange-50",
    useMidtrans: false,
    paymentType: undefined,
  },
];

// ─── Helper: redirect ke halaman sukses dengan semua data di URL ──────────────
function redirectToSuccess({
  router,
  orderId,
  orderItems, // snapshot SEBELUM cart di-clear
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

// ─── Confirm Modal ─────────────────────────────────────────────────────────────

interface ConfirmOrderModalProps {
  form: { nama: string; telepon: string; alamat: string; kota: string; kodePos: string; catatan: string };
  paymentLabel: string;
  isCod: boolean;
  orderItems: CartItem[];
  subtotal: number;
  diskonKupon: number;
  couponCode: string;
  total: number;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmOrderModal({ form, paymentLabel, isCod, orderItems, subtotal, diskonKupon, couponCode, total, loading, onConfirm, onClose }: ConfirmOrderModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4" onClick={onClose}>
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="bg-[#1E2753] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <FontAwesomeIcon icon={faBoxOpen} className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base">Konfirmasi Pesanan</h3>
              <p className="text-white/60 text-xs">Periksa kembali sebelum memesan</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-3">
          {/* Alamat */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Alamat Pengiriman</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faUser} className="w-3.5 h-3.5 text-[#1E2753] shrink-0" />
                <span className="text-sm font-semibold text-gray-800">{form.nama}</span>
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faPhone} className="w-3.5 h-3.5 text-[#1E2753] shrink-0" />
                <span className="text-sm text-gray-600">{form.telepon}</span>
              </div>
              <div className="flex items-start gap-2">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="w-3.5 h-3.5 text-[#E85D04] shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600">
                  {form.alamat}
                  {form.kota && `, ${form.kota}`}
                  {form.kodePos && ` ${form.kodePos}`}
                </span>
              </div>
              {form.catatan && <p className="text-xs text-gray-400 italic mt-1 pl-5">📝 {form.catatan}</p>}
            </div>
          </div>

          {/* Produk */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Produk ({orderItems.length})</p>
            <div className="space-y-2.5">
              {orderItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-400">
                      x{item.qty} · {formatPrice(item.price)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-[#1E2753] shrink-0">{formatPrice(item.price * item.qty)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Rincian harga */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Metode Bayar</span>
              <span className="font-semibold text-gray-800">{paymentLabel}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium text-gray-700">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Ongkos Kirim</span>
              <span className="font-semibold text-green-600">Gratis</span>
            </div>
            {diskonKupon > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Diskon {couponCode && <span className="font-semibold text-green-600">({couponCode})</span>}</span>
                <span className="font-semibold text-red-500">-{formatPrice(diskonKupon)}</span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
              <span className="text-sm font-bold text-gray-800">Total</span>
              <span className="text-lg font-bold text-[#1E2753]">{formatPrice(total)}</span>
            </div>
          </div>

          {isCod ? (
            <div className="flex items-start gap-2 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2.5">
              <FontAwesomeIcon icon={faHandHoldingDollar} className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
              <p className="text-xs text-orange-700">
                Pembayaran dilakukan langsung saat barang tiba. Siapkan uang pas sebesar <strong>{formatPrice(total)}</strong>.
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
              <FontAwesomeIcon icon={faLock} className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">Kamu akan diarahkan ke halaman pembayaran aman Midtrans setelah mengkonfirmasi.</p>
            </div>
          )}

          <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
            <FontAwesomeIcon icon={faExclamationCircle} className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">Pastikan data sudah benar. Pesanan yang dibuat tidak bisa diubah.</p>
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} disabled={loading} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition disabled:opacity-50">
              Cek Lagi
            </button>
            <button onClick={onConfirm} disabled={loading} className="flex-1 py-3 rounded-2xl bg-[#1E2753] text-white font-bold text-sm hover:bg-[#2a3470] disabled:opacity-60 transition">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Memproses...
                </span>
              ) : isCod ? (
                "Ya, Buat Pesanan!"
              ) : (
                "Lanjut Bayar →"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Checkout Form ─────────────────────────────────────────────────────────────

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

  const selectedMethod = paymentMethods.find((p) => p.id === selectedPayment)!;
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

  // ── COD ──────────────────────────────────────────────────────────────────
  const handleCodOrder = async () => {
    if (!uid) return;
    setLoading(true);

    // ⚡ Simpan snapshot SEBELUM cart di-clear
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
        items: snapshot.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          qty: i.qty,
          category: i.category,
        })),
        total,
        paymentStatus: "unpaid",
        ...(couponCode ? { couponCode, diskonKupon, couponId } : {}),
      });

      await clearCartService(
        uid,
        snapshot.map((i) => i.id),
      );
      if (couponId && diskonKupon > 0) await incrementCouponUsageService(couponId);

      // Redirect ke halaman sukses dengan semua data
      redirectToSuccess({
        router,
        orderId: id,
        orderItems: snapshot,
        subtotal,
        total,
        diskonKupon,
        couponCode,
        paymentMethod: selectedMethod.label,
        isCod: true,
      });
    } catch (err: any) {
      toast.error(err?.message ?? "Gagal membuat pesanan, coba lagi.");
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  // ── Midtrans ──────────────────────────────────────────────────────────────
  const handleMidtransOrder = async () => {
    if (!uid) return;
    setLoading(true);

    // ⚡ Simpan snapshot SEBELUM cart di-clear
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
          const id = await createOrderService({
            uid,
            recipientName: form.nama,
            phone: form.telepon,
            address: form.alamat,
            kota: form.kota,
            kodePos: form.kodePos,
            note: form.catatan,
            paymentMethod: selectedMethod.label,
            items: snapshot.map((i) => ({
              id: i.id,
              name: i.name,
              price: i.price,
              qty: i.qty,
              category: i.category,
            })),
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

          redirectToSuccess({
            router,
            orderId: id,
            orderItems: snapshot,
            subtotal,
            total,
            diskonKupon,
            couponCode,
            paymentMethod: selectedMethod.label,
            isCod: false,
          });
        },
        onPending: async (result: any) => {
          await createOrderService({
            uid,
            recipientName: form.nama,
            phone: form.telepon,
            address: form.alamat,
            kota: form.kota,
            kodePos: form.kodePos,
            note: form.catatan,
            paymentMethod: selectedMethod.label,
            items: snapshot.map((i) => ({
              id: i.id,
              name: i.name,
              price: i.price,
              qty: i.qty,
              category: i.category,
            })),
            total,
            paymentStatus: "pending",
            midtransResult: result,
            ...(couponCode ? { couponCode, diskonKupon, couponId } : {}),
          });
          setShowConfirm(false);
          toast.info("Pembayaran pending. Selesaikan sebelum batas waktu.");
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

  // ─── Main Form ─────────────────────────────────────────────────────────────
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

        {formError && (
          <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
            <FontAwesomeIcon icon={faExclamationCircle} className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-600 font-medium">{formError}</p>
          </div>
        )}

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
            {/* Alamat */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                  <FontAwesomeIcon icon={faLocationDot} className="w-3.5 h-3.5 text-[#E85D04]" />
                </div>
                <p className="text-sm font-bold text-gray-800">Alamat Pengiriman</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { name: "nama", label: "Nama Lengkap", placeholder: "Nama penerima", required: true, type: "text", span: false },
                  { name: "telepon", label: "No. Telepon", placeholder: "08xx-xxxx-xxxx", required: true, type: "tel", span: false },
                  { name: "alamat", label: "Alamat Lengkap", placeholder: "Nama jalan, No. rumah, RT/RW, Kelurahan", required: true, type: "text", span: true },
                  { name: "kota", label: "Kota / Kabupaten", placeholder: "Contoh: Blitar", required: false, type: "text", span: false },
                  { name: "kodePos", label: "Kode Pos", placeholder: "66181", required: false, type: "text", span: false },
                ].map((f) => (
                  <div key={f.name} className={f.span ? "sm:col-span-2" : ""}>
                    <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                      {f.label} {f.required && <span className="text-red-400">*</span>}
                    </label>
                    <input
                      type={f.type}
                      name={f.name}
                      value={(form as any)[f.name]}
                      onChange={handleInput}
                      placeholder={f.placeholder}
                      className={`w-full border-2 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none transition ${
                        formError && f.required && !(form as any)[f.name].trim() ? "border-red-300 focus:border-red-500 bg-red-50" : "border-gray-100 bg-gray-50 focus:border-[#1E2753] focus:bg-white"
                      }`}
                    />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Catatan (opsional)</label>
                  <textarea
                    name="catatan"
                    value={form.catatan}
                    onChange={handleInput}
                    placeholder="Contoh: Titip di depan pagar, hubungi dulu sebelum antar"
                    rows={2}
                    className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#1E2753] focus:bg-white transition resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Pengiriman */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                  <FontAwesomeIcon icon={faTruck} className="w-3.5 h-3.5 text-[#1E2753]" />
                </div>
                <p className="text-sm font-bold text-gray-800">Metode Pengiriman</p>
              </div>
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3.5">
                <div>
                  <p className="text-sm font-semibold text-green-700">Pengiriman Toko</p>
                  <p className="text-xs text-green-600 mt-0.5">Estimasi 1–2 hari · Wilayah Blitar & sekitarnya</p>
                </div>
                <span className="text-sm font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">GRATIS</span>
              </div>
            </div>

            {/* Metode Pembayaran */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <FontAwesomeIcon icon={faShield} className="w-3.5 h-3.5 text-[#1E2753]" />
                </div>
                <p className="text-sm font-bold text-gray-800">Metode Pembayaran</p>
              </div>
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${selectedPayment === method.id ? "border-[#1E2753] bg-[#1E2753]/5" : "border-gray-100 hover:border-gray-200 bg-white"}`}
                  >
                    <input type="radio" name="payment" value={method.id} checked={selectedPayment === method.id} onChange={() => setSelectedPayment(method.id)} className="accent-[#1E2753]" />
                    <div className={`w-9 h-9 rounded-xl ${method.bg} flex items-center justify-center shrink-0`}>
                      <FontAwesomeIcon icon={method.icon} className={`w-4 h-4 ${method.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{method.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{method.desc}</p>
                    </div>
                    {!method.useMidtrans && <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full shrink-0">COD</span>}
                    {method.useMidtrans && <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full shrink-0">Online</span>}
                  </label>
                ))}
              </div>

              {isCod ? (
                <div className="mt-3 flex items-start gap-2 bg-orange-50 border border-orange-100 rounded-xl px-3.5 py-3">
                  <FontAwesomeIcon icon={faHandHoldingDollar} className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-orange-700">
                    Bayar langsung ke kurir saat barang tiba. Hanya tersedia di wilayah <strong>Blitar & sekitarnya</strong>.
                  </p>
                </div>
              ) : (
                <div className="mt-3 flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3.5 py-3">
                  <FontAwesomeIcon icon={faLock} className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700">
                    Pembayaran diproses aman via <strong>Midtrans</strong>. Popup akan langsung menampilkan metode <strong>{selectedMethod.label}</strong> yang kamu pilih.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Kanan: Ringkasan ── */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <button onClick={() => setShowOrderDetail(!showOrderDetail)} className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition">
                <p className="text-sm font-bold text-gray-800">
                  Detail Produk <span className="text-gray-400 font-normal">({orderItems.length})</span>
                </p>
                <FontAwesomeIcon icon={showOrderDetail ? faChevronUp : faChevronDown} className="w-3 h-3 text-gray-400" />
              </button>

              {showOrderDetail && (
                <div className="px-4 pb-4 space-y-3 border-t border-gray-50">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 pt-3">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 shrink-0 overflow-hidden flex items-center justify-center">
                        {item.image ? <Image src={item.image} alt={item.name} width={48} height={48} className="object-contain w-full h-full p-1" /> : <span className="text-xl">📦</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-700 line-clamp-2 leading-snug">{item.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          x{item.qty} · {formatPrice(item.price)}
                        </p>
                      </div>
                      <p className="text-xs font-bold text-[#1E2753] shrink-0">{formatPrice(item.price * item.qty)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
              <p className="text-sm font-bold text-gray-800">Ringkasan Pembayaran</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal Produk</span>
                  <span className="font-medium text-gray-700">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Ongkos Kirim</span>
                  <span className="font-medium text-green-600">Gratis</span>
                </div>
                {diskonKupon > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>Diskon {couponCode && <span className="font-semibold text-green-600">({couponCode})</span>}</span>
                    <span className="font-medium text-red-500">-{formatPrice(diskonKupon)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                <span className="text-sm font-bold text-gray-800">Total</span>
                <span className="text-xl font-bold text-[#1E2753]">{formatPrice(total)}</span>
              </div>

              <button
                onClick={handleCheckoutClick}
                disabled={orderItems.length === 0}
                className="w-full py-3.5 bg-[#1E2753] text-white rounded-xl font-bold text-sm hover:bg-[#2a3470] transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isCod ? (
                  <>
                    <FontAwesomeIcon icon={faHandHoldingDollar} className="w-4 h-4" />
                    Buat Pesanan COD
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faLock} className="w-4 h-4" />
                    Bayar Sekarang
                  </>
                )}
              </button>

              <p className="text-[10px] text-gray-400 text-center">{isCod ? "Pesanan dibuat langsung tanpa perlu bayar di muka." : "Kamu akan dikonfirmasi sebelum diarahkan ke halaman bayar."}</p>
            </div>

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
