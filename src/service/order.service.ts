import { db } from "@/config/firebase";
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Order, OrderStatus } from "@/types/order";

export interface CreateOrderPayload {
  uid: string;
  recipientName: string;
  phone: string;
  address: string;
  kota: string;
  kodePos: string;
  note: string;
  paymentMethod: string;
  items: { id: string; name: string; price: number; qty: number; category: string }[];
  total: number;
}

export const createOrderService = async (payload: CreateOrderPayload): Promise<string> => {
  const ref = await addDoc(collection(db, "orders"), {
    uid: payload.uid,
    recipientName: payload.recipientName,
    phone: payload.phone,
    address: `${payload.address}, ${payload.kota} ${payload.kodePos}`.trim(),
    note: payload.note,
    paymentMethod: payload.paymentMethod,
    items: payload.items,
    total: payload.total,
    status: "Menunggu Konfirmasi" as OrderStatus,
    date: new Date().toISOString(),
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const subscribeToUserOrdersService = (uid: string, callback: (orders: Order[]) => void) => {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const orders: Order[] = snap.docs
      .map((d) => {
        const data = d.data();
        return {
          id: d.id,
          date: data.date ?? "",
          status: data.status ?? "Menunggu Konfirmasi",
          items: data.items ?? [],
          total: data.total ?? 0,
          paymentMethod: data.paymentMethod ?? "",
          address: data.address ?? "",
          phone: data.phone ?? "",
          recipientName: data.recipientName ?? "",
          note: data.note,
        } as Order;
      })
      .filter((o) => (snap.docs.find((d) => d.id === o.id)?.data().uid ?? "") === uid);
    callback(orders);
  });
};

export const cancelOrderService = async (orderId: string) => {
  await updateDoc(doc(db, "orders", orderId), { status: "Dibatalkan" as OrderStatus });
};
