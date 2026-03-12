import { NextResponse, NextRequest } from "next/server";

export default function middleware(request: NextRequest) {
  console.log("middleware activated for request:", request.url);
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Example: Add custom header for admin routes
    const response = NextResponse.next();
    response.headers.set("x-admin", "true");
    return response;
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/user/:path*", "/admin/:path*"],
};
