import AccountHeader from "@/components/(user)/account/AccountHeader";
import AccountProfileCard from "@/components/(user)/account/AccountProfileCard";
import AccountPersonalInfo from "@/components/(user)/account/AccountPersonalInfo";
import AccountAddressCard from "@/components/(user)/account/AccountAddressCard";
import AccountStats from "@/components/(user)/account/AccountStats";
import AccountDangerZone from "@/components/(user)/account/AccountDangerZone";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/getCurrentUser";

export default async function AccountPage() {
  const cookieStore = await cookies();
  const uid = cookieStore.get("uid")?.value;

  const user = uid ? await getCurrentUser(uid) : null;

  return (
    <div className="min-h-screen bg-[#f8f8f8] px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <AccountHeader />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4 xl:col-span-3">
            <AccountProfileCard user={user} />
          </div>

          <div className="flex flex-col gap-6 lg:col-span-8 xl:col-span-9">
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <AccountPersonalInfo user={user} />
              <AccountAddressCard user={user} />
            </div>

            <AccountStats uid={uid || ""} />

            <AccountDangerZone uid={uid || ""} />
          </div>
        </div>
      </div>
    </div>
  );
}
