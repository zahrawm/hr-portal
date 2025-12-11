import { NextRequest, NextResponse } from "next/server";
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

    const { email } = body;

    // Validate email
    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
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

    // Check if user exists (case-insensitive)
    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    return NextResponse.json(
      {
        success: true,
        exists: !!user,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Check User Error:", error);

    // Don't expose internal error messages in production
    const message =
      process.env.NODE_ENV === "development" ? error.message : "Server error";

    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
