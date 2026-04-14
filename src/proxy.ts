import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("firebaseToken")?.value;

  const isUserRoute = pathname.startsWith("/user");
  const isAdminRoute = pathname.startsWith("/admin");
  const isAuthRoute = pathname === "/login" || pathname === "/register";

  // Belum login tapi akses halaman protected
  if ((isUserRoute || isAdminRoute) && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Sudah login tapi akses halaman login/register
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/user/dashboard-user", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/user/:path*", "/admin/:path*", "/login", "/register"],
};
