import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies();
  const role = cookieStore.get("userRole")?.value;

  if (role === "admin") {
    redirect("/admin/dashboard-admin");
  }

  redirect("/user/dashboard-user");
}
