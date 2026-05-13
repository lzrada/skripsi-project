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

    const data = userSnap.data();
    const createdAtField = data.createdAt as any;
    const createdAt = createdAtField
      ? typeof createdAtField?.toDate === "function"
        ? createdAtField.toDate().toISOString()
        : typeof createdAtField === "object" && typeof createdAtField.seconds === "number"
          ? new Date(createdAtField.seconds * 1000).toISOString()
          : createdAtField
      : undefined;

    return { uid, ...data, createdAt } as UserData;
  } catch (error) {
    console.error("Error get current user:", error);
    return null;
  }
};
