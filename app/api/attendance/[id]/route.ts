// FILE 2: src/app/api/attendance/[id]/route.ts
// ==============================================
import { NextRequest, NextResponse } from "next/server";
import Attendance from "@/lib/mongodb/models/Attendance";
import User from "@/lib/mongodb/models/Users";
import connectDB from "@/lib/mongodb/connection";

import mongoose from "mongoose";
import { authenticate } from "@/lib/middleware/auth";

// GET - Fetch single attendance record
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const authResult = await authenticate(req);

    if (!authResult.user) {
      return NextResponse.json(
        { error: authResult.error || "Unauthorized" },
        { status: authResult.status },
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const attendance = await Attendance.findById(id).lean();

    if (!attendance) {
      return NextResponse.json(
        { error: "Attendance record not found" },
        { status: 404 },
      );
    }

    // Populate user data with proper Clerk ID handling
    let user;
    const isValidObjectId = mongoose.Types.ObjectId.isValid(attendance.userId);

    if (isValidObjectId) {
      user = await User.findOne({
        $or: [{ _id: attendance.userId }, { clerkId: attendance.userId }],
      })
        .select("name email department jobTitle")
        .lean();
    } else {
      // It's a Clerk ID
      user = await User.findOne({ clerkId: attendance.userId })
        .select("name email department jobTitle")
        .lean();
    }

    const populatedAttendance = {
      ...attendance,
      userId: user
        ? {
            _id: user._id,
            name: user.name,
            email: user.email,
            department: user.department,
            jobTitle: user.jobTitle,
          }
        : {
            _id: attendance.userId,
            name: "Unknown",
            email: "Unknown",
            department: "N/A",
            jobTitle: "N/A",
          },
    };

    return NextResponse.json(populatedAttendance);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update attendance record (for admins to correct entries)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const authResult = await authenticate(req);

    if (!authResult.user) {
      return NextResponse.json(
        { error: authResult.error || "Unauthorized" },
        { status: authResult.status },
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const body = await req.json();
    const updates: any = {};

    if (body.clockIn) updates.clockIn = new Date(body.clockIn);
    if (body.clockOut) updates.clockOut = new Date(body.clockOut);
    if (body.date) updates.date = new Date(body.date);

    const attendance = await Attendance.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).lean();

    if (!attendance) {
      return NextResponse.json(
        { error: "Attendance record not found" },
        { status: 404 },
      );
    }

    // Populate user data with proper Clerk ID handling
    let user;
    const isValidObjectId = mongoose.Types.ObjectId.isValid(attendance.userId);

    if (isValidObjectId) {
      user = await User.findOne({
        $or: [{ _id: attendance.userId }, { clerkId: attendance.userId }],
      })
        .select("name email department jobTitle")
        .lean();
    } else {
      // It's a Clerk ID
      user = await User.findOne({ clerkId: attendance.userId })
        .select("name email department jobTitle")
        .lean();
    }

    const populatedAttendance = {
      ...attendance,
      userId: user
        ? {
            _id: user._id,
            name: user.name,
            email: user.email,
            department: user.department,
            jobTitle: user.jobTitle,
          }
        : {
            _id: attendance.userId,
            name: "Unknown",
            email: "Unknown",
            department: "N/A",
            jobTitle: "N/A",
          },
    };

    return NextResponse.json(populatedAttendance);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete attendance record (for admins only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const authResult = await authenticate(req);

    if (!authResult.user) {
      return NextResponse.json(
        { error: authResult.error || "Unauthorized" },
        { status: authResult.status },
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const attendance = await Attendance.findByIdAndDelete(id);

    if (!attendance) {
      return NextResponse.json(
        { error: "Attendance record not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Attendance record deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
