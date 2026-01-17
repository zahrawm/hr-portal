import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { auth } from "@clerk/nextjs/server";
import { verifyToken } from "@clerk/backend";
import connectDB from "../mongodb/connection";
import User from "../mongodb/models/Users";

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

// Type for the lean() result
interface LeanUser {
  _id: string;
  email: string;
  role: string[];
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
        token = authHeader.substring(7); // Remove "Bearer " prefix
        console.log("Token extracted with Bearer prefix");
      } else {
        token = authHeader; // Use raw token
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

        // Connect to database
        await connectDB();

        // Find user by Clerk ID
        const user = await User.findOne({ clerkId: clerkUserId })
          .select("email role")
          .lean<LeanUser>();

        if (!user) {
          console.log("User not found with Clerk ID:", clerkUserId);
          return {
            error: "User not found",
            status: 404,
          };
        }

        // Ensure roles is an array
        const userRoles = Array.isArray(user.role)
          ? user.role
          : user.role
          ? [user.role as unknown as string]
          : ["EMPLOYEE"];

        console.log("User authenticated via Clerk token:", {
          id: user._id.toString(),
          email: user.email,
          roles: userRoles,
        });

        return {
          user: {
            id: user._id.toString(),
            email: user.email,
            roles: userRoles,
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

        // Connect to database
        await connectDB();

        // Fetch user from database to get current roles
        const user = await User.findById(decoded.id)
          .select("email role")
          .lean<LeanUser>();

        if (!user) {
          console.log("User not found in database:", decoded.id);
          return {
            error: "User not found",
            status: 404,
          };
        }

        // Ensure roles is an array
        const userRoles = Array.isArray(user.role)
          ? user.role
          : user.role
          ? [user.role as unknown as string]
          : ["EMPLOYEE"];

        console.log("User authenticated successfully via JWT:", {
          id: decoded.id,
          email: user.email,
          roles: userRoles,
        });

        // Return authenticated user with roles from database
        return {
          user: {
            id: decoded.id,
            email: decoded.email,
            roles: userRoles,
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

        // Connect to database
        await connectDB();

        // Find user by Clerk ID
        const user = await User.findOne({ clerkId: userId })
          .select("email role")
          .lean<LeanUser>();

        if (!user) {
          console.log("User not found with Clerk ID:", userId);
          return {
            error: "User not found",
            status: 404,
          };
        }

        // Ensure roles is an array
        const userRoles = Array.isArray(user.role)
          ? user.role
          : user.role
          ? [user.role as unknown as string]
          : ["EMPLOYEE"];

        console.log("User authenticated via Clerk session:", {
          id: user._id.toString(),
          email: user.email,
          roles: userRoles,
        });

        return {
          user: {
            id: user._id.toString(),
            email: user.email,
            roles: userRoles,
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
