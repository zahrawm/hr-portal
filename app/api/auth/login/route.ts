import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb/connection";
import User from "@/lib/mongodb/models/Users";

export async function POST(req: NextRequest) {
  try {
    // Parse JSON with error handling
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json(
        { success: false, message: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { email, password } = body;

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find user by email (case-insensitive)
    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("+password name email role isActive");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if account is active
    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "Your account is inactive. Please contact support.",
        },
        { status: 403 }
      );
    }

    // Verify password field exists
    if (!user.password) {
      console.error("Password field missing for user:", user._id);
      return NextResponse.json(
        { success: false, message: "Account configuration error" },
        { status: 500 }
      );
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in environment variables");
      return NextResponse.json(
        { success: false, message: "Server configuration error" },
        { status: 500 }
      );
    }

    // Create JWT Access Token with 'roles' (plural) to match middleware
    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        roles: user.role, // Changed to 'roles' to match middleware expectation
        type: "access",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Create the response
    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role, // Keep as 'role' for localStorage
        },
      },
      { status: 200 }
    );

    // Set HTTP-only cookie for additional security (optional but recommended)
    response.cookies.set({
      name: "auth-token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400, // 1 day in seconds
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login Error:", error);

    // Don't expose internal error messages in production
    const message =
      process.env.NODE_ENV === "development" ? error.message : "Server error";

    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
