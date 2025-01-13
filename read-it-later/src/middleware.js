import { NextResponse } from "next/server";

// Middleware to protect routes
export function middleware(request) {
  // Get the token from cookies
  const token = request.cookies.get("token")?.value; // This will access the cookies sent with the request

  const { pathname } = request.nextUrl; // Get the pathname for simplicity

  // Redirect unauthenticated users trying to access protected routes
  if (!token && pathname.startsWith("/home")) {
    return NextResponse.redirect(new URL("/register", request.url));
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

  // Redirect unauthenticated users trying to access articles
  if (!token && pathname.startsWith("/articles")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Allow access to the requested page if no conditions match
  return NextResponse.next();
}

// Define which paths to apply the middleware to
export const config = {
  matcher: ["/home", "/articles", "/login", "/register", "/"], // Add other protected paths here
};
