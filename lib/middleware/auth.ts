import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
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
    console.log("Full auth header:", authHeader);

    if (!authHeader) {
      console.log("No Authorization header found");
      return {
        error: "Authorization header missing",
        status: 401,
      };
    }

    // Handle both "Bearer token" and raw token formats
    let token: string;
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7); // Remove "Bearer " prefix
      console.log("Token extracted with Bearer prefix");
    } else {
      token = authHeader; // Use raw token
      console.log("Token extracted without Bearer prefix");
    }

    if (!token || token.trim() === "") {
      console.log("Token is empty after extraction");
      return {
        error: "Token is required",
        status: 401,
      };
    }

    console.log("Token (first 30 chars):", token.substring(0, 30) + "...");

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined");
      return {
        error: "Server configuration error",
        status: 500,
      };
    }

    // Verify token
    let decoded: DecodedToken;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET) as DecodedToken;
      console.log("Token decoded successfully:", {
        id: decoded.id,
        email: decoded.email,
        roles: decoded.roles || decoded.role,
      });
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError);
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

    console.log("User authenticated successfully:", {
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
