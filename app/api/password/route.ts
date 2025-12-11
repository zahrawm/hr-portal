import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb/connection";
import User from "@/lib/mongodb/models/Users";

export async function POST(req: NextRequest) {
  try {
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

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    if (!password || !confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Password and confirm password are required",
        },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 4 characters long",
        },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "Passwords do not match" },
        { status: 400 }
      );
    }

    await connectDB();

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      const emailName = email.split("@")[0];
      user = new User({
        name: emailName,
        email: email.toLowerCase(),
        password: "",
        role: "EMPLOYEE",
        isActive: true,
      });
    }

    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "Your account is inactive. Please contact support.",
        },
        { status: 403 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

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

    const message =
      process.env.NODE_ENV === "development" ? error.message : "Server error";

    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
