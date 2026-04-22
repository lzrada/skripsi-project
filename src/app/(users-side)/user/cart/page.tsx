"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faCartShopping, faChevronLeft, faTag, faTruck, faShield, faTicket, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { subscribeToCartService, updateCartQtyService, removeFromCartService, CartItem } from "@/service/cart.service";
import { categoryGradient, defaultGradient } from "@/constants/category";
import { toast } from "@/components/ui/Toast";

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

// ─── Delete Confirmation Modal ───────────────────────────────────────────────
interface DeleteConfirmModalProps {
  itemName: string;
  isBulk?: boolean;
  bulkCount?: number;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmModal({ itemName, isBulk, bulkCount, onConfirm, onCancel }: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onCancel}>
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FontAwesomeIcon icon={faTrash} className="text-red-500 w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Hapus dari Keranjang?</h3>
        {isBulk ? (
          <p className="text-sm text-gray-500 mb-6">
            <span className="font-semibold text-gray-700">{bulkCount} produk</span> yang dipilih akan dihapus dari keranjangmu.
          </p>
        ) : (
          <p className="text-sm text-gray-500 mb-6">
            <span className="font-semibold text-gray-700">{itemName}</span> akan dihapus dari keranjangmu.
          </p>
        )}
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition">
            Batal
          </button>
          <button onClick={onConfirm} className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition">
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const [uid, setUid] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [loading, setLoading] = useState(true);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteBulk, setDeleteBulk] = useState(false);

  useEffect(() => {
    const u = getUid();
    setUid(u);
    if (!u) {
      setLoading(false);
      return;
    }
    const unsub = subscribeToCartService(u, (items) => {
      setCartItems(items);
      setSelectedIds((prev) => {
        const ids = items.map((i) => i.id);
        return prev.length === 0 ? ids : prev.filter((id) => ids.includes(id));
      });
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const updateQty = async (id: string, type: "inc" | "dec") => {
    if (!uid) return;
    const item = cartItems.find((i) => i.id === id);
    if (!item) return;
    const newQty = type === "inc" ? Math.min(item.qty + 1, item.stock) : Math.max(item.qty - 1, 1);
    if (newQty === item.qty) return;
    await updateCartQtyService(uid, id, newQty);
  };

  // Trigger modal untuk hapus satu item
  const handleDeleteClick = (id: string, name: string) => {
    setDeleteBulk(false);
    setDeleteTarget({ id, name });
  };

  // Trigger modal untuk hapus bulk
  const handleDeleteBulkClick = () => {
    setDeleteBulk(true);
    setDeleteTarget({ id: "", name: "" });
  };

  // Eksekusi hapus setelah konfirmasi
  const confirmDelete = async () => {
    if (!uid) return;
    if (deleteBulk) {
      await Promise.all(selectedIds.map((id) => removeFromCartService(uid, id)));
      toast.success(`${selectedIds.length} produk berhasil dihapus dari keranjang.`);
      setSelectedIds([]);
    } else if (deleteTarget) {
      await removeFromCartService(uid, deleteTarget.id);
      setSelectedIds((prev) => prev.filter((i) => i !== deleteTarget.id));
      toast.success("Produk dihapus dari keranjang.");
    }
    setDeleteTarget(null);
    setDeleteBulk(false);
  };

  const toggleSelect = (id: string) => setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  const toggleSelectAll = () => setSelectedIds(selectedIds.length === cartItems.length ? [] : cartItems.map((i) => i.id));

  const selectedItems = cartItems.filter((i) => selectedIds.includes(i.id));
  const subtotal = selectedItems.reduce((acc, i) => acc + i.price * i.qty, 0);
  const diskonKupon = couponApplied ? 50000 : 0;
  const total = subtotal - diskonKupon;

  const handleCoupon = () => {
    if (coupon.toLowerCase() === "rizky50") {
      setCouponApplied(true);
      toast.success("Kode kupon RIZKY50 berhasil dipakai! Hemat Rp 50.000 🎉");
    } else {
      toast.error("Kode kupon tidak valid. Coba lagi.");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Memuat keranjang...</p>
      </div>
    );

  if (!uid)
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center gap-4">
        <p className="text-gray-600 font-semibold">Silakan login untuk melihat keranjang</p>
        <Link href="/login" className="px-6 py-3 bg-[#1E2753] text-white rounded-xl font-semibold text-sm">
          Login
        </Link>
      </div>
    );

  if (cartItems.length === 0)
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center gap-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
          <FontAwesomeIcon icon={faCartShopping} className="w-10 h-10 text-gray-300" />
        </div>
        <p className="text-xl font-bold text-gray-700">Keranjang kamu kosong</p>
        <p className="text-sm text-gray-400">Yuk mulai belanja produk elektronik favoritmu!</p>
        <Link href="/user/dashboard-user" className="mt-2 px-6 py-3 bg-[#1E2753] text-white rounded-xl font-semibold text-sm">
          Mulai Belanja
        </Link>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Delete Confirmation Modal */}
      {deleteTarget !== null && (
        <DeleteConfirmModal
          itemName={deleteTarget.name}
          isBulk={deleteBulk}
          bulkCount={selectedIds.length}
          onConfirm={confirmDelete}
          onCancel={() => {
            setDeleteTarget(null);
            setDeleteBulk(false);
          }}
        />
      )}

      <div className="flex items-center gap-3 mb-6">
        <Link href="/user/dashboard-user" className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition text-gray-500">
          <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Keranjang Belanja</h1>
          <p className="text-xs text-gray-400">{cartItems.length} produk</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-center justify-between">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={selectedIds.length === cartItems.length && cartItems.length > 0} onChange={toggleSelectAll} className="w-4 h-4 accent-[#1E2753]" />
              <span className="text-sm font-semibold text-gray-700">Pilih Semua ({cartItems.length})</span>
            </label>
            {selectedIds.length > 0 && (
              <button onClick={handleDeleteBulkClick} className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-medium transition">
                <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                Hapus Dipilih ({selectedIds.length})
              </button>
            )}
          </div>

          {cartItems.map((item) => {
            const gradient = categoryGradient[item.category] ?? defaultGradient;
            const isSelected = selectedIds.includes(item.id);
            return (
              <div key={item.id} className={`bg-white rounded-2xl border shadow-sm p-4 transition-all duration-200 ${isSelected ? "border-[#1E2753]" : "border-gray-100"}`}>
                <div className="flex gap-4">
                  <div className="flex items-start pt-1">
                    <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(item.id)} className="w-4 h-4 accent-[#1E2753]" />
                  </div>
                  <div className={`w-20 h-20 rounded-xl flex-shrink-0 overflow-hidden relative ${item.image ? "bg-gray-100" : `bg-gradient-to-br ${gradient}`}`}>
                    {item.image ? <Image src={item.image} alt={item.name} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">{item.name}</p>
                      <button onClick={() => handleDeleteClick(item.id, item.name)} className="text-gray-300 hover:text-red-500 transition flex-shrink-0" title="Hapus dari keranjang">
                        <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        {item.originalPrice && <p className="text-xs text-gray-400 line-through">{formatPrice(item.originalPrice)}</p>}
                        <p className="text-base font-bold text-[#1E2753]">{formatPrice(item.price)}</p>
                      </div>
                      <div className="flex items-center border-2 border-gray-100 rounded-xl overflow-hidden">
                        <button onClick={() => updateQty(item.id, "dec")} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 font-bold">
                          −
                        </button>
                        <span className="w-10 text-center text-sm font-semibold text-gray-800">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, "inc")} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 font-bold">
                          +
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 text-right">
                      Subtotal: <span className="font-semibold text-gray-600">{formatPrice(item.price * item.qty)}</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="bg-green-50 border border-green-100 rounded-2xl px-4 py-3 flex items-center gap-3">
            <FontAwesomeIcon icon={faTruck} className="w-4 h-4 text-green-500 flex-shrink-0" />
            <p className="text-xs text-green-700 font-medium">
              Selamat! Kamu mendapat <span className="font-bold">gratis ongkir</span> untuk wilayah Blitar & sekitarnya.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <FontAwesomeIcon icon={faTicket} className="w-4 h-4 text-[#E85D04]" />
              <p className="text-sm font-bold text-gray-800">Kode Kupon</p>
            </div>
            {couponApplied ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                <div>
                  <p className="text-xs font-bold text-green-700">RIZKY50 berhasil dipakai!</p>
                  <p className="text-xs text-green-600">Hemat {formatPrice(50000)}</p>
                </div>
                <button
                  onClick={() => {
                    setCouponApplied(false);
                    setCoupon("");
                    toast.info("Kode kupon dihapus.");
                  }}
                  className="text-xs text-red-500 hover:underline"
                >
                  Hapus
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCoupon()}
                  placeholder="Masukkan kode kupon"
                  className="flex-1 border-2 border-gray-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1E2753] uppercase"
                />
                <button onClick={handleCoupon} className="px-3 py-2 bg-[#1E2753] text-white rounded-xl text-xs font-semibold hover:bg-[#2a3470]">
                  Pakai
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
            <p className="text-sm font-bold text-gray-800">Ringkasan Belanja</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Total Harga ({selectedItems.length} produk)</span>
                <span className="font-medium text-gray-700">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Ongkos Kirim</span>
                <span className="font-medium text-green-600">Gratis</span>
              </div>
              {couponApplied && (
                <div className="flex justify-between text-gray-500">
                  <span>Diskon Kupon</span>
                  <span className="font-medium text-red-500">-{formatPrice(diskonKupon)}</span>
                </div>
              )}
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
              <span className="text-sm font-bold text-gray-800">Total Pembayaran</span>
              <span className="text-lg font-bold text-[#1E2753]">{formatPrice(total)}</span>
            </div>
            <Link
              href={selectedIds.length > 0 ? `/user/checkout?ids=${selectedIds.join(",")}` : "#"}
              className={`block w-full py-3 rounded-xl text-center font-bold text-sm transition-all duration-200 ${selectedIds.length > 0 ? "bg-[#1E2753] text-white hover:bg-[#2a3470]" : "bg-gray-100 text-gray-400 pointer-events-none"}`}
            >
              Checkout ({selectedIds.length} produk)
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2">
            {[
              { icon: faShield, text: "Transaksi aman & terpercaya", color: "text-blue-500" },
              { icon: faTruck, text: "Gratis ongkir wilayah Blitar", color: "text-green-500" },
              { icon: faTag, text: "Harga terbaik dijamin", color: "text-orange-500" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <FontAwesomeIcon icon={item.icon} className={`w-4 h-4 ${item.color} flex-shrink-0`} />
                <span className="text-xs text-gray-500">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
