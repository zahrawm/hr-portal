// src/app/api/attendance/route.ts
import { NextRequest, NextResponse } from "next/server";
import Attendance from "@/lib/mongodb/models/Attendance";
import { authenticate } from "@/lib/middleware/auth";
import connectDB from "@/lib/mongodb/connection";

// GET - Fetch all attendance records
export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticate(req);
    if (authResult.error || !authResult.user) {
      return NextResponse.json(
        { success: false, message: authResult.error || "Unauthorized" },
        { status: authResult.status }
      );
    }

    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const date = searchParams.get("date");
    const limit = parseInt(searchParams.get("limit") || "100");
    const page = parseInt(searchParams.get("page") || "1");

    const query: any = {};

    console.log("Fetching attendance with query:", query);
    console.log("User roles:", authResult.user.roles);
    console.log("User ID:", authResult.user.id);

    // CRITICAL FIX: Check if user is admin or manager
    const userRoles = authResult.user.roles.map((r: string) => r.toLowerCase());
    const isAdminOrManager =
      userRoles.includes("admin") || userRoles.includes("manager");

    console.log("Is Admin or Manager:", isAdminOrManager);

    // SECURITY FIX: If NOT admin/manager, ALWAYS show only their OWN records
    // Do NOT allow userId parameter to override this for non-admin users
    if (!isAdminOrManager) {
      query.userId = authResult.user.id;
      console.log(
        "Employee role detected - forcing userId filter:",
        authResult.user.id
      );
    } else {
      // Only admins/managers can filter by different userId
      if (userId) {
        query.userId = userId;
        console.log("Admin/Manager filtering by userId:", userId);
      } else {
        console.log("Admin/Manager role detected - showing all records");
      }
    }

    // Apply date filter if provided
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.clockIn = { $gte: startOfDay, $lte: endOfDay };
    }

    const skip = (page - 1) * limit;

    console.log("Final query being used:", query);

    // Get total count
    const total = await Attendance.countDocuments(query);
    console.log("Total attendance records found:", total);

    // Fetch attendance records with user population
    const attendanceRecords = await Attendance.find(query)
      .populate("userId", "name email employeeId department jobTitle")
      .sort({ clockIn: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    console.log("Attendance records fetched:", attendanceRecords.length);
    if (attendanceRecords.length > 0) {
      console.log("First record sample:", attendanceRecords[0]);
    }

    return NextResponse.json({
      success: true,
      data: attendanceRecords,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error in GET /attendance:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create/Clock In attendance record
export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticate(req);
    if (authResult.error || !authResult.user) {
      return NextResponse.json(
        { success: false, message: authResult.error || "Unauthorized" },
        { status: authResult.status }
      );
    }

    await connectDB();

    const body = await req.json();
    const { clockIn, clockOut } = body;

    // Check if user already has an active attendance record today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingRecord = await Attendance.findOne({
      userId: authResult.user.id,
      clockIn: { $gte: today, $lt: tomorrow },
    });

    if (existingRecord && !clockOut) {
      return NextResponse.json(
        { success: false, error: "Already clocked in today" },
        { status: 400 }
      );
    }

    const attendanceData: any = {
      userId: authResult.user.id,
      clockIn: clockIn ? new Date(clockIn) : new Date(),
    };

    if (clockOut) {
      attendanceData.clockOut = new Date(clockOut);
    }

    const attendance = await Attendance.create(attendanceData);
    await attendance.populate(
      "employeeId",
      "name email employeeId department jobTitle"
    );

    return NextResponse.json(
      {
        success: true,
        data: attendance,
        message: "Attendance recorded successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Attendance creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to record attendance",
      },
      { status: 500 }
    );
  }
}
