"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faLocationDot, faTruck, faShield, faMoneyBill, faCreditCard, faWallet, faChevronDown, faChevronUp, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { subscribeToCartService, clearCartService, CartItem } from "@/service/cart.service";
import { createOrderService } from "@/service/order.service";

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);
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
  { id: "transfer", label: "Transfer Bank", desc: "BCA, BRI, BNI, Mandiri", icon: faMoneyBill, color: "text-blue-500" },
  { id: "kartu", label: "Kartu Kredit / Debit", desc: "Visa, Mastercard", icon: faCreditCard, color: "text-purple-500" },
  { id: "ewallet", label: "E-Wallet", desc: "GoPay, OVO, Dana, ShopeePay", icon: faWallet, color: "text-green-500" },
  { id: "cod", label: "Bayar di Tempat (COD)", desc: "Hanya wilayah Blitar & sekitarnya", icon: faTruck, color: "text-orange-500" },
];

function CheckoutForm() {
  const searchParams = useSearchParams();
  const selectedIds = searchParams.get("ids")?.split(",") ?? [];

  const [uid, setUid] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<CartItem[]>([]);
  const [selectedPayment, setSelectedPayment] = useState("transfer");
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nama: "", telepon: "", alamat: "", kota: "", kodePos: "", catatan: "" });

  useEffect(() => {
    const u = getUid();
    setUid(u);
    if (!u) return;
    const unsub = subscribeToCartService(u, (items) => {
      const filtered = selectedIds.length > 0 ? items.filter((i) => selectedIds.includes(i.id)) : items;
      setOrderItems(filtered);
    });
    return () => unsub();
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const subtotal = orderItems.reduce((acc, i) => acc + i.price * i.qty, 0);

  const handleOrder = async () => {
    if (!form.nama || !form.telepon || !form.alamat) {
      alert("Lengkapi data pengiriman terlebih dahulu!");
      return;
    }
    if (!uid) {
      window.location.href = "/login";
      return;
    }
    setLoading(true);
    try {
      const id = await createOrderService({
        uid,
        recipientName: form.nama,
        phone: form.telepon,
        address: form.alamat,
        kota: form.kota,
        kodePos: form.kodePos,
        note: form.catatan,
        paymentMethod: paymentMethods.find((p) => p.id === selectedPayment)?.label ?? selectedPayment,
        items: orderItems.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, category: i.category })),
        total: subtotal,
      });
      // Hapus item yang di-checkout dari cart
      await clearCartService(
        uid,
        orderItems.map((i) => i.id),
      );
      setOrderId(id);
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Gagal membuat pesanan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess)
    return (
      <div className="max-w-lg mx-auto px-4 py-20 flex flex-col items-center text-center gap-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <FontAwesomeIcon icon={faCircleCheck} className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Pesanan Berhasil!</h1>
        <p className="text-sm text-gray-500 max-w-xs">Pesananmu sedang diproses. Kami akan segera menghubungimu untuk konfirmasi.</p>
        <div className="w-full bg-gray-50 rounded-2xl p-4 text-left space-y-2 mt-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">No. Pesanan</span>
            <span className="font-bold text-gray-800">#{orderId.slice(0, 8).toUpperCase()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total Bayar</span>
            <span className="font-bold text-[#1E2753]">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Metode Bayar</span>
            <span className="font-bold text-gray-800">{paymentMethods.find((p) => p.id === selectedPayment)?.label}</span>
          </div>
        </div>
        <div className="flex gap-3 w-full mt-2">
          <Link href="/user/dashboard-user" className="flex-1 py-3 border-2 border-[#1E2753] text-[#1E2753] rounded-xl font-semibold text-sm text-center">
            Kembali Belanja
          </Link>
          <Link href="/user/orders" className="flex-1 py-3 bg-[#1E2753] text-white rounded-xl font-semibold text-sm text-center">
            Lihat Pesanan
          </Link>
        </div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/user/cart" className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition text-gray-500">
          <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Checkout</h1>
          <p className="text-xs text-gray-400">{orderItems.length} produk</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Alamat */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <FontAwesomeIcon icon={faLocationDot} className="w-4 h-4 text-[#E85D04]" />
              <p className="text-sm font-bold text-gray-800">Alamat Pengiriman</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { name: "nama", label: "Nama Lengkap", placeholder: "Masukkan nama lengkap", required: true, type: "text", span: false },
                { name: "telepon", label: "No. Telepon", placeholder: "08xx-xxxx-xxxx", required: true, type: "tel", span: false },
                { name: "alamat", label: "Alamat Lengkap", placeholder: "Nama jalan, No. rumah, RT/RW", required: true, type: "text", span: true },
                { name: "kota", label: "Kota / Kabupaten", placeholder: "Contoh: Blitar", required: false, type: "text", span: false },
                { name: "kodePos", label: "Kode Pos", placeholder: "66181", required: false, type: "text", span: false },
              ].map((f) => (
                <div key={f.name} className={f.span ? "sm:col-span-2" : ""}>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">
                    {f.label} {f.required && <span className="text-red-400">*</span>}
                  </label>
                  <input
                    type={f.type}
                    name={f.name}
                    value={(form as any)[f.name]}
                    onChange={handleInput}
                    placeholder={f.placeholder}
                    className="w-full border-2 border-gray-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E2753] transition"
                  />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Catatan (opsional)</label>
                <textarea
                  name="catatan"
                  value={form.catatan}
                  onChange={handleInput}
                  placeholder="Contoh: Titip di depan pagar"
                  rows={2}
                  className="w-full border-2 border-gray-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E2753] transition resize-none"
                />
              </div>
            </div>
          </div>

          {/* Pengiriman */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <FontAwesomeIcon icon={faTruck} className="w-4 h-4 text-[#1E2753]" />
              <p className="text-sm font-bold text-gray-800">Metode Pengiriman</p>
            </div>
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-green-700">Pengiriman Toko</p>
                <p className="text-xs text-green-600">Estimasi 1-2 hari • Wilayah Blitar & sekitarnya</p>
              </div>
              <span className="text-sm font-bold text-green-600">GRATIS</span>
            </div>
          </div>

          {/* Pembayaran */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <FontAwesomeIcon icon={faShield} className="w-4 h-4 text-[#1E2753]" />
              <p className="text-sm font-bold text-gray-800">Metode Pembayaran</p>
            </div>
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <label key={method.id} className={`flex items-center gap-4 p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedPayment === method.id ? "border-[#1E2753] bg-blue-50" : "border-gray-100 hover:border-gray-200"}`}>
                  <input type="radio" name="payment" value={method.id} checked={selectedPayment === method.id} onChange={() => setSelectedPayment(method.id)} className="accent-[#1E2753]" />
                  <FontAwesomeIcon icon={method.icon} className={`w-5 h-5 ${method.color}`} />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{method.label}</p>
                    <p className="text-xs text-gray-400">{method.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Ringkasan */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <button onClick={() => setShowOrderDetail(!showOrderDetail)} className="w-full flex items-center justify-between">
              <p className="text-sm font-bold text-gray-800">Detail Produk ({orderItems.length})</p>
              <FontAwesomeIcon icon={showOrderDetail ? faChevronUp : faChevronDown} className="w-3 h-3 text-gray-400" />
            </button>
            {showOrderDetail && (
              <div className="mt-3 space-y-3">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 shrink-0 flex items-center justify-center text-lg">📦</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-700 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-400">x{item.qty}</p>
                    </div>
                    <p className="text-xs font-bold text-[#1E2753]">{formatPrice(item.price * item.qty)}</p>
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
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
              <span className="text-sm font-bold text-gray-800">Total Pembayaran</span>
              <span className="text-lg font-bold text-[#1E2753]">{formatPrice(subtotal)}</span>
            </div>
            <button onClick={handleOrder} disabled={loading || orderItems.length === 0} className="w-full py-3 bg-[#1E2753] text-white rounded-xl font-bold text-sm hover:bg-[#2a3470] transition disabled:opacity-60">
              {loading ? "Memproses..." : "Buat Pesanan"}
            </button>
            <p className="text-[10px] text-gray-400 text-center">Dengan menekan tombol di atas, kamu menyetujui syarat & ketentuan Rizky Elektronik.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutForm />
    </Suspense>
  );
}
