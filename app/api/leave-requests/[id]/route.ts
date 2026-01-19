import { NextRequest, NextResponse } from "next/server";

import LeaveRequest from "@/lib/mongodb/models/LeaveRequest";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb/connection";

// src/app/api/leave-requests/[id]/route.ts

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid ID format" },
        { status: 400 }
      );
    }

    const leaveRequest = await LeaveRequest.findById(id).lean();

    if (!leaveRequest) {
      return NextResponse.json(
        { success: false, error: "Leave request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: leaveRequest });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid ID format" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const updates: any = {};

    if (body.startDate) updates.startDate = new Date(body.startDate);
    if (body.endDate) updates.endDate = new Date(body.endDate);
    if (body.reason !== undefined) updates.reason = body.reason;
    if (body.status) updates.status = body.status;
    if (body.approverId) updates.approverId = body.approverId;
    if (body.denialReason) updates.denialReason = body.denialReason;

    const leaveRequest = await LeaveRequest.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).lean();

    if (!leaveRequest) {
      return NextResponse.json(
        { success: false, error: "Leave request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: leaveRequest });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
