import { UserData } from "@/types/user";

interface AccountPersonalInfoProps {
  user: UserData | null;
}

export default function AccountPersonalInfo({ user }: AccountPersonalInfoProps) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>

        <button className="text-sm font-medium text-black hover:underline">Edit</button>
      </div>

      <div className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400">Full Name</p>
          <p className="mt-1 text-sm font-medium text-gray-900">{user?.fullName || "-"}</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400">Email</p>
          <p className="mt-1 text-sm font-medium text-gray-900">{user?.email || "-"}</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400">Phone Number</p>
          <p className="mt-1 text-sm font-medium text-gray-900">{user?.phoneNumber || "-"}</p>
        </div>
      </div>
    </div>
  );
}
