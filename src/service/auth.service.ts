import { auth, db } from "@/config/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const COOKIE_BASE = `path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
const COOKIE_OPTIONS = process.env.NODE_ENV === "production" ? `${COOKIE_BASE}; Secure` : COOKIE_BASE;

function setCookies(token: string, role: string, uid: string) {
  if (typeof document === "undefined") return;
  document.cookie = `firebaseToken=${token}; ${COOKIE_OPTIONS}`;
  document.cookie = `userRole=${role}; ${COOKIE_OPTIONS}`;
  document.cookie = `uid=${uid}; ${COOKIE_OPTIONS}`;
}

function clearCookies() {
  if (typeof document === "undefined") return;
  const clear = "path=/; max-age=0; SameSite=Lax";
  document.cookie = `firebaseToken=; ${clear}`;
  document.cookie = `userRole=; ${clear}`;
  document.cookie = `uid=; ${clear}`;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validatePassword(password: string): boolean {
  return password.length >= 8;
}

function waitForCookieFlush(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 150));
}

export const loginWithEmail = async (email: string, password: string) => {
  if (!validateEmail(email)) {
    throw { code: "auth/invalid-email-format", message: "Format email tidak valid" };
  }
  if (!password) {
    throw { code: "auth/missing-password", message: "Password wajib diisi" };
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const user = userCredential.user;

    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      await signOut(auth);
      throw { code: "auth/user-not-found-db", message: "Data user tidak ditemukan" };
    }

    const role = snap.data().role;
    if (!role) {
      await signOut(auth);
      throw { code: "auth/no-role", message: "Hak akses user tidak ditemukan" };
    }

    const token = await user.getIdToken();
    setCookies(token, role, user.uid);
    await waitForCookieFlush();

    return { role };
  } catch (error: any) {
    if (process.env.NODE_ENV !== "production") {
      console.error("LOGIN EMAIL ERROR:", error);
    }
    throw error;
  }
};

export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope("email");
    provider.addScope("profile");
    provider.setCustomParameters({ prompt: "select_account" });

    const result = await signInWithPopup(auth, provider);
    return await _processGoogleUser(result.user);
  } catch (error: any) {
    if (error?.code === "auth/popup-closed-by-user" || error?.code === "auth/cancelled-popup-request") {
      return null;
    }
    if (process.env.NODE_ENV !== "production") {
      console.error("GOOGLE LOGIN ERROR:", error);
    }
    throw error;
  }
};


async function _processGoogleUser(user: any) {
  const userRef = doc(db, "users", user.uid);
  let snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      fullName: user.displayName ?? "",
      photoURL: user.photoURL ?? "",
      role: "user",
      address: {
        province: "",
        city: "",
        district: "",
        postalCode: "",
        detailAddress: "",
      },
      createdAt: serverTimestamp(),
    });
    snap = await getDoc(userRef);
  }

  const role = snap.data()?.role;
  if (!role) {
    await signOut(auth);
    throw { code: "auth/no-role", message: "Role tidak ditemukan" };
  }

  const token = await user.getIdToken(true);
  setCookies(token, role, user.uid);
  await waitForCookieFlush();

  return { success: true, role };
}

export const registerWithEmail = async (email: string, password: string, fullName: string, phoneNumber: string) => {
  if (!validateEmail(email)) {
    throw { code: "auth/invalid-email-format", message: "Format email tidak valid" };
  }
  if (!validatePassword(password)) {
    throw { code: "auth/weak-password", message: "Password minimal 8 karakter" };
  }
  if (!fullName.trim()) {
    throw { code: "auth/missing-name", message: "Nama lengkap wajib diisi" };
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      role: "user",
      photoURL: "",
      address: {
        province: "",
        city: "",
        district: "",
        postalCode: "",
        detailAddress: "",
      },
      createdAt: serverTimestamp(),
    });

    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    if (process.env.NODE_ENV !== "production") {
      console.error("REGISTER ERROR:", error);
    }
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  if (!validateEmail(email)) {
    throw { code: "auth/invalid-email-format", message: "Format email tidak valid" };
  }
  try {
    await sendPasswordResetEmail(auth, email.trim());
    return { success: true };
  } catch (error: any) {
    if (process.env.NODE_ENV !== "production") {
      console.error("RESET PASSWORD ERROR:", error);
    }
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    clearCookies();
  } catch (error: any) {
    clearCookies();
    if (process.env.NODE_ENV !== "production") {
      console.error("LOGOUT ERROR:", error);
    }
    throw error;
  }
};
