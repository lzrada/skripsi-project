import { db } from "@/config/firebase";
import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, getDocs, getDoc, where, serverTimestamp, Timestamp } from "firebase/firestore";

export interface Coupon {
  id: string;
  code: string; // e.g. "RIZKY50"
  discount: number; // nilai diskon dalam rupiah
  minOrder: number; // minimal belanja agar kupon berlaku
  maxUsage: number; // 0 = unlimited
  usedCount: number; // berapa kali sudah dipakai
  isActive: boolean;
  expiresAt: string | null; // ISO string atau null jika tidak ada expiry
  createdAt?: any;
}

export interface AddCouponPayload {
  code: string;
  discount: number;
  minOrder: number;
  maxUsage: number;
  isActive: boolean;
  expiresAt: string | null;
}

// ── Subscribe realtime semua kupon (untuk admin) ──────────────────────────────
export const subscribeToCouponsService = (callback: (coupons: Coupon[]) => void) => {
  const q = query(collection(db, "coupons"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const coupons: Coupon[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        code: data.code ?? "",
        discount: data.discount ?? 0,
        minOrder: data.minOrder ?? 0,
        maxUsage: data.maxUsage ?? 0,
        usedCount: data.usedCount ?? 0,
        isActive: data.isActive ?? true,
        expiresAt: data.expiresAt ?? null,
        createdAt: data.createdAt ?? null,
      };
    });
    callback(coupons);
  });
};

// ── Validasi kupon dari user (cek code, aktif, belum expired, belum habis) ────
export const validateCouponService = async (code: string, orderTotal: number): Promise<{ valid: true; coupon: Coupon } | { valid: false; message: string }> => {
  const q = query(collection(db, "coupons"), where("code", "==", code.toUpperCase().trim()));
  const snap = await getDocs(q);

  if (snap.empty) return { valid: false, message: "Kode kupon tidak ditemukan." };

  const d = snap.docs[0];
  const data = d.data();
  const coupon: Coupon = {
    id: d.id,
    code: data.code,
    discount: data.discount ?? 0,
    minOrder: data.minOrder ?? 0,
    maxUsage: data.maxUsage ?? 0,
    usedCount: data.usedCount ?? 0,
    isActive: data.isActive ?? true,
    expiresAt: data.expiresAt ?? null,
  };

  if (!coupon.isActive) return { valid: false, message: "Kupon ini sudah tidak aktif." };

  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return { valid: false, message: "Kupon ini sudah kadaluarsa." };
  }

  if (coupon.maxUsage > 0 && coupon.usedCount >= coupon.maxUsage) {
    return { valid: false, message: "Kupon ini sudah mencapai batas pemakaian." };
  }

  if (orderTotal < coupon.minOrder) {
    return {
      valid: false,
      message: `Minimum belanja ${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(coupon.minOrder)} untuk memakai kupon ini.`,
    };
  }

  return { valid: true, coupon };
};

// ── Increment usedCount setelah order berhasil ────────────────────────────────
export const incrementCouponUsageService = async (couponId: string) => {
  const ref = doc(db, "coupons", couponId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const current = snap.data().usedCount ?? 0;
  await updateDoc(ref, { usedCount: current + 1 });
};

// ── Admin CRUD ────────────────────────────────────────────────────────────────
export const addCouponService = async (payload: AddCouponPayload) => {
  return await addDoc(collection(db, "coupons"), {
    ...payload,
    code: payload.code.toUpperCase().trim(),
    usedCount: 0,
    createdAt: serverTimestamp(),
  });
};

export const updateCouponService = async (id: string, payload: Partial<AddCouponPayload>) => {
  await updateDoc(doc(db, "coupons", id), {
    ...payload,
    ...(payload.code ? { code: payload.code.toUpperCase().trim() } : {}),
  });
};

export const deleteCouponService = async (id: string) => {
  await deleteDoc(doc(db, "coupons", id));
};

export const toggleCouponActiveService = async (id: string, isActive: boolean) => {
  await updateDoc(doc(db, "coupons", id), { isActive });
};
