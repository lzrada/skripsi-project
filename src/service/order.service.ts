// src/service/order.service.ts
import { db } from "@/config/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  serverTimestamp,
  runTransaction,
  where,
} from "firebase/firestore";
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
  /**
   * "paid"   → pembayaran selesai (Midtrans success / COD confirmed)
   * "pending" → menunggu konfirmasi Midtrans
   * "unpaid" → COD, belum dibayar
   */
  paymentStatus?: "paid" | "pending" | "unpaid";
  midtransResult?: Record<string, unknown>;
}

/**
 * Buat order baru dengan algoritma Inventory First (sesuai skripsi).
 *
 * FIX KRUSIAL: Stok hanya dikurangi apabila paymentStatus === "paid".
 * Untuk COD ("unpaid") stok dikurangi saat admin konfirmasi pengiriman,
 * sehingga tidak ada stok yang terhapus oleh order yang belum lunas.
 *
 * Catatan: untuk Midtrans "pending" stok juga tidak dikurangi dulu —
 * webhook/admin harus memanggil deductStockOnPaymentService setelah paid.
 */
export const createOrderService = async (
  payload: CreateOrderPayload
): Promise<string> => {
  return await runTransaction(db, async (transaction) => {
    // 1. Baca stok semua produk
    const productRefs = payload.items.map((item) =>
      doc(db, "products", item.id)
    );
    const productSnaps = await Promise.all(
      productRefs.map((ref) => transaction.get(ref))
    );

    // ==================== ALGORITMA INVENTORY FIRST ====================
    // Validasi stok sebelum transaksi diproses (sesuai skripsi Bab III 3.7.3)
    for (let i = 0; i < payload.items.length; i++) {
      const snap = productSnaps[i];
      const item = payload.items[i];

      if (!snap.exists()) {
        throw new Error(`Produk "${item.name}" tidak ditemukan.`);
      }

      const currentStock: number = snap.data().stock ?? 0;

      // Inventory First: hanya izinkan jika stok tersedia
      if (currentStock < item.qty) {
        throw new Error(
          `Stok "${item.name}" tidak mencukupi. Tersisa: ${currentStock}, diminta: ${item.qty}.`
        );
      }
    }
    // ===================================================================

    // 2. Buat dokumen order
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
      stockDeducted: false, // flag untuk mencegah double-deduct
      ...(payload.couponCode
        ? {
            couponCode: payload.couponCode,
            diskonKupon: payload.diskonKupon ?? 0,
          }
        : {}),
      ...(payload.paymentStatus
        ? { paymentStatus: payload.paymentStatus }
        : {}),
      ...(payload.midtransResult
        ? { midtransResult: payload.midtransResult }
        : {}),
    });

    // 3. Kurangi stok HANYA jika pembayaran sudah lunas (paid)
    //    FIX: sebelumnya stok selalu dikurangi termasuk COD/pending
    if (payload.paymentStatus === "paid") {
      for (let i = 0; i < payload.items.length; i++) {
        const snap = productSnaps[i];
        const item = payload.items[i];
        const currentStock: number = snap.data()!.stock;
        transaction.update(productRefs[i], {
          stock: currentStock - item.qty,
        });
      }
      // Update flag stockDeducted
      transaction.update(orderRef, { stockDeducted: true });
    }

    return orderRef.id;
  });
};

/**
 * Kurangi stok setelah pembayaran dikonfirmasi (paid).
 * Dipanggil oleh admin atau webhook Midtrans setelah status berubah jadi paid.
 * Menggunakan flag stockDeducted untuk mencegah double-deduct.
 */
export const deductStockOnPaymentService = async (
  orderId: string
): Promise<void> => {
  await runTransaction(db, async (transaction) => {
    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await transaction.get(orderRef);

    if (!orderSnap.exists()) throw new Error("Pesanan tidak ditemukan.");

    const data = orderSnap.data();

    // Cegah double-deduct
    if (data.stockDeducted === true) return;

    const items: { id: string; qty: number; name: string }[] =
      data.items ?? [];

    for (const item of items) {
      const productRef = doc(db, "products", item.id);
      const productSnap = await transaction.get(productRef);
      if (productSnap.exists()) {
        const currentStock: number = productSnap.data().stock ?? 0;
        const newStock = Math.max(currentStock - item.qty, 0);
        transaction.update(productRef, { stock: newStock });
      }
    }

    transaction.update(orderRef, { stockDeducted: true });
  });
};

/**
 * Subscribe realtime ke pesanan milik user tertentu.
 */
export const subscribeToUserOrdersService = (
  uid: string,
  callback: (orders: Order[]) => void
) => {
  const q = query(
    collection(db, "orders"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc")
  );
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
      } as Order;
    });
    callback(orders);
  });
};

/**
 * Batalkan order DAN kembalikan stok (hanya jika stok sudah pernah dikurangi).
 */
export const cancelOrderService = async (orderId: string): Promise<void> => {
  await runTransaction(db, async (transaction) => {
    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await transaction.get(orderRef);

    if (!orderSnap.exists()) throw new Error("Pesanan tidak ditemukan.");

    const orderData = orderSnap.data();
    const currentStatus: OrderStatus = orderData.status;

    if (
      currentStatus === "Selesai" ||
      currentStatus === "Dibatalkan"
    ) {
      throw new Error("Pesanan tidak dapat dibatalkan.");
    }

    const items: { id: string; qty: number; name: string }[] =
      orderData.items ?? [];
    const wasDeducted: boolean = orderData.stockDeducted === true;

    // Kembalikan stok hanya jika sudah pernah dikurangi
    if (wasDeducted) {
      for (const item of items) {
        const productRef = doc(db, "products", item.id);
        const productSnap = await transaction.get(productRef);
        if (productSnap.exists()) {
          const currentStock: number = productSnap.data().stock ?? 0;
          transaction.update(productRef, {
            stock: currentStock + item.qty,
          });
        }
      }
    }

    transaction.update(orderRef, {
      status: "Dibatalkan" as OrderStatus,
      stockDeducted: false,
    });
  });
};

/**
 * Subscribe realtime ke SEMUA order — untuk admin dashboard.
 */
export const subscribeToAllOrdersService = (
  callback: (orders: Order[]) => void
) => {
  const q = query(
    collection(db, "orders"),
    orderBy("createdAt", "desc")
  );
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
      } as Order;
    });
    callback(orders);
  });
};

/**
 * Update paymentStatus order. Jika menjadi "paid", kurangi stok otomatis.
 */
export const updatePaymentStatusService = async (
  orderId: string,
  paymentStatus: "paid" | "pending" | "unpaid"
): Promise<void> => {
  const orderRef = doc(db, "orders", orderId);
  await updateDoc(orderRef, { paymentStatus });

  // Jika dibayar, kurangi stok (jika belum dikurangi)
  if (paymentStatus === "paid") {
    await deductStockOnPaymentService(orderId);
  }
};

/**
 * Update status order oleh admin.
 */
export const updateOrderStatusService = async (
  orderId: string,
  status: OrderStatus
): Promise<void> => {
  try {
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, { status });
  } catch (error) {
    console.error("updateOrderStatusService Error:", error);
    throw error;
  }
};

/**
 * Subscribe realtime ke satu order berdasarkan ID.
 */
export const subscribeToOrderByIdService = (
  orderId: string,
  callback: (order: Order | null) => void
) => {
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
    } as Order);
  });
};
