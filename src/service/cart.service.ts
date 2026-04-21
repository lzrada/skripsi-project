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
  const ref = doc(db, "users", uid, "cart", item.id);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const current = snap.data() as CartItem;

    await updateDoc(ref, {
      qty: current.qty + item.qty,
    });
  } else {
    await setDoc(ref, {
      id: item.id ?? "",
      name: item.name ?? "",
      price: item.price ?? 0,
      originalPrice: item.originalPrice ?? item.price ?? 0,
      category: item.category ?? "",
      condition: item.condition ?? "",
      stock: item.stock ?? 0,
      image: item.image ?? "",
      qty: item.qty ?? 1,
    });
  }
};

export const updateCartQtyService = async (uid: string, productId: string, qty: number) => {
  await updateDoc(doc(db, "users", uid, "cart", productId), {
    qty,
  });
};

export const removeFromCartService = async (uid: string, productId: string) => {
  await deleteDoc(doc(db, "users", uid, "cart", productId));
};

export const clearCartService = async (uid: string, productIds: string[]) => {
  await Promise.all(productIds.map((id) => deleteDoc(doc(db, "users", uid, "cart", id))));
};
