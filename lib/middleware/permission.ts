// middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { Role } from "@/types/permission";

// Define route access by role - ADMIN has access to ALL routes
const routePermissions: Record<string, Role[]> = {
  "/dashboard": [Role.ADMIN, Role.MANAGER, Role.EMPLOYEE],
  "/departments": [Role.ADMIN],
  "/departments/new": [Role.ADMIN],
  "/departments/edit": [Role.ADMIN],
  "/role-titles": [Role.ADMIN],
  "/role-titles/new": [Role.ADMIN],
  "/role-titles/edit": [Role.ADMIN],
  "/users": [Role.ADMIN],
  "/users/new": [Role.ADMIN],
  "/users/edit": [Role.ADMIN],
  "/leave-requests": [Role.ADMIN, Role.MANAGER, Role.EMPLOYEE],
  "/leave-requests/new": [Role.ADMIN, Role.MANAGER, Role.EMPLOYEE],
  "/leave-requests/edit": [Role.ADMIN, Role.MANAGER, Role.EMPLOYEE],
  "/leave-requests/team": [Role.ADMIN, Role.MANAGER],
  "/leave-requests/approve": [Role.ADMIN, Role.MANAGER],
  "/attendance": [Role.ADMIN, Role.MANAGER, Role.EMPLOYEE],
  "/attendance/team": [Role.ADMIN, Role.MANAGER],
  "/attendance/edit": [Role.ADMIN, Role.MANAGER],
  "/reports": [Role.ADMIN],
};

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // Allow access to auth pages
  if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Redirect to login if not authenticated
  if (!token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  const userRole = token.role as Role;

  // ADMIN has access to ALL routes
  if (userRole === Role.ADMIN) {
    return NextResponse.next();
  }

  // Check if route requires specific roles for non-admin users
  for (const [route, allowedRoles] of Object.entries(routePermissions)) {
    if (pathname.startsWith(route)) {
      if (!allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
