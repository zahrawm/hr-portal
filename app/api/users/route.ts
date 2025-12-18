import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb/connection";
import User, { UserRole } from "@/lib/mongodb/models/Users";
import { authenticate, hasRole } from "@/lib/middleware/auth";

// -------------------------
// POST: Create a new user (ADMIN only)
// -------------------------
export async function POST(req: NextRequest) {
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
    const { name, email, password, role, jobTitle, department, isActive } =
      body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: "Name and email are required" },
        { status: 400 }
      );
    }

    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { success: false, message: "JWT_SECRET missing on server" },
        { status: 500 }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email already exists" },
        { status: 409 }
      );
    }

    // Generate a default password if not provided
    const defaultPassword =
      password ||
      `${name.replace(/\s+/g, "")}${Math.floor(Math.random() * 1000)}`;
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: Array.isArray(role) ? role : [UserRole.EMPLOYEE],
      jobTitle: jobTitle || "",
      department: department || "",
      isActive: isActive !== undefined ? isActive : true,
    });

    const token = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email,
        roles: newUser.role,
        type: "access",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        token,
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          jobTitle: newUser.jobTitle,
          department: newUser.department,
          isActive: newUser.isActive,
          createdAt: newUser.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create User Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create user" },
      { status: 500 }
    );
  }
}

// -------------------------
// GET: Get all users (ADMIN/Manager)
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
    const { id, name, email, password, role, jobTitle, department, isActive } =
      body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Build update data object with all fields
    const updateData: any = {
      name,
      email,
      role,
      isActive,
    };

    // Only include jobTitle and department if provided
    if (jobTitle !== undefined) {
      updateData.jobTitle = jobTitle;
    }
    if (department !== undefined) {
      updateData.department = department;
    }

    // Only update password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
      console.log(password);
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

    if (!hasRole(authResult.user.roles, ["ADMIN", "MANAGER"])) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Admin/Manager only" },
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
