import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb/connection";
import Attendance from "@/lib/mongodb/models/Attendance";
import User from "@/lib/mongodb/models/Users";
import { authenticate, hasRole } from "@/lib/middleware/auth";
import mongoose from "mongoose";

// -------------------------
// POST: Clock In/Out
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

    const body = await req.json();
    const { action } = body;

    const targetUserId = authResult.user.id;

    await connectDB();

    // Verify user exists
    const user = await User.findById(targetUserId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (action === "clockIn") {
      // Check if already clocked in today
      const existingAttendance = await Attendance.findOne({
        userId: targetUserId,
        date: today,
      });

      if (existingAttendance) {
        // Check if they already clocked out
        if (existingAttendance.clockOut) {
          return NextResponse.json(
            {
              success: false,
              message:
                "You already completed your attendance for today. You clocked in and out.",
            },
            { status: 400 }
          );
        } else {
          // They clocked in but haven't clocked out yet
          return NextResponse.json(
            {
              success: false,
              message: "Already clocked in today. Please clock out first.",
            },
            { status: 400 }
          );
        }
      }

      // Create new attendance record
      const newAttendance = await Attendance.create({
        userId: targetUserId,
        date: today,
        clockIn: new Date(),
      });

      return NextResponse.json(
        {
          success: true,
          message: "Clocked in successfully",
          attendance: newAttendance,
        },
        { status: 201 }
      );
    } else if (action === "clockOut") {
      // Find today's attendance record
      const attendance = await Attendance.findOne({
        userId: targetUserId,
        date: today,
      });

      if (!attendance) {
        return NextResponse.json(
          {
            success: false,
            message: "No clock-in found for today. Please clock in first.",
          },
          { status: 400 }
        );
      }

      // Check if already clocked out
      if (attendance.clockOut) {
        return NextResponse.json(
          {
            success: false,
            message: "Already clocked out today.",
          },
          { status: 400 }
        );
      }

      // Update with clock out time
      attendance.clockOut = new Date();
      await attendance.save(); // This will trigger the pre-save hook to calculate hours

      return NextResponse.json(
        {
          success: true,
          message: "Clocked out successfully",
          attendance,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid action. Use 'clockIn' or 'clockOut'",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Attendance Action Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process attendance" },
      { status: 500 }
    );
  }
}

// -------------------------
// GET: Get attendance records
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

    await connectDB();

    const url = new URL(req.url);
    const userId = url.searchParams.get("id");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    // Build base query
    const query: any = {};

    // If userId is provided, use it to filter for that specific user
    if (userId) {
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return NextResponse.json(
          { success: false, message: "Invalid user ID format" },
          { status: 400 }
        );
      }

      // Check if user exists
      const userExists = await User.findById(userId);
      if (!userExists) {
        return NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404 }
        );
      }

      query.userId = userId;
    }
    // If no userId is provided, return ALL attendance records (not just authenticated user's)

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    const attendanceRecords = await Attendance.find(query)
      .populate("userId", "name email jobTitle department")
      .sort({ date: -1, clockIn: -1 });

    return NextResponse.json(
      {
        success: true,
        data: attendanceRecords,
        count: attendanceRecords.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get Attendance Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch attendance records" },
      { status: 500 }
    );
  }
}
