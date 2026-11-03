import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { Role } from "@/types";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({
    req,
    secret:
      process.env.NEXTAUTH_SECRET ||
      "class-deadline-hub-ptit-secret-super-key-2026",
  });

  const isAuth = !!token;
  const userRole = (token?.role as Role) || "guest";

  if (!isAuth) {
    const callbackUrl = encodeURIComponent(
      req.nextUrl.pathname + req.nextUrl.search,
    );
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, req.url),
    );
  }

  if (pathname.startsWith("/admin")) {
    if (userRole !== "admin") {
      return NextResponse.redirect(new URL("/403", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
