// src/lib/middleware/auth.ts
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { auth } from "@clerk/nextjs/server";
import { verifyToken } from "@clerk/backend";
import { clerkClient } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb/connection";
import User from "@/lib/mongodb/models/Users";

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

// ✅ Helper function to sync Clerk user to MongoDB
// async function syncClerkUserToMongoDB(clerkUserId: string, email: string) {
//   try {
//     await connectDB();

//     // Check if user already exists
//     let existingUser = await User.findOne({ clerkId: clerkUserId });

//     if (existingUser) {
//       console.log(`✅ User already exists in MongoDB: ${clerkUserId}`);
//       return existingUser;
//     }

//     console.log(`🔄 Clerk user NOT found in MongoDB, creating: ${clerkUserId}`);

//     // Fetch full user details from Clerk
//     let clerkUser;
//     try {
//       const client = await clerkClient();
//       clerkUser = await client.users.getUser(clerkUserId);
//       console.log(`📥 Fetched Clerk user details:`, {
//         id: clerkUser.id,
//         email: clerkUser.emailAddresses[0]?.emailAddress,
//         name: `${clerkUser.firstName} ${clerkUser.lastName}`,
//       });
//     } catch (clerkError) {
//       console.error(
//         `❌ Failed to fetch Clerk user ${clerkUserId}:`,
//         clerkError
//       );
//       // If can't fetch from Clerk, create with minimal info
//       const newUser = await User.create({
//         clerkId: clerkUserId,
//         name: "Clerk User",
//         email: email || "no-email@clerk.user",
//         role: ["EMPLOYEE"],
//         department: "Not Assigned",
//         jobTitle: "Not Assigned",
//         isActive: true,
//       });
//       console.log(`⚠️ Created user with minimal info: ${clerkUserId}`);
//       return newUser;
//     }

//     // Create user in MongoDB with Clerk details
//     const newUser = await User.create({
//       clerkId: clerkUserId,
//       name:
//         `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
//         "Clerk User",
//       email:
//         email ||
//         clerkUser.emailAddresses[0]?.emailAddress ||
//         "no-email@clerk.user",
//       role: ["EMPLOYEE"],
//       department: "Not Assigned",
//       jobTitle: "Not Assigned",
//       isActive: true,
//     });

//     console.log(`✅ Successfully created Clerk user in MongoDB:`, {
//       _id: newUser._id,
//       clerkId: newUser.clerkId,
//       name: newUser.name,
//       email: newUser.email,
//     });

//     return newUser;
//   } catch (error) {
//     console.error("❌ Critical error syncing Clerk user to MongoDB:", error);
//     return null;
//   }
// }
// src/lib/middleware/auth.ts - UPDATE THE syncClerkUserToMongoDB function

