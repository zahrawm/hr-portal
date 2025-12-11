import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb/connection";
import User, { UserRole } from "@/lib/mongodb/models/Users";
import { authenticate, hasRole } from "@/lib/middleware/auth";

// -------------------------
// GET: Get users (by ID or all) (ADMIN/Manager)
// -------------------------
export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticate(req);
    if (authResult.error || !authResult.user) {
      return NextResponse.json(
        { success: false, message: authResult.error || "Unauthorized" },
        { status: authResult.status }
      );
    }

    if (!hasRole(authResult.user.roles, ["ADMIN", "MANAGER"])) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Admin/Manager only" },
        { status: 403 }
      );
    }

    await connectDB();

    // Get the 'id' query parameter if it exists
    const url = new URL(req.url);
    const userId = url.searchParams.get("id");

    if (userId) {
      // Fetch single user by ID
      const user = await User.findById(userId).select("-password");
      if (!user) {
        return NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, user }, { status: 200 });
    } else {
      // Fetch all users
      const users = await User.find().select("-password");
      return NextResponse.json({ success: true, users }, { status: 200 });
    }
  } catch (error) {
    console.error("Get Users Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// -------------------------
// PUT: Update a user (ADMIN only)
// -------------------------
export async function PUT(req: NextRequest) {
  try {
    const authResult = await authenticate(req);
    if (authResult.error || !authResult.user) {
      return NextResponse.json(
        { success: false, message: authResult.error || "Unauthorized" },
        { status: authResult.status }
      );
    }

    if (!hasRole(authResult.user.roles, ["ADMIN", "MANAGER"])) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Admin/Manager only" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { id, name, email, password, role, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const updateData: any = { name, email, role, isActive };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select("-password");

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "User updated", user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update User Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update user" },
      { status: 500 }
    );
  }
}

// -------------------------
// DELETE: Delete a user (ADMIN only)
// -------------------------
export async function DELETE(req: NextRequest) {
  try {
    const authResult = await authenticate(req);
    if (authResult.error || !authResult.user) {
      return NextResponse.json(
        { success: false, message: authResult.error || "Unauthorized" },
        { status: authResult.status }
      );
    }

    if (!hasRole(authResult.user.roles, ["ADMIN"])) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Admins only" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const deletedUser = await User.findByIdAndDelete(id).select("-password");

    if (!deletedUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "User deleted", user: deletedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete User Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete user" },
      { status: 500 }
    );
  }
}
