import { db } from "@/config/firebase";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, serverTimestamp, runTransaction, where } from "firebase/firestore";
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
  couponCode?: string;
  diskonKupon?: number;
  couponId?: string;
  paymentStatus?: "paid" | "pending" | "unpaid";
  midtransResult?: Record<string, unknown>;
}

// ── Buat order baru (Inventory First) ────────────────────────────────────────
export const createOrderService = async (payload: CreateOrderPayload): Promise<string> => {
  return await runTransaction(db, async (transaction) => {
    const productRefs = payload.items.map((item) => doc(db, "products", item.id));
    const productSnaps = await Promise.all(productRefs.map((ref) => transaction.get(ref)));

    // Validasi stok semua produk sebelum buat order
    for (let i = 0; i < payload.items.length; i++) {
      const snap = productSnaps[i];
      const item = payload.items[i];
      if (!snap.exists()) throw new Error(`Produk "${item.name}" tidak ditemukan.`);
      const currentStock: number = snap.data().stock ?? 0;
      if (currentStock < item.qty) {
        throw new Error(`Stok "${item.name}" tidak mencukupi. Tersisa: ${currentStock}, diminta: ${item.qty}.`);
      }
    }

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
      stockDeducted: false,
      ...(payload.couponCode ? { couponCode: payload.couponCode, diskonKupon: payload.diskonKupon ?? 0 } : {}),
      ...(payload.paymentStatus ? { paymentStatus: payload.paymentStatus } : {}),
      ...(payload.midtransResult ? { midtransResult: payload.midtransResult } : {}),
    });

    // Kurangi stok hanya jika sudah paid
    if (payload.paymentStatus === "paid") {
      for (let i = 0; i < payload.items.length; i++) {
        const currentStock: number = productSnaps[i].data()!.stock;
        transaction.update(productRefs[i], { stock: currentStock - payload.items[i].qty });
      }
      transaction.update(orderRef, { stockDeducted: true });
    }

    return orderRef.id;
  });
};

// ── Kurangi stok setelah pembayaran dikonfirmasi ──────────────────────────────
export const deductStockOnPaymentService = async (orderId: string): Promise<void> => {
  await runTransaction(db, async (transaction) => {
    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await transaction.get(orderRef);
    if (!orderSnap.exists()) throw new Error("Pesanan tidak ditemukan.");

    const data = orderSnap.data();
    if (data.stockDeducted === true) return;

    const items: { id: string; qty: number }[] = data.items ?? [];
    for (const item of items) {
      const productRef = doc(db, "products", item.id);
      const productSnap = await transaction.get(productRef);
      if (productSnap.exists()) {
        const currentStock: number = productSnap.data().stock ?? 0;
        transaction.update(productRef, { stock: Math.max(currentStock - item.qty, 0) });
      }
    }
    transaction.update(orderRef, { stockDeducted: true });
  });
};

// ── Batalkan order + kembalikan stok ─────────────────────────────────────────
export const cancelOrderService = async (orderId: string): Promise<void> => {
  await runTransaction(db, async (transaction) => {
    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await transaction.get(orderRef);
    if (!orderSnap.exists()) throw new Error("Pesanan tidak ditemukan.");

    const orderData = orderSnap.data();
    if (orderData.status === "Selesai" || orderData.status === "Dibatalkan") {
      throw new Error("Pesanan tidak dapat dibatalkan.");
    }

    const items: { id: string; qty: number }[] = orderData.items ?? [];
    const wasDeducted: boolean = orderData.stockDeducted === true;

    if (wasDeducted) {
      for (const item of items) {
        const productRef = doc(db, "products", item.id);
        const productSnap = await transaction.get(productRef);
        if (productSnap.exists()) {
          const currentStock: number = productSnap.data().stock ?? 0;
          transaction.update(productRef, { stock: currentStock + item.qty });
        }
      }
    }

    transaction.update(orderRef, { status: "Dibatalkan" as OrderStatus, stockDeducted: false });
  });
};

// ── Batalkan order + refund Midtrans (untuk order yang sudah paid) ────────────
export const cancelAndRefundOrderService = async (orderId: string, midtransOrderId: string, total: number): Promise<void> => {
  // 1. Refund ke Midtrans dulu
  const res = await fetch("/api/midtrans", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId: midtransOrderId,
      amount: total,
      reason: "Pembatalan pesanan oleh pelanggan",
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error ?? "Gagal memproses refund ke Midtrans.");
  }

  // 2. Baru batalkan order di Firestore + kembalikan stok
  await cancelOrderService(orderId);
};

// ── Subscribe pesanan milik user ──────────────────────────────────────────────
export const subscribeToUserOrdersService = (uid: string, callback: (orders: Order[]) => void) => {
  const q = query(collection(db, "orders"), where("uid", "==", uid), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const orders: Order[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        uid: data.uid ?? "",
        date: data.date ?? "",
        status: data.status ?? "Menunggu Konfirmasi",
        items: data.items ?? [],
        total: data.total ?? 0,
        paymentMethod: data.paymentMethod ?? "",
        address: data.address ?? "",
        phone: data.phone ?? "",
        recipientName: data.recipientName ?? "",
        note: data.note,
        paymentStatus: data.paymentStatus,
        midtransResult: data.midtransResult,
      } as Order;
    });
    callback(orders);
  });
};

// ── Subscribe semua order (admin) ─────────────────────────────────────────────
export const subscribeToAllOrdersService = (callback: (orders: Order[]) => void) => {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const orders: Order[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        uid: data.uid ?? "",
        date: data.date ?? "",
        status: data.status ?? "Menunggu Konfirmasi",
        items: data.items ?? [],
        total: data.total ?? 0,
        paymentMethod: data.paymentMethod ?? "",
        address: data.address ?? "",
        phone: data.phone ?? "",
        recipientName: data.recipientName ?? "",
        note: data.note,
        paymentStatus: data.paymentStatus,
        midtransResult: data.midtransResult,
      } as Order;
    });
    callback(orders);
  });
};

// ── Update paymentStatus + kurangi stok jika paid ────────────────────────────
export const updatePaymentStatusService = async (orderId: string, paymentStatus: "paid" | "pending" | "unpaid"): Promise<void> => {
  const orderRef = doc(db, "orders", orderId);
  await updateDoc(orderRef, { paymentStatus });
  if (paymentStatus === "paid") await deductStockOnPaymentService(orderId);
};

// ── Update status order oleh admin ───────────────────────────────────────────
export const updateOrderStatusService = async (orderId: string, status: OrderStatus): Promise<void> => {
  const orderRef = doc(db, "orders", orderId);
  await updateDoc(orderRef, { status });
};

// ── Subscribe satu order by ID ────────────────────────────────────────────────
export const subscribeToOrderByIdService = (orderId: string, callback: (order: Order | null) => void) => {
  const orderRef = doc(db, "orders", orderId);
  return onSnapshot(orderRef, (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    const data = snap.data();
    callback({
      id: snap.id,
      uid: data.uid ?? "",
      date: data.date ?? "",
      status: data.status ?? "Menunggu Konfirmasi",
      items: data.items ?? [],
      total: data.total ?? 0,
      paymentMethod: data.paymentMethod ?? "",
      address: data.address ?? "",
      phone: data.phone ?? "",
      recipientName: data.recipientName ?? "",
      note: data.note ?? "",
      paymentStatus: data.paymentStatus,
      midtransResult: data.midtransResult,
    } as Order);
  });
};
