"use client";

import { deleteDoc, doc } from "firebase/firestore";
import { deleteUser } from "firebase/auth";
import { auth, db } from "@/config/firebase";
import { useRouter } from "next/navigation";

interface AccountDangerZoneProps {
  uid: string;
}

export default function AccountDangerZone({ uid }: AccountDangerZoneProps) {
  const router = useRouter();

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this account?");

    if (!confirmDelete) return;

    try {
      const currentUser = auth.currentUser;

      if (!currentUser) return;

      await deleteDoc(doc(db, "users", uid));
      await deleteUser(currentUser);

      router.push("/register");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="rounded-3xl border border-red-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>

          <p className="mt-1 text-sm text-gray-500">Delete your account permanently. This action cannot be undone.</p>
        </div>

        <button onClick={handleDeleteAccount} className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-700">
          Delete Account
        </button>
      </div>
    </div>
  );
}
