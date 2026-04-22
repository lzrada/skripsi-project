// src/components/ui/CategoryGrid.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTv } from "@fortawesome/free-solid-svg-icons";
import { BsFillSpeakerFill } from "react-icons/bs";
import { GiWashingMachine } from "react-icons/gi";
import { PiFan } from "react-icons/pi";
import { RiFridgeFill } from "react-icons/ri";
import { TbAirConditioning } from "react-icons/tb";
import { subscribeToProductsService } from "@/service/product.service";

const CATEGORIES = [
  { name: "Televisi", icon: <FontAwesomeIcon icon={faTv} className="text-2xl" /> },
  { name: "Kulkas", icon: <RiFridgeFill className="text-2xl" /> },
  { name: "AC", icon: <TbAirConditioning className="text-2xl" /> },
  { name: "Mesin Cuci", icon: <GiWashingMachine className="text-2xl" /> },
  { name: "Kipas Angin", icon: <PiFan className="text-2xl" /> },
  { name: "Audio", icon: <BsFillSpeakerFill className="text-2xl" /> },
];

export default function CategoryGrid() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    // Pakai subscribe yang sama dengan dashboard — tidak ada double-fetch
    const unsub = subscribeToProductsService((products) => {
      const map: Record<string, number> = {};
      for (const p of products) {
        if (p.stock > 0) {
          map[p.category] = (map[p.category] ?? 0) + 1;
        }
      }
      setCounts(map);
    });
    return () => unsub();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">Kategori Produk</h2>
        {/* ✅ Fix: link ke halaman produk */}
        <Link href="/user/products" className="text-sm text-[#1E2753] font-semibold hover:underline">
          Lihat Semua
        </Link>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {CATEGORIES.map((cat) => (
          // ✅ Fix: link ke products dengan filter kategori
          <Link
            key={cat.name}
            href={`/user/products?category=${encodeURIComponent(cat.name)}`}
            className="group flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-gray-100 hover:border-[#1E2753] hover:shadow-md transition-all duration-200"
          >
            <span className="text-2xl group-hover:scale-125 transition-transform duration-200 text-[#1E2753]">{cat.icon}</span>
            <span className="text-xs text-gray-600 font-medium text-center group-hover:text-[#1E2753]">{cat.name}</span>
            {/* ✅ Fix: count dari Firestore bukan hardcode */}
            <span className="text-[10px] text-gray-400">{counts[cat.name] ?? 0} produk</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
