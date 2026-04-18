"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/config/firebase";

interface AccountStatsProps {
  uid: string;
}

export default function AccountStats({ uid }: AccountStatsProps) {
  const [ordersCount, setOrdersCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const getStats = async () => {
      try {
        const ordersSnapshot = await getDocs(collection(db, "users", uid, "orders"));

        const wishlistSnapshot = await getDocs(collection(db, "users", uid, "wishlist"));

        const cartSnapshot = await getDocs(collection(db, "users", uid, "cart"));

        setOrdersCount(ordersSnapshot.size);
        setWishlistCount(wishlistSnapshot.size);
        setCartCount(cartSnapshot.size);
      } catch (error) {
        console.error(error);
      }
    };

    if (uid) {
      getStats();
    }
  }, [uid]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">Total Orders</p>
        <h2 className="mt-2 text-3xl font-bold text-gray-900">{ordersCount}</h2>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">Wishlist Items</p>
        <h2 className="mt-2 text-3xl font-bold text-gray-900">{wishlistCount}</h2>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">Cart Items</p>
        <h2 className="mt-2 text-3xl font-bold text-gray-900">{cartCount}</h2>
      </div>
    </div>
  );
}
