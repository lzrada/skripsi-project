"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp, faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { categoryIcon, categoryGradient, defaultCategoryIcon, defaultGradient } from "@/constants/category";
import { type Order, type OrderStatus, statusConfig } from "@/types/order";

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
  if (image) {
    return (
      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
        <Image src={image} alt={name} width={48} height={48} className="w-full h-full object-contain p-1" />
      </div>
    );
  }
  return (
    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${categoryGradient[category] ?? defaultGradient} flex items-center justify-center flex-shrink-0`}>
      <FontAwesomeIcon icon={categoryIcon[category] ?? defaultCategoryIcon} className="w-5 h-5 text-white/80" />
    </div>
  );
}

export default function OrderCard({ order, onCancel }: OrderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const status = statusConfig[order.status];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-700">#{order.id}</span>
          <span className="text-gray-300 text-xs">•</span>
          <span className="text-xs text-gray-400">{formatDate(order.date)}</span>
        </div>
        <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${status.bg} ${status.color}`}>
          <FontAwesomeIcon icon={status.icon} className="w-3 h-3" />
          {status.label}
        </span>
      </div>

      {/* Items */}
      <div className="px-4 py-3 space-y-2">
        {(expanded ? order.items : order.items.slice(0, 1)).map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <ItemImage image={item.image} name={item.name} category={item.category} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 line-clamp-1">{item.name}</p>
              <p className="text-xs text-gray-400">
                x{item.qty} • {formatPrice(item.price)}
              </p>
            </div>
            <p className="text-sm font-bold text-[#1E2753] flex-shrink-0">{formatPrice(item.price * item.qty)}</p>
          </div>
        ))}

        {order.items.length > 1 && (
          <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-xs text-[#1E2753] font-medium hover:underline">
            <FontAwesomeIcon icon={expanded ? faChevronUp : faChevronDown} className="w-3 h-3" />
            {expanded ? "Sembunyikan" : `+${order.items.length - 1} produk lainnya`}
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs text-gray-400">Total Pembayaran</p>
          <p className="text-base font-bold text-[#1E2753]">{formatPrice(order.total)}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/user/orders/${order.id}`} className="px-3 py-2 border-2 border-[#1E2753] text-[#1E2753] rounded-xl text-xs font-semibold hover:bg-[#1E2753] hover:text-white transition-all">
            Lihat Detail
          </Link>

          {order.status === "Menunggu Konfirmasi" && (
            <button onClick={() => onCancel(order.id)} className="px-3 py-2 border-2 border-red-400 text-red-500 rounded-xl text-xs font-semibold hover:bg-red-500 hover:text-white transition-all">
              Batalkan
            </button>
          )}

          {order.status === "Selesai" && (
            <Link href="/user/dashboard-user" className="flex items-center gap-1.5 px-3 py-2 bg-[#1E2753] text-white rounded-xl text-xs font-semibold hover:bg-[#2a3470] transition-all">
              <FontAwesomeIcon icon={faRotateLeft} className="w-3 h-3" />
              Beli Lagi
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
