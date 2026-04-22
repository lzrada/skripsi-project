// src/components/(user)/account/AccountStats.tsx
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/config/firebase";
import { getWishlistIds } from "@/service/wishlist.service";

interface AccountStatsProps {
  uid: string;
}

export default function AccountStats({ uid }: AccountStatsProps) {
  const [ordersCount, setOrdersCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (!uid) return;

    const getStats = async () => {
      try {
        // Orders: ambil dari koleksi root "orders" filter by uid
        const ordersSnapshot = await getDocs(query(collection(db, "orders"), where("uid", "==", uid)));

        // Cart: sudah benar, ini memang subkoleksi di users/{uid}/cart
        const cartSnapshot = await getDocs(collection(db, "users", uid, "cart"));

        // Wishlist: disimpan di localStorage per arsitektur wishlist.service.ts
        const wishlistIds = getWishlistIds(uid);

        setOrdersCount(ordersSnapshot.size);
        setCartCount(cartSnapshot.size);
        setWishlistCount(wishlistIds.length);
      } catch (error) {
        console.error(error);
      }
    };

    getStats();
  }, [uid]);

  const stats = [
    { label: "Total Pesanan", value: ordersCount },
    { label: "Wishlist", value: wishlistCount },
    { label: "Item di Keranjang", value: cartCount },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {stats.map((s) => (
        <div key={s.label} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">{s.label}</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">{s.value}</h2>
        </div>
      ))}
    </div>
  );
}
