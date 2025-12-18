// src/app/api/leave-requests/deny/route.ts
import { NextRequest, NextResponse } from "next/server";
import LeaveRequest from "@/lib/mongodb/models/LeaveRequest";
import { authenticate } from "@/lib/middleware/auth";
import connectDB from "@/lib/mongodb/connection";

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { id, denialReason } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Leave request ID is required" },
        { status: 400 }
      );
    }

    const leaveRequest = await LeaveRequest.findByIdAndUpdate(
      id,
      {
        status: "REJECTED",
        approverId: authResult.user.id,
        denialReason: denialReason || "No reason provided",
      },
      { new: true }
    )
      .populate("employeeId", "name email department jobTitle")
      .populate("approverId", "name email");

    if (!leaveRequest) {
      return NextResponse.json(
        { success: false, error: "Leave request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: leaveRequest,
      message: "Leave request denied successfully",
    });
  } catch (error: any) {
    console.error("Error denying leave request:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
