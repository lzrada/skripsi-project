"use client";

import { useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { CartItem } from "@/types/cart";
import { categoryGradient, defaultGradient } from "@/constants/category";
import { inventoryFirstCheck } from "@/constants/inventory";
import { formatPrice } from "@/lib/format";

interface Props {
  item: CartItem;
  isSelected: boolean;
  onToggle: () => void;
  onDeleteClick: () => void;
  onQtyChange: (type: "inc" | "dec") => Promise<void>;
}

export default function CartItemRow({ item, isSelected, onToggle, onDeleteClick, onQtyChange }: Props) {
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
            <button onClick={onDeleteClick} className="text-gray-300 hover:text-red-500 transition flex-shrink-0 p-1">
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
