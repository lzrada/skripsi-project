export interface UserData {
  uid: string;
  nama: string;
  email: string | null;
  role: "user" | "admin";
  photoURL: string;
  createdAt: unknown;
}
