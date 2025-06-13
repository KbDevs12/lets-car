import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    if (pathname.startsWith("/admin")) {
      if (!token?.role || !["admin", "owner"].includes(token.role as string)) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        if (!pathname.startsWith("/admin")) {
          return !!token;
        }

        return !!token && ["admin", "owner"].includes(token?.role as string);
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*"],
};
