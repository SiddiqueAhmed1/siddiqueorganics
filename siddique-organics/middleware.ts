import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "siddique_organics_fallback_secret_key_2026",
);

/**
 * Next.js Middleware to intercept and secure all dashboard routes dynamically.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Retrieve the session token from the secure HTTP-Only cookie
  const sessionToken = request.cookies.get("session")?.value;

  // Protect all dashboard routes starting with /admin
  if (pathname.startsWith("/admin")) {
    // If no session exists, instantly redirect to the custom login screen
    if (!sessionToken) {
      return NextResponse.redirect(new URL("/admin-siddique", request.url));
    }

    try {
      // Cryptographically verify the session token using Edge-compatible jose runtime
      await jwtVerify(sessionToken, SECRET_KEY);
      return NextResponse.next();
    } catch (error) {
      console.error("Middleware JWT verification failure:", error);

      // Clear compromised/expired cookie session and bounce back to login
      const response = NextResponse.redirect(
        new URL("/admin-siddique", request.url),
      );
      response.cookies.delete("session");
      return response;
    }
  }

  // Prevent logged-in users from accessing the login screen unnecessarily
  if (pathname === "/admin-siddique" && sessionToken) {
    try {
      await jwtVerify(sessionToken, SECRET_KEY);
      return NextResponse.redirect(new URL("/admin", request.url));
    } catch {
      // If token is invalid, let them stay on the login page to re-authenticate
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

/**
 * Configure explicit path matchers to prevent running middleware on static assets.
 */
export const config = {
  matcher: ["/admin/:path*", "/admin-siddique"],
};
