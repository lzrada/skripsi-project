import { db } from "@/config/firebase";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, serverTimestamp, runTransaction, where } from "firebase/firestore";
import { Order, OrderStatus } from "@/types/order";

// Tambah di interface CreateOrderPayload:
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
  couponCode?: string;
  diskonKupon?: number;
  couponId?: string;
  paymentStatus?: "pending" | "paid" | "failed";
  midtransResult?: any;
}

export const createOrderService = async (payload: CreateOrderPayload): Promise<string> => {
  return await runTransaction(db, async (transaction) => {
    // 1. Baca stok semua produk terlebih dahulu
    const productRefs = payload.items.map((item) => doc(db, "products", item.id));
    const productSnaps = await Promise.all(productRefs.map((ref) => transaction.get(ref)));

    // 2. Validasi stok
    for (let i = 0; i < payload.items.length; i++) {
      const snap = productSnaps[i];
      const item = payload.items[i];
      if (!snap.exists()) {
        throw new Error(`Produk "${item.name}" tidak ditemukan.`);
      }
      const currentStock: number = snap.data().stock ?? 0;
      if (currentStock < item.qty) {
        throw new Error(`Stok "${item.name}" tidak mencukupi. Tersisa: ${currentStock}, diminta: ${item.qty}.`);
      }
    }

    // 3. Buat dokumen order
    // 3. Buat dokumen order
    const orderRef = doc(collection(db, "orders"));
    transaction.set(orderRef, {
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
      ...(payload.couponCode
        ? {
            couponCode: payload.couponCode,
            diskonKupon: payload.diskonKupon ?? 0,
          }
        : {}),
    });

    // 4. Kurangi stok tiap produk
    for (let i = 0; i < payload.items.length; i++) {
      const snap = productSnaps[i];
      const item = payload.items[i];
      const currentStock: number = snap.data()!.stock;
      transaction.update(productRefs[i], { stock: currentStock - item.qty });
    }

    return orderRef.id;
  });
};

/**
 * Subscribe realtime ke pesanan milik user tertentu.
 * Pakai where() agar hanya data milik uid yang dikirim — lebih aman & efisien.
 */
export const subscribeToUserOrdersService = (uid: string, callback: (orders: Order[]) => void) => {
  const q = query(collection(db, "orders"), where("uid", "==", uid), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const orders: Order[] = snap.docs.map((d) => {
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
    });
    callback(orders);
  });
};

/**
 * Batalkan order DAN kembalikan stok produk secara atomik.
 */
export const cancelOrderService = async (orderId: string): Promise<void> => {
  await runTransaction(db, async (transaction) => {
    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await transaction.get(orderRef);

    if (!orderSnap.exists()) throw new Error("Pesanan tidak ditemukan.");

    const orderData = orderSnap.data();
    const currentStatus: OrderStatus = orderData.status;

    if (currentStatus === "Selesai" || currentStatus === "Dibatalkan") {
      throw new Error("Pesanan tidak dapat dibatalkan.");
    }

    const items: { id: string; qty: number; name: string }[] = orderData.items ?? [];

    // Kembalikan stok tiap produk
    for (const item of items) {
      const productRef = doc(db, "products", item.id);
      const productSnap = await transaction.get(productRef);
      if (productSnap.exists()) {
        const currentStock: number = productSnap.data().stock ?? 0;
        transaction.update(productRef, { stock: currentStock + item.qty });
      }
    }

    transaction.update(orderRef, { status: "Dibatalkan" as OrderStatus });
  });
};
