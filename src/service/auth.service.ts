import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail, signOut, onAuthStateChanged, getIdToken, User } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/config/firebase";
import { UserData } from "@/types/user";

const googleProvider = new GoogleAuthProvider();

// — Ambil role user dari Firestore
export const getUserRole = async (uid: string): Promise<"user" | "admin"> => {
  const snap = await getDoc(doc(db, "users", uid));
  if (snap.exists()) {
    return snap.data().role as "user" | "admin";
  }
  return "user";
};

// — Simpan token ke cookie
const saveTokenToCookie = async (user: User): Promise<void> => {
  const token = await getIdToken(user);
  document.cookie = `firebaseToken=${token}; path=/; max-age=3600; SameSite=Strict`;
};

// — Login email & password
export const loginWithEmail = async (email: string, password: string): Promise<{ user: User; role: "user" | "admin" }> => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  const role = await getUserRole(result.user.uid);
  await saveTokenToCookie(result.user);
  return { user: result.user, role };
};

// — Register email & password
export const registerWithEmail = async (nama: string, email: string, password: string): Promise<User> => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  const user = result.user;

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    nama: nama,
    email: user.email,
    role: "user",
    photoURL: "",
    createdAt: serverTimestamp(),
  });

  await saveTokenToCookie(user);
  return user;
};

// — Login Google
export const loginWithGoogle = async (): Promise<{
  user: User;
  role: "user" | "admin";
}> => {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      nama: user.displayName ?? "User",
      email: user.email,
      role: "user",
      photoURL: user.photoURL ?? "",
      createdAt: serverTimestamp(),
    });
  }

  const role = snap.exists() ? (snap.data().role as "user" | "admin") : "user";

  await saveTokenToCookie(user);
  return { user, role };
};

// — Reset password
export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

// — Logout
export const logout = async (): Promise<void> => {
  await signOut(auth);
  document.cookie = "firebaseToken=; path=/; max-age=0";
};

// — Ambil data user dari Firestore
export const getUserData = async (uid: string): Promise<UserData | null> => {
  const snap = await getDoc(doc(db, "users", uid));
  if (snap.exists()) return snap.data() as UserData;
  return null;
};

// — Observer auth state
export const onAuthChange = (callback: (user: User | null) => void): (() => void) => {
  return onAuthStateChanged(auth, callback);
};
