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

    const { email, password, confirmPassword } = body;

    // Validate inputs
    if (!email || !password || !confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Email, password and confirm password are required",
        },
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

    // Validate password confirmation
    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "Passwords do not match" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await User.create({
      name: email.split("@")[0], // Add this line
      email: email.toLowerCase(),
      password: hashedPassword,
      role: ["EMPLOYEE"], // Change this line
      isActive: true,
    });
    // Verify JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in environment variables");
      return NextResponse.json(
        { success: false, message: "Server configuration error" },
        { status: 500 }
      );
    }

    // Create JWT Access Token
    const token = jwt.sign(
      {
        id: newUser._id.toString(),
        email: newUser.email,
        roles: newUser.role,
        type: "access",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Create the response
    const response = NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        token,
        user: {
          id: newUser._id,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );

    // Set HTTP-only cookie for additional security
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
    console.error("Signup Error:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Don't expose internal error messages in production
    const message =
      process.env.NODE_ENV === "development" ? error.message : "Server error";

    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
