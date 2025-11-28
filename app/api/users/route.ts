// src/app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";

// import User, { UserRole } from "@/lib/mongodb/models/User";

import bcrypt from "bcryptjs";
import { User, UserRole } from "@/lib/mongodb/models";
import connectDB from "@/lib/mongodb/connection";

// GET /api/users - Get all users
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const isActive = searchParams.get("isActive");

    // Build query filters
    const query: any = {};
    if (role && Object.values(UserRole).includes(role as UserRole)) {
      query.role = role;
    }
    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    const users = await User.find(query)
      .select("-password") // Exclude password from results
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        count: users.length,
        data: users,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, password, firstName, lastName, role, isActive } = body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User with this email already exists",
        },
        { status: 409 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: role || UserRole.EMPLOYEE,
      isActive: isActive !== undefined ? isActive : true,
    });

    const userResponse = newUser.toObject();
    const { password: _, ...userWithoutPassword } = userResponse;

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        data: userResponse,
      },
      { status: 201 }
    );
  } catch (error: any) {
    // Handle validation errors
    if (error.name === "ValidationError") {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: Object.values(error.errors).map((e: any) => e.message),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create user",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
