"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp, faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { categoryIcon, categoryGradient, defaultCategoryIcon, defaultGradient } from "@/constants/category";
import { type Order, statusConfig } from "@/types/order";

interface OrderCardProps {
  order: Order;
  onCancel: (id: string) => void;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function ItemImage({ image, name, category }: { image?: string; name: string; category: string }) {
  // Tampilkan gambar jika ada dan valid (non-empty string)
  if (image && image.trim() !== "") {
    return (
      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 shadow-sm">
        <Image src={image} alt={name} width={56} height={56} className="w-full h-full object-contain p-1.5" unoptimized={image.startsWith("http")} />
      </div>
    );
  }
  // Fallback: gradient + icon kategori
  const gradient = categoryGradient[category] ?? defaultGradient;
  const icon = categoryIcon[category] ?? defaultCategoryIcon;
  return (
    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
      <FontAwesomeIcon icon={icon} className="w-6 h-6 text-white/80" />
    </div>
  );
}

export default function OrderCard({ order, onCancel }: OrderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const status = statusConfig[order.status];

  const canCancel = order.status === "Menunggu Konfirmasi";
  const isSelesai = order.status === "Selesai";
  const isDibatalkan = order.status === "Dibatalkan";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-bold text-gray-700 truncate max-w-[160px] sm:max-w-none">#{order.id}</span>
          <span className="text-gray-300 text-xs flex-shrink-0">•</span>
          <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(order.date)}</span>
        </div>

        {/* Status badge */}
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border flex-shrink-0 ${status.bg} ${status.color}`}>
          <FontAwesomeIcon icon={status.icon} className="w-3 h-3" />
          <span className="hidden sm:inline">{status.label}</span>
          <span className="sm:hidden">{status.label.split(" ")[0]}</span>
        </span>
      </div>

      {/* ── Item List ── */}
      <div className="px-4 py-4 space-y-3">
        {(expanded ? order.items : order.items.slice(0, 1)).map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <ItemImage image={item.image} name={item.name} category={item.category} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 line-clamp-1">{item.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {item.qty}x &nbsp;·&nbsp; {formatPrice(item.price)}/pcs
              </p>
            </div>
            <p className="text-sm font-bold text-[#1E2753] flex-shrink-0">{formatPrice(item.price * item.qty)}</p>
          </div>
        ))}

        {/* Expand toggle */}
        {order.items.length > 1 && (
          <button onClick={() => setExpanded((v) => !v)} className="flex items-center gap-1.5 text-xs text-[#1E2753] font-semibold hover:underline mt-1">
            <FontAwesomeIcon icon={expanded ? faChevronUp : faChevronDown} className="w-3 h-3" />
            {expanded ? "Sembunyikan" : `+${order.items.length - 1} produk lainnya`}
          </button>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap bg-gray-50/30">
        {/* Total */}
        <div>
          <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium">Total Pembayaran</p>
          <p className="text-base font-black text-[#1E2753] mt-0.5">{formatPrice(order.total)}</p>
        </div>

        {/* Aksi */}
        <div className="flex gap-2 flex-wrap justify-end">
          <Link href={`/user/orders/${order.id}`} className="px-3 py-2 border-2 border-[#1E2753] text-[#1E2753] rounded-xl text-xs font-bold hover:bg-[#1E2753] hover:text-white transition-all duration-200">
            Lihat Detail
          </Link>

          {canCancel && (
            <button onClick={() => onCancel(order.id)} className="px-3 py-2 border-2 border-red-400 text-red-500 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-all duration-200">
              Batalkan
            </button>
          )}

          {isDibatalkan && (
            <Link href="/user/dashboard-user" className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-500 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all duration-200">
              Belanja Lagi
            </Link>
          )}

          {isSelesai && (
            <Link href="/user/dashboard-user" className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-[#1E2753] to-[#2a3470] text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all duration-200 shadow-sm">
              <FontAwesomeIcon icon={faRotateLeft} className="w-3 h-3" />
              Beli Lagi
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
