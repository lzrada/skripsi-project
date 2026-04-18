import { auth, db } from "@/config/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithRedirect, getRedirectResult, sendPasswordResetEmail, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

// ── Helper: set kedua cookie sekaligus ──────────────────────────────
const setCookies = (token: string, role: string) => {
  document.cookie = `firebaseToken=${token}; path=/`;
  document.cookie = `userRole=${role}; path=/`;
};

// ── LOGIN — Email & Password ─────────────────────────────────────────
export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      throw { code: "auth/user-not-found-db", message: "User tidak ditemukan di database" };
    }

    const role = snap.data().role;
    if (!role) {
      throw { code: "auth/no-role", message: "Role user tidak ditemukan" };
    }

    const token = await user.getIdToken();
    setCookies(token, role);

    return { role };
  } catch (error: any) {
    console.log("LOGIN EMAIL ERROR:", error);
    throw error;
  }
};

// ── LOGIN — Google (Redirect) ────────────────────────────────────────
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
      throw { code: "auth/no-role", message: "Role tidak ditemukan" };
    }

    const token = await user.getIdToken();
    setCookies(token, role);

    return { success: true, role };
  } catch (error: any) {
    console.log("GOOGLE REDIRECT ERROR:", error);
    return { success: false };
  }
};

// ── REGISTER — Email & Password ──────────────────────────────────────
export const registerWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      role: "user",
      createdAt: serverTimestamp(),
    });

    // Logout setelah register, biar user login manual
    await signOut(auth);

    return { success: true };
  } catch (error: any) {
    console.log("REGISTER ERROR:", error);
    throw error;
  }
};

// ── RESET PASSWORD ───────────────────────────────────────────────────
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error: any) {
    console.log("RESET PASSWORD ERROR:", error);
    throw error;
  }
};

// ── LOGOUT ───────────────────────────────────────────────────────────
export const logout = async () => {
  try {
    await signOut(auth);
    document.cookie = "firebaseToken=; path=/; max-age=0";
    document.cookie = "userRole=; path=/; max-age=0";
  } catch (error: any) {
    console.log("LOGOUT ERROR:", error);
    throw error;
  }
};