// ✅ Helper function to sync Clerk user to MongoDB
async function syncClerkUserToMongoDB(clerkUserId: string, email: string) {
  try {
    await connectDB();

    // Check if user already exists by clerkId
    let existingUser = await User.findOne({ clerkId: clerkUserId });

    if (existingUser) {
      console.log(`✅ User already exists in MongoDB: ${clerkUserId}`);
      return existingUser;
    }

    console.log(`🔄 Clerk user NOT found in MongoDB, creating: ${clerkUserId}`);

    // Fetch full user details from Clerk
    let clerkUser;
    try {
      const client = await clerkClient();
      clerkUser = await client.users.getUser(clerkUserId);
      console.log(`📥 Fetched Clerk user details:`, {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        name: `${clerkUser.firstName} ${clerkUser.lastName}`,
      });
    } catch (clerkError) {
      console.error(
        `❌ Failed to fetch Clerk user ${clerkUserId}:`,
        clerkError
      );

      // ✅ NEW: Try to find and link existing user by email before giving up
      if (email) {
        const existingByEmail = await User.findOne({ email });
        if (existingByEmail) {
          console.log(`🔗 Found existing user with email, linking Clerk ID...`);
          existingByEmail.clerkId = clerkUserId;
          await existingByEmail.save();
          return existingByEmail;
        }
      }

      // If can't fetch from Clerk and no existing user, create with minimal info
      const newUser = await User.create({
        clerkId: clerkUserId,
        name: "Clerk User",
        email: email || "no-email@clerk.user",
        role: ["EMPLOYEE"],
        department: "Not Assigned",
        jobTitle: "Not Assigned",
        isActive: true,
      });
      console.log(`⚠️ Created user with minimal info: ${clerkUserId}`);
      return newUser;
    }

    const clerkEmail =
      email ||
      clerkUser.emailAddresses[0]?.emailAddress ||
      "no-email@clerk.user";

    // ✅ FIXED: Check if user exists by email and update instead of creating duplicate
    const existingUserByEmail = await User.findOne({ email: clerkEmail });

    if (existingUserByEmail) {
      console.log(
        `🔗 Found existing user with same email, linking Clerk ID...`
      );

      // Update the existing user to add clerkId
      existingUserByEmail.clerkId = clerkUserId;

      // Optionally update name if Clerk has better info
      const clerkName = `${clerkUser.firstName || ""} ${
        clerkUser.lastName || ""
      }`.trim();
      if (clerkName && clerkName !== "Clerk User") {
        existingUserByEmail.name = clerkName;
      }

      await existingUserByEmail.save();

      console.log(`✅ Successfully linked Clerk ID to existing user:`, {
        _id: existingUserByEmail._id,
        clerkId: existingUserByEmail.clerkId,
        name: existingUserByEmail.name,
        email: existingUserByEmail.email,
      });

      return existingUserByEmail;
    }

    // Create user in MongoDB with Clerk details only if email doesn't exist
    const newUser = await User.create({
      clerkId: clerkUserId,
      name:
        `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
        "Clerk User",
      email: clerkEmail,
      role: ["EMPLOYEE"],
      department: "Not Assigned",
      jobTitle: "Not Assigned",
      isActive: true,
    });

    console.log(`✅ Successfully created Clerk user in MongoDB:`, {
      _id: newUser._id,
      clerkId: newUser.clerkId,
      name: newUser.name,
      email: newUser.email,
    });

    return newUser;
  } catch (error) {
    console.error("❌ Critical error syncing Clerk user to MongoDB:", error);
    return null;
  }
}

export async function authenticate(req: NextRequest): Promise<AuthResult> {
  try {
    const authHeader = req.headers.get("Authorization");
    console.log("=== AUTH MIDDLEWARE DEBUG ===");
    console.log("Full auth header:", authHeader ? "Present" : "Missing");

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

    if (token && token.trim() !== "") {
      console.log("Token (first 30 chars):", token.substring(0, 30) + "...");

      // Try Clerk token first
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
        const userEmail = (verifiedToken.email as string) || "";

        console.log(
          "✅ Clerk token verified successfully, userId:",
          clerkUserId
        );

        // ✅ Auto-sync Clerk user to MongoDB on authentication
        await syncClerkUserToMongoDB(clerkUserId, userEmail);

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

        // Try JWT token
        if (!process.env.JWT_SECRET) {
          console.error("JWT_SECRET is not defined");
          return {
            error: "Server configuration error",
            status: 500,
          };
        }

        let decoded: DecodedToken;
        try {
          decoded = jwt.verify(token, process.env.JWT_SECRET) as DecodedToken;
          console.log("✅ JWT token decoded successfully:", {
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

        if (decoded.type === "refresh") {
          console.log("Refresh token used for API call");
          return {
            error: "Invalid token type",
            status: 401,
          };
        }

        const userRoles = decoded.roles || decoded.role || ["EMPLOYEE"];
        const rolesArray = Array.isArray(userRoles) ? userRoles : [userRoles];

        console.log("User authenticated successfully via JWT:", {
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
      }
    }

    // No Authorization header, try Clerk session
    console.log("No Authorization header, trying Clerk session...");

    try {
      const { userId } = await auth();

      if (userId) {
        console.log("✅ Clerk session found, userId:", userId);

        // ✅ Auto-sync on session authentication too
        await syncClerkUserToMongoDB(userId, "");

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

export function hasRole(userRoles: string[], requiredRoles: string[]): boolean {
  return requiredRoles.some((role) =>
    userRoles.map((r) => r.toUpperCase()).includes(role.toUpperCase())
  );
}
