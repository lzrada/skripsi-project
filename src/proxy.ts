import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];

const PROTECTED_USER_ROUTES = ["/user/cart", "/user/wishlist", "/user/checkout", "/user/orders", "/user/account"];

const ADMIN_ROUTES = ["/admin"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("firebaseToken")?.value;
  const role = request.cookies.get("userRole")?.value;
  const uid = request.cookies.get("uid")?.value;

  const isLoggedIn = !!(token && uid);

  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isProtectedUserRoute = PROTECTED_USER_ROUTES.some((r) => pathname.startsWith(r));
  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r));

  if (!isLoggedIn && (isProtectedUserRoute || isAdminRoute)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isAuthRoute) {
    const destination = role === "admin" ? "/admin/dashboard-admin" : "/user/dashboard-user";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (isAdminRoute && role !== "admin") {
    return NextResponse.redirect(new URL("/user/dashboard-user", request.url));
  }

  const response = NextResponse.next();

  response.headers.set("X-Request-ID", crypto.randomUUID ? crypto.randomUUID() : `req-${Date.now()}`);

  return response;
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/forgot-password",
    "/user/cart/:path*",
    "/user/wishlist/:path*",
    "/user/checkout/:path*",
    "/user/orders/:path*",
    "/user/profile/:path*",
    "/user/account/:path*",
    "/admin/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
