import { NextResponse } from "next/server";

// Middleware to protect routes
export function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const publicPaths = ["/login", "/register", "/favicon.ico", "/api", "/_next"];

  // Skip middleware for public paths
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users trying to access protected routes
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect authenticated users from root ("/") to "/home"
  if (token && pathname === "/") {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // Redirect authenticated users trying to access login or register pages
  if (
    token &&
    (pathname.startsWith("/login") || pathname.startsWith("/register"))
  ) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

// Define which paths to apply the middleware to
export const config = {
  matcher: ["/home", "/articles", "/login", "/register", "/"], // Add other protected paths here
};
