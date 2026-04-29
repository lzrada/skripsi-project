import { db } from "@/config/firebase";
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, updateDoc, getDoc } from "firebase/firestore";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  condition: string;
  stock: number;
  image: string;
  qty: number;
}

export const subscribeToCartService = (uid: string, callback: (items: CartItem[]) => void) => {
  const q = query(collection(db, "users", uid, "cart"));

  return onSnapshot(q, (snap) => {
    const items: CartItem[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<CartItem, "id">),
    }));

    callback(items);
  });
};

export const addToCartService = async (uid: string, item: CartItem) => {
  const cartRef = doc(db, "users", uid, "cart", item.id);
  const productRef = doc(db, "products", item.id);

  const [cartSnap, productSnap] = await Promise.all([getDoc(cartRef), getDoc(productRef)]);

  const realStock: number = productSnap.exists() ? (productSnap.data().stock ?? 0) : item.stock;

  if (realStock <= 0) {
    throw new Error(`Stok "${item.name}" habis.`);
  }

  if (cartSnap.exists()) {
    const current = cartSnap.data() as CartItem;
    const newQty = current.qty + item.qty;

    if (newQty > realStock) {
      throw new Error(`Tidak bisa menambah. Stok tersisa ${realStock}, kamu sudah punya ${current.qty} di keranjang.`);
    }

    await updateDoc(cartRef, { qty: newQty });
  } else {
    const safeQty = Math.min(item.qty, realStock);

    await setDoc(cartRef, {
      id: item.id ?? "",
      name: item.name ?? "",
      price: item.price ?? 0,
      originalPrice: item.originalPrice ?? item.price ?? 0,
      category: item.category ?? "",
      condition: item.condition ?? "",
      stock: realStock,
      image: item.image ?? "",
      qty: safeQty,
    });
  }
};

export const updateCartQtyService = async (uid: string, productId: string, qty: number) => {
  const cartRef = doc(db, "users", uid, "cart", productId);
  const productRef = doc(db, "products", productId);

  const [cartSnap, productSnap] = await Promise.all([getDoc(cartRef), getDoc(productRef)]);

  if (!cartSnap.exists()) return;

  const realStock: number = productSnap.exists() ? (productSnap.data().stock ?? 0) : (cartSnap.data().stock ?? 99);

  const safeQty = Math.min(Math.max(qty, 1), realStock);

  await updateDoc(cartRef, { qty: safeQty });
};

export const removeFromCartService = async (uid: string, productId: string) => {
  await deleteDoc(doc(db, "users", uid, "cart", productId));
};

export const clearCartService = async (uid: string, productIds: string[]) => {
  await Promise.all(productIds.map((id) => deleteDoc(doc(db, "users", uid, "cart", id))));
};
