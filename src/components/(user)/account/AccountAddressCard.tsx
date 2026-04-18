import { UserData } from "@/types/user";

interface AccountAddressCardProps {
  user: UserData | null;
}

export default function AccountAddressCard({ user }: AccountAddressCardProps) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Address</h2>

        <button className="text-sm font-medium text-black hover:underline">Edit</button>
      </div>

      <div className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400">Province</p>
          <p className="mt-1 text-sm font-medium text-gray-900">{user?.address?.province || "-"}</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400">City</p>
          <p className="mt-1 text-sm font-medium text-gray-900">{user?.address?.city || "-"}</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400">District</p>
          <p className="mt-1 text-sm font-medium text-gray-900">{user?.address?.district || "-"}</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400">Postal Code</p>
          <p className="mt-1 text-sm font-medium text-gray-900">{user?.address?.postalCode || "-"}</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400">Detail Address</p>
          <p className="mt-1 text-sm font-medium text-gray-900">{user?.address?.detailAddress || "-"}</p>
        </div>
      </div>
    </div>
  );
}
