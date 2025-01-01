import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { cookies } from "next/headers"; // Import `cookies` to read cookies on the server

// Middleware to protect routes
export function middleware(request) {
  // Get the token from cookies
  const token = request.cookies.get("token")?.value; // This will access the cookies sent with the request

  // If no token is found and the user is trying to access a protected route
  if (!token && request.nextUrl.pathname.startsWith("/home")) {
    return NextResponse.redirect(new URL("/register", request.url)); // Redirect to login page
  }

  if (!token && request.nextUrl.pathname.startsWith("/articles")) {
    return NextResponse.redirect(new URL("/login", request.url)); // Redirect to register page
  }

  // If the user is authenticated, continue to the requested page
  return NextResponse.next();
}

// Define which paths to apply the middleware to
export const config = {
  matcher: ["/home", "/articles"], // Add other protected paths here
};
