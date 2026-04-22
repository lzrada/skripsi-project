// src/service/wishlist.service.ts
const KEY = (uid: string) => `wishlist_${uid}`;

// Custom event agar komponen lain bisa reaktif saat wishlist berubah
const dispatch = () => window.dispatchEvent(new Event("wishlistUpdated"));

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
  dispatch(); // notify semua listener
  return !exists;
}

export function isWishlisted(uid: string, productId: string): boolean {
  return getWishlistIds(uid).includes(productId);
}
