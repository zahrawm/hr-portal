import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
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

    // Validate password length
    if (password.length < 4) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 4 characters long",
        },
        { status: 400 }
      );
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "Passwords do not match" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
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

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user password
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Password has been successfully reset",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Reset Password Error:", error);

    // Don't expose internal error messages in production
    const message =
      process.env.NODE_ENV === "development" ? error.message : "Server error";

    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
