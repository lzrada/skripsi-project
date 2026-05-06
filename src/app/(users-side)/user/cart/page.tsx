"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faCartShopping, faChevronLeft, faTag, faTruck, faShield, faTicket, faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { subscribeToCartService, updateCartQtyService, removeFromCartService, type CartItem } from "@/service/cart.service";
import { validateCouponService } from "@/service/coupon.service";
import { categoryGradient, defaultGradient } from "@/constants/category";
import { toast } from "@/components/ui/Toast";
import { inventoryFirstCheck } from "@/constants/inventory";

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

interface StockWarningBannerProps {
  items: CartItem[];
}

function StockWarningBanner({ items }: StockWarningBannerProps) {
  const invalidItems = items.filter((item) => !inventoryFirstCheck(item.qty, item.stock));

  if (invalidItems.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-2 animate-fadeIn">
      <div className="flex items-start gap-3">
        <FontAwesomeIcon icon={faCircleExclamation} className="text-red-500 w-4 h-4 mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-red-700 font-bold text-sm">Validasi Stok Gagal</p>
          <p className="text-red-600 text-xs mt-0.5 leading-relaxed">
            Beberapa item melebihi stok tersedia. Sistem <span className="font-semibold">Algoritma Inventory First</span> hanya mengizinkan pemesanan sesuai stok aktual.
          </p>
          <ul className="mt-2 space-y-1">
            {invalidItems.map((item) => (
              <li key={item.id} className="text-xs text-red-600 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                <strong>{item.name}</strong>: diminta <strong>{item.qty}</strong>, stok tersisa <strong>{item.stock}</strong>
              </li>
            ))}
          </ul>
          <p className="text-red-500 text-xs mt-2 font-medium">↳ Kurangi jumlah item di atas untuk melanjutkan checkout.</p>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ itemName, isBulk, bulkCount, onConfirm, onCancel }: { itemName: string; isBulk?: boolean; bulkCount?: number; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={onCancel}>
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 text-center animate-fadeIn" onClick={(e) => e.stopPropagation()}>
        <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FontAwesomeIcon icon={faTrash} className="text-red-500 w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Hapus dari Keranjang?</h3>
        <p className="text-sm text-gray-500 mb-6">
          {isBulk ? (
            <>
              <span className="font-bold text-gray-700">{bulkCount} produk</span> yang dipilih akan dihapus dari keranjang.
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

function CartItemRow({ item, isSelected, onToggle, onDeleteClick, onQtyChange }: { item: CartItem; isSelected: boolean; onToggle: () => void; onDeleteClick: () => void; onQtyChange: (type: "inc" | "dec") => Promise<void> }) {
  const [qtyLoading, setQtyLoading] = useState(false);
  const gradient = categoryGradient[item.category] ?? defaultGradient;
  const atMaxStock = item.qty >= item.stock;
  const atMinQty = item.qty <= 1;

  const stockInvalid = !inventoryFirstCheck(item.qty, item.stock);

  const handleQty = async (type: "inc" | "dec") => {
    if (qtyLoading) return;
    if (type === "inc" && atMaxStock) return;
    if (type === "dec" && atMinQty) return;
    setQtyLoading(true);
    await onQtyChange(type);
    setQtyLoading(false);
  };

  return (
    <div className={`bg-white rounded-2xl border-2 shadow-sm p-4 transition-all duration-200 ${stockInvalid ? "border-red-300 bg-red-50/30" : isSelected ? "border-[#1E2753]" : "border-gray-100"}`}>
      <div className="flex gap-3">
        <div className="flex items-start pt-1 flex-shrink-0">
          <input type="checkbox" checked={isSelected} onChange={onToggle} className="w-4 h-4 accent-[#1E2753] cursor-pointer" />
        </div>

        <div className={`w-20 h-20 rounded-xl flex-shrink-0 overflow-hidden relative border border-gray-100 ${item.image ? "bg-gray-50" : `bg-gradient-to-br ${gradient}`}`}>
          {item.image ? <Image src={item.image} alt={item.name} fill sizes="80px" className="object-contain p-1.5" /> : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">{item.name}</p>
            <button onClick={onDeleteClick} className="text-gray-300 hover:text-red-500 transition flex-shrink-0 p-1" title="Hapus dari keranjang">
              <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
            <div>
              {item.originalPrice && <p className="text-[10px] text-gray-400 line-through">{formatPrice(item.originalPrice)}</p>}
              <p className="text-sm font-black text-[#1E2753]">{formatPrice(item.price)}</p>
            </div>

            <div className="flex flex-col items-end gap-1">
              <div className={`flex items-center rounded-xl overflow-hidden border-2 transition-all ${qtyLoading ? "opacity-60" : ""} ${stockInvalid ? "border-red-300" : isSelected ? "border-[#1E2753]/30" : "border-gray-100"}`}>
                <button
                  onClick={() => handleQty("dec")}
                  disabled={qtyLoading || atMinQty}
                  className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 font-bold text-lg disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  −
                </button>
                <span className="w-10 text-center text-sm font-bold text-gray-800">{item.qty}</span>
                <button
                  onClick={() => handleQty("inc")}
                  disabled={qtyLoading || atMaxStock}
                  className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 font-bold text-lg disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  +
                </button>
              </div>

              {stockInvalid ? <p className="text-[9px] text-red-500 font-bold">⚠ Melebihi stok ({item.stock} tersisa)</p> : atMaxStock ? <p className="text-[9px] text-orange-500 font-semibold">Maks. stok tercapai</p> : null}
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-1.5 text-right">
            Subtotal: <span className="font-bold text-gray-700">{formatPrice(item.price * item.qty)}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const [uid, setUid] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    id: string;
    code: string;
    discount: number;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
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

  const selectedItems = cartItems.filter((i) => selectedIds.includes(i.id));
  const subtotal = selectedItems.reduce((acc, i) => acc + i.price * i.qty, 0);
  const diskonKupon = appliedCoupon?.discount ?? 0;
  const total = Math.max(subtotal - diskonKupon, 0);

  const hasStockViolation = selectedItems.some((item) => !inventoryFirstCheck(item.qty, item.stock));

  const updateQty = async (id: string, type: "inc" | "dec") => {
    if (!uid) return;
    const item = cartItems.find((i) => i.id === id);
    if (!item) return;
    const newQty = type === "inc" ? Math.min(item.qty + 1, item.stock) : Math.max(item.qty - 1, 1);
    if (newQty === item.qty) return;
    await updateCartQtyService(uid, id, newQty);
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

  const toggleSelect = (id: string) => setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  const toggleSelectAll = () => setSelectedIds(selectedIds.length === cartItems.length ? [] : cartItems.map((i) => i.id));

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
      setAppliedCoupon({
        id: result.coupon.id,
        code: result.coupon.code,
        discount: result.coupon.discount,
      });
      setCouponInput("");
      toast.success(`Kupon ${result.coupon.code} berhasil! Hemat ${formatPrice(result.coupon.discount)} 🎉`);
    } else {
      toast.error(result.message);
    }
  };

  const checkoutHref = () => {
    if (selectedIds.length === 0 || hasStockViolation) return "#";
    let url = `/user/checkout?ids=${selectedIds.join(",")}`;
    if (appliedCoupon) {
      url += `&coupon=${encodeURIComponent(appliedCoupon.code)}&discount=${appliedCoupon.discount}&couponId=${appliedCoupon.id}`;
    }
    return url;
  };

  if (loading)
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-4">
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Delete Modal */}
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
        <Link href="/user/products" className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition text-gray-500">
          <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-gray-800">Keranjang Belanja</h1>
          <p className="text-xs text-gray-400">{cartItems.length} produk</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-center justify-between">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={selectedIds.length === cartItems.length && cartItems.length > 0} onChange={toggleSelectAll} className="w-4 h-4 accent-[#1E2753] cursor-pointer" />
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

          {/* Cart item list */}
          {cartItems.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              isSelected={selectedIds.includes(item.id)}
              onToggle={() => toggleSelect(item.id)}
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

        <div className="space-y-4">
          {/* Kupon */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <FontAwesomeIcon icon={faTicket} className="w-4 h-4 text-[#E85D04]" />
              <p className="text-sm font-bold text-gray-800">Kode Kupon</p>
            </div>
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
                <div>
                  <p className="text-xs font-bold text-emerald-700">✓ {appliedCoupon.code}</p>
                  <p className="text-xs text-emerald-600 mt-0.5">Hemat {formatPrice(appliedCoupon.discount)}</p>
                </div>
                <button
                  onClick={() => {
                    setAppliedCoupon(null);
                    setCouponInput("");
                    toast.info("Kupon dihapus.");
                  }}
                  className="text-xs text-red-500 hover:underline ml-2 flex-shrink-0 font-semibold"
                >
                  Hapus
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                  placeholder="Masukkan kode kupon"
                  className="flex-1 border-2 border-gray-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1E2753] uppercase tracking-wider font-mono"
                />
                <button onClick={handleApplyCoupon} disabled={couponLoading || !couponInput.trim()} className="px-3 py-2 bg-[#1E2753] text-white rounded-xl text-xs font-bold hover:bg-[#2a3470] disabled:opacity-50 transition">
                  {couponLoading ? "..." : "Pakai"}
                </button>
              </div>
            )}
          </div>

          {/* Ringkasan harga */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
            <p className="text-sm font-bold text-gray-800">Ringkasan Belanja</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Total Harga ({selectedItems.length} produk)</span>
                <span className="font-semibold text-gray-700">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Ongkos Kirim</span>
                <span className="font-semibold text-emerald-600">Gratis</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-gray-500">
                  <span>
                    Diskon <span className="text-emerald-600 font-bold">({appliedCoupon.code})</span>
                  </span>
                  <span className="font-semibold text-red-500">-{formatPrice(diskonKupon)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-3">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold text-gray-800">Total Pembayaran</span>
                <span className="text-lg font-black text-[#1E2753]">{formatPrice(total)}</span>
              </div>

              {/* Inventory First: pesan & tombol dinonaktifkan jika ada pelanggaran stok */}
              {hasStockViolation && selectedIds.length > 0 && <p className="text-xs text-red-500 font-semibold text-center mb-2">⚠ Perbaiki stok item di atas sebelum checkout</p>}

              <Link
                href={checkoutHref()}
                onClick={(e) => {
                  if (hasStockViolation || selectedIds.length === 0) {
                    e.preventDefault();
                  }
                }}
                className={`block w-full py-3.5 rounded-xl text-center font-black text-sm transition-all duration-200 ${
                  selectedIds.length > 0 && !hasStockViolation ? "bg-[#1E2753] text-white hover:bg-[#2a3470] active:scale-95 shadow-sm" : "bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none"
                }`}
              >
                {hasStockViolation ? "Stok Tidak Valid" : `Checkout (${selectedIds.length} produk)`}
              </Link>
            </div>
          </div>

          {/* Trust badges */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2.5">
            {[
              {
                icon: faShield,
                text: "Transaksi aman & terpercaya",
                color: "text-blue-500",
              },
              {
                icon: faTruck,
                text: "Gratis ongkir wilayah Blitar",
                color: "text-emerald-500",
              },
              {
                icon: faTag,
                text: "Harga terbaik dijamin",
                color: "text-orange-500",
              },
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
