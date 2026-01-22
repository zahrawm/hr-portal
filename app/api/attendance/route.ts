// FILE 1: src/app/api/attendance/route.ts
// ==============================================
import { NextRequest, NextResponse } from "next/server";
import Attendance from "@/lib/mongodb/models/Attendance";
import User from "@/lib/mongodb/models/Users";
import connectDB from "@/lib/mongodb/connection";

import mongoose from "mongoose";
import { authenticate } from "@/lib/middleware/auth";

// POST - Clock In/Out
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const authResult = await authenticate(req);
    console.log("Auth Result:", authResult);

    if (!authResult.user) {
      return NextResponse.json(
        { error: authResult.error || "Unauthorized" },
        { status: authResult.status },
      );
    }

    const userId = authResult.user.id;
    console.log("Authenticated user ID:", userId);

    const body = await req.json();
    const { action } = body;

    if (!action || !["clockIn", "clockOut"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Use 'clockIn' or 'clockOut'" },
        { status: 400 },
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (action === "clockIn") {
      // Check if already clocked in today
      const existingAttendance = await Attendance.findOne({
        userId: userId,
        date: today,
      });

      if (existingAttendance) {
        if (existingAttendance.clockOut) {
          return NextResponse.json(
            {
              error:
                "You already completed your attendance for today. You clocked in and out.",
            },
            { status: 400 },
          );
        } else {
          return NextResponse.json(
            {
              error: "Already clocked in today. Please clock out first.",
            },
            { status: 400 },
          );
        }
      }

      // Create new attendance record
      const newAttendance = await Attendance.create({
        userId: userId,
        date: today,
        clockIn: new Date(),
      });

      return NextResponse.json(
        {
          success: true,
          message: "Clocked in successfully",
          data: newAttendance,
        },
        { status: 201 },
      );
    } else if (action === "clockOut") {
      // Find today's attendance record
      const attendance = await Attendance.findOne({
        userId: userId,
        date: today,
      });

      if (!attendance) {
        return NextResponse.json(
          {
            error: "No clock-in found for today. Please clock in first.",
          },
          { status: 400 },
        );
      }

      if (attendance.clockOut) {
        return NextResponse.json(
          {
            error: "Already clocked out today.",
          },
          { status: 400 },
        );
      }

      // Update with clock out time
      attendance.clockOut = new Date();
      await attendance.save();

      return NextResponse.json(
        {
          success: true,
          message: "Clocked out successfully",
          data: attendance,
        },
        { status: 200 },
      );
    }
  } catch (error: any) {
    console.error("Attendance Action Error:", error);
    return NextResponse.json(
      { error: "Failed to process attendance" },
      { status: 500 },
    );
  }
}

// GET - Fetch attendance records
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const authResult = await authenticate(req);
    console.log("Auth Result:", authResult);

    if (!authResult.user) {
      return NextResponse.json(
        { error: authResult.error || "Unauthorized" },
        { status: authResult.status },
      );
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let query: any = {};

    // If userId is provided in query, filter by that; otherwise use authenticated user's ID
    if (userId) {
      query.userId = userId;
      console.log("Fetching attendance for userId:", userId);
    } else {
      query.userId = authResult.user.id;
      console.log(
        "Fetching attendance for authenticated user:",
        authResult.user.id,
      );
    }

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
      .sort({ date: -1, clockIn: -1 })
      .lean();

    console.log(`Found ${attendanceRecords.length} attendance records`);

    if (!attendanceRecords || attendanceRecords.length === 0) {
      return NextResponse.json([]);
    }

    // Populate user data
    const populatedRecords = await Promise.all(
      attendanceRecords.map(async (record: any) => {
        let userData = null;

        try {
          // Check if userId is a valid MongoDB ObjectId
          const isValidObjectId = mongoose.Types.ObjectId.isValid(
            record.userId,
          );

          let user;
          if (isValidObjectId) {
            // If it's a valid ObjectId, search by both _id and clerkId
            user = await User.findOne({
              $or: [{ _id: record.userId }, { clerkId: record.userId }],
            })
              .select("name email department jobTitle role")
              .lean();
          } else {
            // If it's not a valid ObjectId (likely a Clerk ID), only search by clerkId
            user = await User.findOne({ clerkId: record.userId })
              .select("name email department jobTitle role")
              .lean();
          }

          if (user) {
            userData = {
              _id: user._id,
              name: user.name || "Unknown",
              email: user.email || "Unknown",
              department: user.department || "N/A",
              jobTitle: user.jobTitle || "N/A",
            };
          } else {
            userData = {
              _id: record.userId,
              name: "Unknown",
              email: "Unknown",
              department: "N/A",
              jobTitle: "N/A",
            };
          }
        } catch (userError) {
          console.error("Error fetching user data:", userError);
          userData = {
            _id: record.userId,
            name: "Unknown",
            email: "Unknown",
            department: "N/A",
            jobTitle: "N/A",
          };
        }

        return {
          _id: record._id,
          userId: userData,
          date: record.date,
          clockIn: record.clockIn,
          clockOut: record.clockOut,
          hoursWorked: record.hoursWorked,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
        };
      }),
    );

    console.log(`Populated ${populatedRecords.length} attendance records`);

    return NextResponse.json(populatedRecords);
  } catch (error: any) {
    console.error("Get Attendance Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance records" },
      { status: 500 },
    );
  }
}
