import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;

    const adminPaths = ['/dashboard', '/manage-menu', '/orders', '/reports', '/settings', '/toppings', '/api/admin'];
    const isTryingToAccessAdmin = adminPaths.some(path => req.nextUrl.pathname.startsWith(path));

    if (isTryingToAccessAdmin) {
      if (token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/member-login", // Default B2C login, tapi kalau admin ya ke /login
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/manage-menu/:path*",
    "/orders/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/toppings/:path*",
    "/api/admin/:path*",
  ],
};
