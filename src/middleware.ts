import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = ["/dashboard", "/products", "/sales", "/settings", "/credits", "/tables"];
const ADMIN_PATHS = ["/overview", "/tenants", "/subscriptions", "/analytics"];
const TOKEN_COOKIE = "vendia_token";
const ROLE_COOKIE = "vendia_role";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const role = request.cookies.get(ROLE_COOKIE)?.value;

  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  const isAdmin = ADMIN_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if ((isProtected || isAdmin) && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdmin && role !== "super_admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname === "/login" && token) {
    const dest = role === "super_admin" ? "/overview" : "/dashboard";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/products/:path*",
    "/sales/:path*",
    "/settings/:path*",
    "/credits/:path*",
    "/tables/:path*",
    "/overview/:path*",
    "/tenants/:path*",
    "/subscriptions/:path*",
    "/analytics/:path*",
    "/login",
  ],
};
