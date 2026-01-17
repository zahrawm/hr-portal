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
    console.log("=== AUTH MIDDLEWARE DEBUG ===");
    console.log("Full auth header:", authHeader ? "Present" : "Missing");

    // Handle both "Bearer token" and raw token formats
    let token: string | null = null;
    if (authHeader) {
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
        console.log("Token extracted with Bearer prefix");
      } else {
        token = authHeader;
        console.log("Token extracted without Bearer prefix");
      }
    }

    // If we have a token, determine if it's a Clerk token or JWT token
    if (token && token.trim() !== "") {
      console.log("Token (first 30 chars):", token.substring(0, 30) + "...");

      // Try to verify as Clerk token first
      try {
        console.log("Attempting to verify as Clerk token...");

        if (!process.env.CLERK_SECRET_KEY) {
          console.log(
            "CLERK_SECRET_KEY not found, skipping Clerk verification"
          );
          throw new Error("No Clerk secret key");
        }

        const verifiedToken = await verifyToken(token, {
          secretKey: process.env.CLERK_SECRET_KEY,
        });

        const clerkUserId = verifiedToken.sub;
        console.log("Clerk token verified successfully, userId:", clerkUserId);

        // For Clerk users, return their Clerk ID as the user ID
        // The email is in the token claims
        const userEmail = (verifiedToken.email as string) || "";

        console.log("User authenticated via Clerk token:", {
          id: clerkUserId,
          email: userEmail,
          roles: ["EMPLOYEE"], // Default role for Clerk users
        });

        return {
          user: {
            id: clerkUserId,
            email: userEmail,
            roles: ["EMPLOYEE"],
          },
          status: 200,
        };
      } catch (clerkError: any) {
        console.log(
          "Clerk token verification failed, trying JWT:",
          clerkError.message
        );

        // Not a Clerk token, try JWT verification
        if (!process.env.JWT_SECRET) {
          console.error("JWT_SECRET is not defined");
          return {
            error: "Server configuration error",
            status: 500,
          };
        }

        // Verify JWT token
        let decoded: DecodedToken;
        try {
          decoded = jwt.verify(token, process.env.JWT_SECRET) as DecodedToken;
          console.log("JWT token decoded successfully:", {
            id: decoded.id,
            email: decoded.email,
            roles: decoded.roles || decoded.role,
          });
        } catch (jwtError) {
          console.error("JWT verification also failed:", jwtError);
          return {
            error: "Invalid or expired token",
            status: 401,
          };
        }

        // Check if it's a refresh token (shouldn't be used for API calls)
        if (decoded.type === "refresh") {
          console.log("Refresh token used for API call");
          return {
            error: "Invalid token type",
            status: 401,
          };
        }

        // Ensure roles is an array
        const userRoles = decoded.roles || decoded.role || ["EMPLOYEE"];
        const rolesArray = Array.isArray(userRoles) ? userRoles : [userRoles];

        console.log("User authenticated successfully via JWT:", {
          id: decoded.id,
          email: decoded.email,
          roles: rolesArray,
        });

        // Return authenticated user
        return {
          user: {
            id: decoded.id,
            email: decoded.email,
            roles: rolesArray,
          },
          status: 200,
        };
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
            email: "", // Email not available from session
            roles: ["EMPLOYEE"],
          },
          status: 200,
        };
      }
    } catch (clerkError) {
      console.log("Clerk session authentication failed:", clerkError);
    }

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
    userRoles.map((r) => r.toUpperCase()).includes(role.toUpperCase())
  );
}
