// middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { Role } from "@/types/permission";

// Define route access by role - ADMIN has access to ALL routes
const routePermissions: Record<string, Role[]> = {
  "/dashboard": [Role.ADMIN, Role.MANAGER, Role.EMPLOYEE],
  "/departments/new": [Role.ADMIN],
  "/departments/edit": [Role.ADMIN],
  "/departments": [Role.ADMIN],
  "/role-titles/new": [Role.ADMIN],
  "/role-titles/edit": [Role.ADMIN],
  "/role-titles": [Role.ADMIN],
  "/users/new": [Role.ADMIN],
  "/users/edit": [Role.ADMIN],
  "/users": [Role.ADMIN],
  "/leave-requests/new": [Role.ADMIN, Role.MANAGER, Role.EMPLOYEE],
  "/leave-requests/edit": [Role.ADMIN, Role.MANAGER, Role.EMPLOYEE],
  "/leave-requests/team": [Role.ADMIN, Role.MANAGER],
  "/leave-requests/approve": [Role.ADMIN, Role.MANAGER],
  "/leave-requests": [Role.ADMIN, Role.MANAGER, Role.EMPLOYEE],
  "/attendance/team": [Role.ADMIN, Role.MANAGER],
  "/attendance/edit": [Role.ADMIN, Role.MANAGER],
  "/attendance": [Role.ADMIN, Role.MANAGER, Role.EMPLOYEE],
  "/reports": [Role.ADMIN],
};

interface DecodedToken {
  id: string;
  phone_number: string;
  roles?: string[];
  role?: string | string[];
  type?: string;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to auth pages and API routes
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  // Get token from Authorization header or cookie
  const authHeader = request.headers.get("Authorization");
  const cookieToken = request.cookies.get("token")?.value;

  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : cookieToken;

  // Redirect to login if not authenticated
  if (!token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;

    // Check if it's a refresh token (shouldn't be used for page access)
    if (decoded.type === "refresh") {
      const url = new URL("/login", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }

    // Get user roles as an array - handle both 'roles' and 'role' properties
    let userRoles: string[] = [];

    if (decoded.roles) {
      userRoles = Array.isArray(decoded.roles)
        ? decoded.roles
        : [decoded.roles];
    } else if (decoded.role) {
      userRoles = Array.isArray(decoded.role)
        ? decoded.role
        : [decoded.role as string];
    }

    console.log("Middleware - User roles:", userRoles);
    console.log("Middleware - Accessing:", pathname);
    console.log("Middleware - Decoded token:", {
      id: decoded.id,
      roles: userRoles,
    });

    // ADMIN has access to ALL routes
    if (userRoles.some((role) => role.toUpperCase() === Role.ADMIN)) {
      return NextResponse.next();
    }

    // Sort routes by length (longest first) to match most specific routes first
    const sortedRoutes = Object.entries(routePermissions).sort(
      ([routeA], [routeB]) => routeB.length - routeA.length
    );

    // Check if route requires specific roles for non-admin users
    for (const [route, allowedRoles] of sortedRoutes) {
      if (pathname.startsWith(route)) {
        // Check if user has ANY of the allowed roles (case-insensitive)
        const hasAccess = userRoles.some((userRole) =>
          allowedRoles.some(
            (allowedRole) =>
              userRole.toUpperCase() === allowedRole.toUpperCase()
          )
        );

        console.log("Middleware - Route:", route);
        console.log("Middleware - Allowed roles:", allowedRoles);
        console.log("Middleware - Has access:", hasAccess);

        if (!hasAccess) {
          return NextResponse.redirect(new URL("/unauthorized", request.url));
        }
        return NextResponse.next();
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware auth error:", error);
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
