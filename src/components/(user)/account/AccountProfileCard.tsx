import { UserData } from "@/types/user";

interface AccountProfileCardProps {
  user: UserData | null;
}

export default function AccountProfileCard({ user }: AccountProfileCardProps) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col items-center text-center">
        {user?.photoURL ? (
          <img src={user.photoURL} alt={user.fullName} className="h-24 w-24 rounded-full object-cover" />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-black text-3xl font-bold text-white">{user?.fullName?.charAt(0) || "U"}</div>
        )}

        <h2 className="mt-4 text-xl font-semibold text-gray-900">{user?.fullName || "User"}</h2>

        <p className="mt-1 text-sm text-gray-500">{user?.email || "-"}</p>

        <div className="mt-4 rounded-full bg-green-100 px-4 py-1 text-xs font-medium text-green-700">Active Account</div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <button className="rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:opacity-90">Edit Profile</button>

        <button className="rounded-2xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100">Change Password</button>
      </div>
    </div>
  );
}
