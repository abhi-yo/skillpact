import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Public routes that don't require authentication
const publicPaths = [
  "/",
  "/about",
  "/login",
  "/terms-of-service",
  "/privacy-policy",
  "/community-guidelines",
  "/api/auth/*",
  "/api/trpc/*", // tRPC routes are protected internally
];

const isPublicPath = (path: string) => {
  return publicPaths.some((publicPath) => {
    // Static Path
    if (!publicPath.includes("*")) {
      return path === publicPath;
    }
    // Wildcard Path
    return path.startsWith(publicPath.replace("*", ""));
  });
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow access to static assets without authentication
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/fonts") ||
    pathname.startsWith("/images") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".svg")
  ) {
    return NextResponse.next();
  }

  // Allow access to public paths without authentication
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Check for session token cookie (database sessions)
  const sessionToken = req.cookies.get("next-auth.session-token")?.value;

  // Redirect to login if not authenticated
  if (!sessionToken) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
