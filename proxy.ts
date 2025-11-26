import { NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_REDIRECT_PATH,
  DEFAULT_RESTRICTED_REDIRECT_PATH,
  RESTRICTED_PATHS
} from "./utils/constants";

/**
 * Middleware to handle authentication-based route protection
 * - Redirects authenticated users away from auth pages (login/signup)
 * - Redirects unauthenticated users to login for protected routes
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if user has a valid refresh token cookie
  const refreshTokenCookie = request.cookies.get("refreshToken");
  const isAuthenticated = refreshTokenCookie?.value && refreshTokenCookie.value.trim() !== "";
  
  // Check if current path is an auth page (login/signup)
  const isAuthPage = RESTRICTED_PATHS.includes(pathname);
  
  // If user is authenticated and trying to access auth pages, redirect to home
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL(DEFAULT_REDIRECT_PATH, request.url));
  }
  
  // If user is not authenticated and trying to access protected routes, redirect to logins
  if (!isAuthenticated && !isAuthPage) {
    return NextResponse.redirect(new URL(DEFAULT_RESTRICTED_REDIRECT_PATH, request.url));
  }
  
  // Allow the request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next|.*\\.(?:ico|png|jpg|jpeg|svg|css|js|woff|woff2|ttf|map|json|txt|mp3|wav|ogg)).*)",
  ],
};