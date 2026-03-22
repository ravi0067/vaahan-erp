import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin routes: only SUPER_ADMIN allowed
    if (path.startsWith("/admin") && token?.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/leads/:path*",
    "/stock/:path*",
    "/bookings/:path*",
    "/sales/:path*",
    "/service/:path*",
    "/cashflow/:path*",
    "/expenses/:path*",
    "/reports/:path*",
    "/users/:path*",
    "/settings/:path*",
    "/customers/:path*",
    "/rto/:path*",
    "/admin/:path*",
  ],
};
