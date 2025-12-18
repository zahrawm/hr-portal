// ALSO UPDATE fetchAttendanceRecords to remove the strict regex check
// ============================================
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb/connection";
import { authenticate } from "@/lib/middleware/auth";

// PATCH - Update an attendance record (Clock In/Out)
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authenticate(req);
    if (authResult.error || !authResult.user) {
      return NextResponse.json(
        { success: false, message: authResult.error || "Unauthorized" },
        { status: authResult.status || 401 }
      );
    }

    await connectDB();
    const { id } = await context.params;

    console.log("=== PATCH Request START ===");
    console.log("ID received:", id);
    console.log("ID type:", typeof id);

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID is required" },
        { status: 400 }
      );
    }

    // More lenient ID validation - just check if it's a valid ObjectId
    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(id);
      console.log("Valid ObjectId created:", objectId);
    } catch (err) {
      console.error("Invalid ObjectId:", err);
      return NextResponse.json(
        { success: false, error: `Invalid ID format: ${id}` },
        { status: 400 }
      );
    }

    const body = await req.json();
    console.log("Request body:", body);

    const Attendance =
      mongoose.models.Attendance ||
      (await import("@/lib/mongodb/models/Attendance")).default;

    // First, get the existing record
    const existingRecord = await Attendance.findById(objectId);

    if (!existingRecord) {
      console.error("Attendance record not found for ID:", objectId);
      return NextResponse.json(
        { success: false, error: "Attendance record not found" },
        { status: 404 }
      );
    }

    console.log("Existing record found:", existingRecord);

    const updates: any = {};

    // Handle Clock In
    if (body.clockIn) {
      updates.clockIn = new Date(body.clockIn);
      console.log("Setting clockIn to:", updates.clockIn);
    }

    // Handle Clock Out
    if (body.clockOut) {
      const newClockOut = new Date(body.clockOut);

      // Check if there's a clockIn time
      if (!existingRecord.clockIn && !updates.clockIn) {
        return NextResponse.json(
          {
            success: false,
            error: "Cannot clock out without clocking in first",
          },
          { status: 400 }
        );
      }

      // Validate that clockOut is after clockIn
      const clockInTime = updates.clockIn
        ? new Date(updates.clockIn)
        : new Date(existingRecord.clockIn);

      if (newClockOut <= clockInTime) {
        return NextResponse.json(
          {
            success: false,
            error: "Clock out time must be after clock in time",
            details: {
              clockIn: clockInTime.toISOString(),
              clockOut: newClockOut.toISOString(),
            },
          },
          { status: 400 }
        );
      }

      updates.clockOut = newClockOut;
      console.log("Setting clockOut to:", updates.clockOut);
    }

    if (body.date) {
      updates.date = new Date(body.date);
    }

    console.log("Final updates to apply:", updates);

    // Update the record
    const attendance = await Attendance.findByIdAndUpdate(objectId, updates, {
      new: true,
      runValidators: false,
    });

    console.log("Updated attendance:", attendance);

    return NextResponse.json({
      success: true,
      data: attendance,
      message: body.clockIn
        ? "Clocked in successfully"
        : "Clocked out successfully",
    });
  } catch (error: any) {
    console.error("=== PATCH Attendance ERROR ===");
    console.error("Error:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - Fetch a single attendance record
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authenticate(req);
    if (authResult.error || !authResult.user) {
      return NextResponse.json(
        { success: false, message: authResult.error || "Unauthorized" },
        { status: authResult.status || 401 }
      );
    }

    await connectDB();
    const { id } = await context.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid ID format" },
        { status: 400 }
      );
    }

    const Attendance =
      mongoose.models.Attendance ||
      (await import("@/lib/mongodb/models/Attendance")).default;

    const attendance = await Attendance.findById(id).populate(
      "employeeId",
      "name email"
    );

    if (!attendance) {
      return NextResponse.json(
        { success: false, error: "Attendance record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: attendance });
  } catch (error: any) {
    console.error("Attendance GET Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete an attendance record
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authenticate(req);
    if (authResult.error || !authResult.user) {
      return NextResponse.json(
        { success: false, message: authResult.error || "Unauthorized" },
        { status: authResult.status || 401 }
      );
    }

    await connectDB();
    const { id } = await context.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid ID format" },
        { status: 400 }
      );
    }

    const Attendance =
      mongoose.models.Attendance ||
      (await import("@/lib/mongodb/models/Attendance")).default;

    const attendance = await Attendance.findByIdAndDelete(id);

    if (!attendance) {
      return NextResponse.json(
        { success: false, error: "Attendance record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Attendance record deleted successfully",
    });
  } catch (error: any) {
    console.error("Attendance DELETE Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
