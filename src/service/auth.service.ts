import { auth, db } from "@/config/firebase";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const token = await user.getIdToken();
    document.cookie = `firebaseToken=${token}; path=/`;

    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      throw {
        code: "auth/user-not-found-db",
        message: "User tidak ditemukan di database",
      };
    }

    const role = snap.data().role;
    if (!role) {
      throw {
        code: "auth/no-role",
        message: "Role user tidak ditemukan",
      };
    }

    return { role };
  } catch (error: any) {
    console.log("LOGIN EMAIL ERROR:", error);
    throw error;
  }
};

export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  } catch (error: any) {
    console.log("GOOGLE LOGIN ERROR:", error);
    throw error;
  }
};

export const handleGoogleRedirect = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (!result) return null;

    const user = result.user;

    const token = await user.getIdToken();
    document.cookie = `firebaseToken=${token}; path=/`;

    const userRef = doc(db, "users", user.uid);
    let snap = await getDoc(userRef);

    if (!snap.exists()) {
      await setDoc(userRef, {
        email: user.email,
        role: "user",
        createdAt: new Date(),
      });

      snap = await getDoc(userRef);
    }

    const role = snap.data()?.role;

    if (!role) {
      throw {
        code: "auth/no-role",
        message: "Role tidak ditemukan",
      };
    }

    return {
      success: true,
      role,
    };
  } catch (error: any) {
    console.log("GOOGLE REDIRECT ERROR:", error);
    return { success: false };
  }
};
