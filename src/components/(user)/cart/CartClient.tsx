"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping, faChevronLeft, faTruck, faTrash, faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { subscribeToCartService, updateCartQtyService, removeFromCartService } from "@/service/cart.service";
import { validateCouponService } from "@/service/coupon.service";
import { inventoryFirstCheck } from "@/constants/inventory";
import { toast } from "@/components/(user)/ui/Toast";
import { getCookieValue } from "@/lib/format";
import CartItemRow from "@/components/(user)/cart/CartItemRow";
import CartSummary, { CartSummaryDesktop, CartSummaryMobile } from "@/components/(user)/cart/CartSummary";
import { CartItem } from "@/types/cart";

function StockWarningBanner({ items }: { items: CartItem[] }) {
  const invalid = items.filter((i) => !inventoryFirstCheck(i.qty, i.stock));
  if (invalid.length === 0) return null;
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-2">
      <div className="flex items-start gap-3">
        <FontAwesomeIcon icon={faCircleExclamation} className="text-red-500 w-4 h-4 mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-red-700 font-bold text-sm">Validasi Stok Gagal</p>
          <p className="text-red-600 text-xs mt-0.5 leading-relaxed">
            Beberapa item melebihi stok tersedia. Sistem <span className="font-semibold">Algoritma Inventory First</span> hanya mengizinkan pemesanan sesuai stok aktual.
          </p>
          <ul className="mt-2 space-y-1">
            {invalid.map((item) => (
              <li key={item.id} className="text-xs text-red-600 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                <strong>{item.name}</strong>: diminta <strong>{item.qty}</strong>, stok tersisa <strong>{item.stock}</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ itemName, isBulk, bulkCount, onConfirm, onCancel }: { itemName: string; isBulk?: boolean; bulkCount?: number; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={onCancel}>
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FontAwesomeIcon icon={faTrash} className="text-red-500 w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Hapus dari Keranjang?</h3>
        <p className="text-sm text-gray-500 mb-6">
          {isBulk ? (
            <>
              <span className="font-bold text-gray-700">{bulkCount} produk</span> yang dipilih akan dihapus.
            </>
          ) : (
            <>
              <span className="font-bold text-gray-700">{itemName}</span> akan dihapus dari keranjang.
            </>
          )}
        </p>
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

export default function CartClient() {
  const [uid, setUid] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ id: string; code: string; discount: number } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteBulk, setDeleteBulk] = useState(false);

  useEffect(() => {
    const u = getCookieValue("uid");
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

  const selectedItems = cartItems.filter((i) => selectedIds.includes(i.id));
  const subtotal = selectedItems.reduce((acc, i) => acc + i.price * i.qty, 0);
  const diskonKupon = appliedCoupon?.discount ?? 0;
  const total = Math.max(subtotal - diskonKupon, 0);
  const hasStockViolation = selectedItems.some((i) => !inventoryFirstCheck(i.qty, i.stock));

  const updateQty = async (id: string, type: "inc" | "dec") => {
    if (!uid) return;
    const item = cartItems.find((i) => i.id === id);
    if (!item) return;
    const newQty = type === "inc" ? Math.min(item.qty + 1, item.stock) : Math.max(item.qty - 1, 1);
    if (newQty !== item.qty) await updateCartQtyService(uid, id, newQty);
  };

  const confirmDelete = async () => {
    if (!uid) return;
    if (deleteBulk) {
      await Promise.all(selectedIds.map((id) => removeFromCartService(uid, id)));
      toast.success(`${selectedIds.length} produk dihapus dari keranjang.`);
      setSelectedIds([]);
    } else if (deleteTarget?.id) {
      await removeFromCartService(uid, deleteTarget.id);
      setSelectedIds((prev) => prev.filter((i) => i !== deleteTarget.id));
      toast.success("Produk dihapus dari keranjang.");
    }
    setDeleteTarget(null);
    setDeleteBulk(false);
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    if (selectedItems.length === 0) {
      toast.error("Pilih produk terlebih dahulu.");
      return;
    }
    setCouponLoading(true);
    const result = await validateCouponService(couponInput, subtotal);
    setCouponLoading(false);
    if (result.valid) {
      setAppliedCoupon({ id: result.coupon.id, code: result.coupon.code, discount: result.coupon.discount });
      setCouponInput("");
      toast.success(`Kupon ${result.coupon.code} berhasil! 🎉`);
    } else {
      toast.error(result.message);
    }
  };

  const checkoutHref = (() => {
    if (selectedIds.length === 0 || hasStockViolation) return "#";
    let url = `/user/checkout?ids=${selectedIds.join(",")}`;
    if (appliedCoupon) url += `&coupon=${encodeURIComponent(appliedCoupon.code)}&discount=${appliedCoupon.discount}&couponId=${appliedCoupon.id}`;
    return url;
  })();

  const summaryProps = {
    selectedCount: selectedIds.length,
    subtotal,
    diskonKupon,
    total,
    hasStockViolation,
    appliedCoupon,
    couponInput,
    couponLoading,
    onCouponInputChange: setCouponInput,
    onApplyCoupon: handleApplyCoupon,
    onRemoveCoupon: () => {
      setAppliedCoupon(null);
      setCouponInput("");
      toast.info("Kupon dihapus.");
    },
    checkoutHref,
  };

  if (loading)
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-4 h-4 bg-slate-200 rounded mt-1" />
                  <div className="w-20 h-20 bg-slate-100 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="w-3/4 h-4 bg-slate-200 rounded" />
                    <div className="w-1/2 h-3 bg-slate-100 rounded" />
                    <div className="flex justify-between mt-3">
                      <div className="w-24 h-5 bg-slate-200 rounded" />
                      <div className="w-24 h-8 bg-slate-100 rounded-xl" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden lg:block space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 h-36 animate-pulse" />
            <div className="bg-white rounded-2xl border border-gray-100 h-52 animate-pulse" />
            <div className="bg-white rounded-2xl border border-gray-100 h-24 animate-pulse" />
          </div>
        </div>
      </div>
    );

  if (!uid)
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center gap-4">
        <div className="w-20 h-20 bg-[#1E2753]/10 rounded-2xl flex items-center justify-center">
          <FontAwesomeIcon icon={faCartShopping} className="w-8 h-8 text-[#1E2753]" />
        </div>
        <p className="text-gray-700 font-bold text-lg">Kamu belum login</p>
        <p className="text-sm text-gray-400">Login untuk melihat keranjang belanjamu</p>
        <Link href="/login" className="px-6 py-3 bg-[#1E2753] text-white rounded-xl font-bold text-sm hover:bg-[#2a3470] transition">
          Login Sekarang
        </Link>
      </div>
    );

  if (cartItems.length === 0)
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center gap-4">
        <div className="w-24 h-24 bg-[#1E2753]/10 rounded-2xl flex items-center justify-center">
          <FontAwesomeIcon icon={faCartShopping} className="w-10 h-10 text-[#1E2753]" />
        </div>
        <p className="text-xl font-black text-gray-800">Keranjang kamu kosong</p>
        <p className="text-sm text-gray-400">Yuk mulai belanja produk elektronik favoritmu!</p>
        <Link href="/user/products" className="mt-2 px-6 py-3 bg-[#1E2753] text-white rounded-xl font-bold text-sm hover:bg-[#2a3470] transition">
          Mulai Belanja
        </Link>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 lg:pb-6">
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

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/user/products" className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition text-gray-500">
          <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-gray-800">Keranjang Belanja</h1>
          <p className="text-xs text-gray-400">{cartItems.length} produk</p>
        </div>
      </div>

      {/* Grid: kiri produk (2 kolom) + kanan summary (1 kolom) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* KOLOM KIRI — Daftar Produk */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3 flex items-center justify-between">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={selectedIds.length === cartItems.length && cartItems.length > 0}
                onChange={() => setSelectedIds(selectedIds.length === cartItems.length ? [] : cartItems.map((i) => i.id))}
                className="w-4 h-4 accent-[#1E2753] cursor-pointer"
              />
              <span className="text-sm font-bold text-gray-700">
                Pilih Semua <span className="text-gray-400 font-normal">({cartItems.length})</span>
              </span>
            </label>
            {selectedIds.length > 0 && (
              <button
                onClick={() => {
                  setDeleteBulk(true);
                  setDeleteTarget({ id: "", name: "" });
                }}
                className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-semibold transition"
              >
                <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                Hapus ({selectedIds.length})
              </button>
            )}
          </div>

          <StockWarningBanner items={selectedItems} />

          {cartItems.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              isSelected={selectedIds.includes(item.id)}
              onToggle={() => setSelectedIds((prev) => (prev.includes(item.id) ? prev.filter((i) => i !== item.id) : [...prev, item.id]))}
              onDeleteClick={() => {
                setDeleteBulk(false);
                setDeleteTarget({ id: item.id, name: item.name });
              }}
              onQtyChange={(type) => updateQty(item.id, type)}
            />
          ))}

          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3 flex items-center gap-3">
            <FontAwesomeIcon icon={faTruck} className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <p className="text-xs text-emerald-700 font-medium">
              Selamat! Kamu mendapat <span className="font-bold">gratis ongkir</span> untuk wilayah Blitar & sekitarnya.
            </p>
          </div>
        </div>

        <div className="hidden md:block lg:block lg:col-span-1">
          <CartSummaryDesktop {...summaryProps} />
        </div>
      </div>

      <div className="lg:hidden md:hidden">
        <CartSummaryMobile {...summaryProps} />
      </div>
    </div>
  );
}
