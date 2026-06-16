"use client";

import { useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp, faLocationDot, faGear, faBoxOpen } from "@fortawesome/free-solid-svg-icons";
import { type Order, type OrderStatus, statusConfig } from "@/types/order";
import { categoryIcon, categoryGradient, defaultCategoryIcon, defaultGradient } from "@/constants/category";
import { formatOrderDate, formatPrice, getPaymentIcon } from "@/components/(admin)/order/orderHelpers";
import { CancelOrderModal } from "@/components/(admin)/order/CancelOrderModal";

const STATUS_FLOW: OrderStatus[] = ["Menunggu Konfirmasi", "Diproses", "Dikirim", "Selesai"];

interface OrderRowProps {
  order: Order;
  onStatusChange: (id: string, status: OrderStatus) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
}

export function OrderRow({ order, onStatusChange, onCancel }: OrderRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const status = statusConfig[order.status];
  const currentIndex = STATUS_FLOW.indexOf(order.status);
  const canAdvance = currentIndex !== -1 && currentIndex < STATUS_FLOW.length - 1;
  const isCancelled = order.status === "Dibatalkan";
  const isDone = order.status === "Selesai";
  const stepIndex = currentIndex;

  const handleAdvance = async () => {
    if (!canAdvance) return;
    setUpdating(true);
    await onStatusChange(order.id, STATUS_FLOW[currentIndex + 1]);
    setUpdating(false);
  };

  const handleCancel = async () => {
    setUpdating(true);
    setConfirmCancel(false);
    await onCancel(order.id);
    setUpdating(false);
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3.5 cursor-pointer hover:bg-slate-50/80 transition" onClick={() => setExpanded((v) => !v)}>
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 shrink-0 transition"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((v) => !v);
              }}
            >
              <FontAwesomeIcon icon={expanded ? faChevronUp : faChevronDown} className="w-3 h-3" />
            </button>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 font-mono tracking-wide">#{order.id.slice(0, 8).toUpperCase()}</p>
              <p className="text-xs text-slate-400">
                {formatOrderDate(order)} · {order.recipientName ?? "—"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 ml-10 sm:ml-0">
            <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${status.bg} ${status.color}`}>
              <FontAwesomeIcon icon={status.icon} className="w-3 h-3" />
              {status.label}
            </span>
            <span className="text-sm font-bold text-[#1E2753] whitespace-nowrap">{formatPrice(order.total)}</span>
            {!isCancelled && !isDone && (
              <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                {canAdvance && (
                  <button onClick={handleAdvance} disabled={updating} className="text-xs bg-[#1E2753] hover:bg-[#2a3470] text-white font-semibold px-3 py-1.5 rounded-xl transition disabled:opacity-60 flex items-center gap-1">
                    {updating ? <FontAwesomeIcon icon={faGear} className="w-3 h-3 animate-spin" /> : `→ ${STATUS_FLOW[currentIndex + 1]}`}
                  </button>
                )}
                <button onClick={() => setConfirmCancel(true)} disabled={updating} className="text-xs border border-red-200 text-red-500 hover:bg-red-50 font-semibold px-3 py-1.5 rounded-xl transition disabled:opacity-60">
                  Batalkan
                </button>
              </div>
            )}
            {isDone && <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">✓ Selesai</span>}
          </div>
        </div>

        {/* Status progress bar */}
        {!isCancelled && (
          <div className="px-5 pb-3 pt-0">
            <div className="flex items-center gap-0">
              {STATUS_FLOW.map((step, i) => {
                const done = stepIndex >= i;
                const active = stepIndex === i;
                return (
                  <div key={step} className="flex items-center flex-1 last:flex-none">
                    <div
                      className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all ${
                        done ? (active ? "bg-[#1E2753] text-white ring-2 ring-[#1E2753]/20" : "bg-emerald-500 text-white") : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {done && !active ? "✓" : i + 1}
                    </div>
                    <div className="hidden sm:block ml-1 mr-1">
                      <p className={`text-[9px] font-semibold whitespace-nowrap ${done ? (active ? "text-[#1E2753]" : "text-emerald-600") : "text-slate-400"}`}>{step === "Menunggu Konfirmasi" ? "Menunggu" : step}</p>
                    </div>
                    {i < STATUS_FLOW.length - 1 && <div className={`flex-1 h-0.5 mx-1 rounded-full ${stepIndex > i ? "bg-emerald-400" : "bg-slate-100"}`} />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Detail expanded */}
        {expanded && (
          <div className="border-t border-slate-100 bg-slate-50/60 p-4 space-y-4">
            {/* Alamat & Pembayaran */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-3 border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <FontAwesomeIcon icon={faLocationDot} className="w-3.5 h-3.5 text-orange-500" />
                  <p className="text-xs font-bold text-slate-700">Alamat Pengiriman</p>
                </div>
                <p className="text-sm font-semibold text-slate-700">{order.recipientName}</p>
                <p className="text-xs text-slate-500 mt-0.5">{order.phone}</p>
                <p className="text-xs text-slate-500 mt-0.5">{order.address}</p>
                {order.note && <p className="text-xs text-slate-400 mt-1 italic bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">📝 {order.note}</p>}
              </div>
              <div className="bg-white rounded-xl p-3 border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <FontAwesomeIcon icon={getPaymentIcon(order.paymentMethod)} className="w-3.5 h-3.5 text-[#1E2753]" />
                  <p className="text-xs font-bold text-slate-700">Pembayaran</p>
                </div>
                <p className="text-sm font-semibold text-slate-700">{order.paymentMethod}</p>
                <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 ${order.status === "Menunggu Konfirmasi" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                  {order.status === "Menunggu Konfirmasi" ? "Menunggu konfirmasi" : "Terkonfirmasi"}
                </span>
              </div>
            </div>

            {/* Daftar produk */}
            <div>
              <p className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
                <FontAwesomeIcon icon={faBoxOpen} className="w-3 h-3" />
                Produk ({order.items.length} item)
              </p>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-slate-100">
                    {/* Thumbnail: gambar asli kalau ada, fallback ke icon kategori */}
                    <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-sm bg-slate-100 flex items-center justify-center">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} width={40} height={40} className="object-cover w-full h-full" />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${categoryGradient[item.category] ?? defaultGradient} flex items-center justify-center`}>
                          <FontAwesomeIcon icon={categoryIcon[item.category] ?? defaultCategoryIcon} className="w-4 h-4 text-white/80" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-slate-400">
                        {formatPrice(item.price)} × {item.qty}
                      </p>
                    </div>
                    <p className="text-xs font-bold text-[#1E2753] shrink-0">{formatPrice(item.price * item.qty)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center bg-[#1E2753]/5 rounded-xl px-4 py-3 border border-[#1E2753]/10">
              <span className="text-sm font-bold text-slate-700">Total Pembayaran</span>
              <span className="text-base font-black text-[#1E2753]">{formatPrice(order.total)}</span>
            </div>
          </div>
        )}
      </div>

      {confirmCancel && <CancelOrderModal orderId={order.id} updating={updating} onConfirm={handleCancel} onClose={() => setConfirmCancel(false)} />}
    </>
  );
}
