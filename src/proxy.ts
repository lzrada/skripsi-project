import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("firebaseToken")?.value;
  const role = request.cookies.get("userRole")?.value;

  const authRoutes = ["/login", "/register", "/forgot-password"];

  const protectedRoutes = ["/user/cart", "/user/wishlist", "/user/checkout", "/user/orders", "/user/profile", "/user/account", "/user/dashboard-user", "/admin"];

  const isAuthRoute = authRoutes.includes(pathname);

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  const isAdminRoute = pathname.startsWith("/admin");

  // Belum login tapi akses halaman protected
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Sudah login tapi buka halaman login/register
  if (isAuthRoute && token) {
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard-admin", request.url));
    }

    return NextResponse.redirect(new URL("/user/dashboard-user", request.url));
  }

  // Bukan admin tapi coba akses halaman admin
  if (isAdminRoute && role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/forgot-password", "/user/cart/:path*", "/user/wishlist/:path*", "/user/checkout/:path*", "/user/orders/:path*", "/user/profile/:path*", "/user/account/:path*", "/admin/:path*"],
};
