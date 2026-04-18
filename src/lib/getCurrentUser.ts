// lib/getCurrentUser.ts

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { UserData } from "@/types/user";

export const getCurrentUser = async (uid: string): Promise<UserData | null> => {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return null;
    }

    return userSnap.data() as UserData;
  } catch (error) {
    console.error("Error get current user:", error);
    return null;
  }
};
