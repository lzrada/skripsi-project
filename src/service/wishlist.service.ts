// src/service/wishlist.service.ts
// Wishlist disimpan di localStorage per uid agar tidak perlu koleksi Firestore tambahan.
// Kalau mau persist ke Firestore, bisa diganti dengan addDoc/deleteDoc ke koleksi "wishlists".

import { Product } from "./product.service";

const KEY = (uid: string) => `wishlist_${uid}`;

export function getWishlistIds(uid: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY(uid)) ?? "[]");
  } catch {
    return [];
  }
}

export function toggleWishlist(uid: string, productId: string): boolean {
  const ids = getWishlistIds(uid);
  const exists = ids.includes(productId);
  const updated = exists ? ids.filter((id) => id !== productId) : [...ids, productId];
  localStorage.setItem(KEY(uid), JSON.stringify(updated));
  return !exists; // true = ditambahkan, false = dihapus
}

export function isWishlisted(uid: string, productId: string): boolean {
  return getWishlistIds(uid).includes(productId);
}
