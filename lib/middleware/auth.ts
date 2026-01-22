// src/lib/middleware/auth.ts
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { auth } from "@clerk/nextjs/server";
import { verifyToken } from "@clerk/backend";

interface DecodedToken {
  id: string;
  email: string;
  roles?: string[];
  role?: string[];
  type?: string;
}

interface AuthResult {
  user?: {
    id: string;
    email: string;
    roles: string[];
  };
  error?: string;
  status: number;
}

export async function authenticate(req: NextRequest): Promise<AuthResult> {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get("Authorization");
    console.log("=== AUTH DEBUG ===");
    console.log("Auth header present:", authHeader ? "YES" : "NO");

    // Handle both "Bearer token" and raw token formats
    let token: string | null = null;
    if (authHeader) {
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
        console.log("Token extracted from Bearer");
      } else {
        token = authHeader;
        console.log("Token extracted without Bearer");
      }
    }

    // If we have a token, try to verify it
    if (token && token.trim() !== "") {
      console.log("Token length:", token.length);
      console.log("Token first 30 chars:", token.substring(0, 30) + "...");

      // Try JWT verification first (for normal signup users)
      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not defined");
        return {
          error: "Server configuration error",
          status: 500,
        };
      }

      try {
        console.log("Attempting JWT verification...");
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET,
        ) as DecodedToken;
        console.log("JWT verified successfully for user:", decoded.id);

        // Check if it's a refresh token (shouldn't be used for API calls)
        if (decoded.type === "refresh") {
          console.log("Refresh token used for API call - rejecting");
          return {
            error: "Invalid token type",
            status: 401,
          };
        }

        // Ensure roles is an array
        const userRoles = decoded.roles || decoded.role || ["EMPLOYEE"];
        const rolesArray = Array.isArray(userRoles) ? userRoles : [userRoles];

        console.log("User authenticated via JWT:", {
          id: decoded.id,
          email: decoded.email,
          roles: rolesArray,
        });

        return {
          user: {
            id: decoded.id,
            email: decoded.email,
            roles: rolesArray,
          },
          status: 200,
        };
      } catch (jwtError: any) {
        console.log("JWT verification failed:", jwtError.message);

        // Try Clerk token verification as fallback
        try {
          console.log("Attempting Clerk token verification...");

          if (!process.env.CLERK_SECRET_KEY) {
            console.log(
              "CLERK_SECRET_KEY not set, skipping Clerk verification",
            );
            throw new Error("No Clerk secret key");
          }

          const verifiedToken = await verifyToken(token, {
            secretKey: process.env.CLERK_SECRET_KEY,
          });

          const clerkUserId = verifiedToken.sub;
          console.log("Clerk token verified for user:", clerkUserId);

          return {
            user: {
              id: clerkUserId,
              email: (verifiedToken.email as string) || "",
              roles: ["EMPLOYEE"],
            },
            status: 200,
          };
        } catch (clerkError: any) {
          console.log("Clerk verification also failed:", clerkError.message);
          return {
            error: "Invalid or expired token",
            status: 401,
          };
        }
      }
    }

    // No Authorization header, try Clerk session as fallback
    console.log("No Authorization header, trying Clerk session...");
    try {
      const { userId } = await auth();

      if (userId) {
        console.log("Clerk session found, userId:", userId);

        return {
          user: {
            id: userId,
            email: "",
            roles: ["EMPLOYEE"],
          },
          status: 200,
        };
      }
    } catch (clerkError) {
      console.log("Clerk session check failed");
    }

    console.log("No valid authentication found");
    return {
      error: "Authentication required",
      status: 401,
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return {
      error: "Authentication failed",
      status: 500,
    };
  }
}

// Helper function to check if user has required role
export function hasRole(userRoles: string[], requiredRoles: string[]): boolean {
  return requiredRoles.some((role) =>
    userRoles.map((r) => r.toUpperCase()).includes(role.toUpperCase()),
  );
}
