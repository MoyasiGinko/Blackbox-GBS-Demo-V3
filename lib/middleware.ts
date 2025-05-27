// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, JWTPayload } from "jose";

// Configuration for protected and public routes
const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/admin",
  "/services",
  "/subscriptions",
  "/payments",
];

const publicRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

const adminRoutes = ["/admin"];

// JWT secret (should be in environment variables)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key"
);

interface AuthPayload extends JWTPayload {
  user_id: number;
  email: string;
  role?: string;
  permissions?: string[];
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Get auth tokens from cookies
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // If accessing public route while authenticated, redirect to dashboard
  if (isPublicRoute && accessToken) {
    try {
      await jwtVerify(accessToken, JWT_SECRET);
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } catch (error) {
      // Token invalid, continue to public route
    }
  }

  // If accessing protected route
  if (isProtectedRoute) {
    if (!accessToken) {
      return redirectToLogin(request);
    }

    try {
      const { payload } = (await jwtVerify(accessToken, JWT_SECRET)) as {
        payload: AuthPayload;
      };

      // Check admin access
      if (isAdminRoute && payload.role !== "admin") {
        return new NextResponse("Forbidden", { status: 403 });
      }

      // Add user info to request headers for use in components
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-id", payload.user_id.toString());
      requestHeaders.set("x-user-email", payload.email);
      requestHeaders.set("x-user-role", payload.role || "user");

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      console.error("JWT verification failed:", error);

      // Try to refresh token
      if (refreshToken) {
        try {
          const refreshResponse = await refreshAccessToken(
            refreshToken,
            request
          );
          if (refreshResponse) {
            return refreshResponse;
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
        }
      }

      return redirectToLogin(request);
    }
  }

  return NextResponse.next();
}

async function refreshAccessToken(refreshToken: string, request: NextRequest) {
  try {
    // Call your refresh endpoint
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      }
    );

    if (!response.ok) {
      throw new Error("Refresh failed");
    }

    const data = await response.json();
    const { access_token, refresh_token: newRefreshToken, expires_in } = data;

    // Create response with new tokens
    const nextResponse = NextResponse.next();

    // Set new access token cookie
    nextResponse.cookies.set("access_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: expires_in,
      path: "/",
    });

    // Set new refresh token cookie if provided
    if (newRefreshToken) {
      nextResponse.cookies.set("refresh_token", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      });
    }

    return nextResponse;
  } catch (error) {
    console.error("Token refresh error:", error);
    return null;
  }
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", request.nextUrl.pathname);

  // Clear auth cookies
  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete("access_token");
  response.cookies.delete("refresh_token");

  return response;
}

// Matcher configuration
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

// Utility functions for server components
export function getServerAuthInfo(request: NextRequest) {
  return {
    userId: request.headers.get("x-user-id"),
    userEmail: request.headers.get("x-user-email"),
    userRole: request.headers.get("x-user-role"),
  };
}
