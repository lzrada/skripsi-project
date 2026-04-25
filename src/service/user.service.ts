import { db, auth } from "@/config/firebase";
import { doc, updateDoc, getDoc, getDocs, collection, query, where, deleteDoc } from "firebase/firestore";
import { deleteUser } from "firebase/auth";
import { UserData } from "@/types/user";

// ── Update foto & nama profil ─────────────────────────────────────────────────
export const updateUserProfileService = async (uid: string, data: { fullName: string; photoURL: string }): Promise<void> => {
  try {
    await updateDoc(doc(db, "users", uid), {
      fullName: data.fullName.trim(),
      photoURL: data.photoURL.trim(),
    });
  } catch (error) {
    console.error("updateUserProfileService Error:", error);
    throw error;
  }
};

// ── Update data pribadi user ──────────────────────────────────────────────────
export const updateUserPersonalInfoService = async (uid: string, data: { fullName: string; phoneNumber: string }): Promise<void> => {
  try {
    await updateDoc(doc(db, "users", uid), {
      fullName: data.fullName.trim(),
      phoneNumber: data.phoneNumber.trim(),
    });
  } catch (error) {
    console.error("updateUserPersonalInfoService Error:", error);
    throw error;
  }
};

// ── Update alamat user ────────────────────────────────────────────────────────
export const updateUserAddressService = async (
  uid: string,
  address: {
    province: string;
    city: string;
    district: string;
    postalCode: string;
    detailAddress: string;
  },
): Promise<void> => {
  try {
    await updateDoc(doc(db, "users", uid), {
      address: {
        province: address.province.trim(),
        city: address.city.trim(),
        district: address.district.trim(),
        postalCode: address.postalCode.trim(),
        detailAddress: address.detailAddress.trim(),
      },
    });
  } catch (error) {
    console.error("updateUserAddressService Error:", error);
    throw error;
  }
};

// ── Ambil jumlah orders, cart, dan wishlist untuk stats ──────────────────────
export const getUserStatsService = async (uid: string, getWishlistIds: (uid: string) => string[]): Promise<{ ordersCount: number; cartCount: number; wishlistCount: number }> => {
  try {
    const [ordersSnap, cartSnap] = await Promise.all([getDocs(query(collection(db, "orders"), where("uid", "==", uid))), getDocs(collection(db, "users", uid, "cart"))]);
    const wishlistIds = getWishlistIds(uid);
    return {
      ordersCount: ordersSnap.size,
      cartCount: cartSnap.size,
      wishlistCount: wishlistIds.length,
    };
  } catch (error) {
    console.error("getUserStatsService Error:", error);
    return { ordersCount: 0, cartCount: 0, wishlistCount: 0 };
  }
};

// ── Hapus akun user secara permanen ──────────────────────────────────────────
export const deleteUserAccountService = async (uid: string): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("User tidak ditemukan.");
    await deleteDoc(doc(db, "users", uid));
    await deleteUser(currentUser);
  } catch (error) {
    console.error("deleteUserAccountService Error:", error);
    throw error;
  }
};
