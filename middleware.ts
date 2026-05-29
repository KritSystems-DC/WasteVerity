import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = request.nextUrl;
  const redirectToLogin = () => {
    const callback = encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search);
    const loginPath = `/login?callbackUrl=${callback}`;
    return NextResponse.redirect(loginPath);
  };

  // Public paths
  const publicPaths = ["/", "/pricing", "/features", "/login", "/register", "/terms", "/privacy"];
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Admin paths
  if (pathname.startsWith("/admin")) {
    if (!token || (token as any).role !== "ADMIN") {
      return redirectToLogin();
    }
    return NextResponse.next();
  }

  // Protected paths (require auth)
  if (!token) {
    return redirectToLogin();
  }

  // Client paths (require businessId)
  if (pathname.startsWith("/dashboard") || 
      pathname.startsWith("/stock") ||
      pathname.startsWith("/suppliers") ||
      pathname.startsWith("/reorder") ||
      pathname.startsWith("/expiry") ||
      pathname.startsWith("/waste") ||
      pathname.startsWith("/staff-requests") ||
      pathname.startsWith("/reports") ||
      pathname.startsWith("/automation-logs") ||
      pathname.startsWith("/billing") ||
      pathname.startsWith("/settings")) {
    
    if (!token?.businessId) {
      return redirectToLogin();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};
