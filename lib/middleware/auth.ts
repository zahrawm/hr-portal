import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import User, { IUser } from "@/lib/models/user";
import connectDB from "@/lib/db";

interface DecodedToken {
  id: string;
  phone_number: string;
  roles?: string[];
  type?: string;
}

interface AuthResult {
  user?: {
    id: string;
    phone_number: string;
    roles: string[];
  };
  error?: string;
  status: number;
}

// Type for the lean() result
interface LeanUser {
  _id: string;
  phone_number: string;
  roles?: string[];
}

export async function authenticate(req: NextRequest): Promise<AuthResult> {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get("Authorization");

    console.log("=== AUTH MIDDLEWARE DEBUG ===");
    console.log("Auth header:", authHeader?.substring(0, 30) + "...");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("No Bearer token found");
      return {
        error: "Authorization header missing or invalid",
        status: 401,
      };
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    if (!token) {
      console.log("Token is empty after removing Bearer prefix");
      return {
        error: "Token is required",
        status: 401,
      };
    }

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
        phone: decoded.phone_number,
        roles: decoded.roles,
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
      .select("phone_number roles")
      .lean<LeanUser>(); // ✅ Add type assertion

    if (!user) {
      console.log("User not found in database:", decoded.id);
      return {
        error: "User not found",
        status: 404,
      };
    }

    // Ensure roles is an array
    const userRoles = Array.isArray(user.roles)
      ? user.roles
      : user.roles
      ? [user.roles as unknown as string]
      : ["field-agent"];

    console.log("User found:", { id: decoded.id, roles: userRoles });

    // Return authenticated user with roles from database
    return {
      user: {
        id: decoded.id,
        phone_number: decoded.phone_number,
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
    userRoles.map((r) => r.toLowerCase()).includes(role.toLowerCase())
  );
}
