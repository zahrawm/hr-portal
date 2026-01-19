// src/app/api/leave-requests/route.ts
import { NextRequest, NextResponse } from "next/server";

import LeaveRequest, { LeaveStatus } from "@/lib/mongodb/models/LeaveRequest";
import { authenticate } from "@/lib/middleware/auth";
import connectDB from "@/lib/mongodb/connection";

// GET - Fetch all leave requests with optional filters
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

    const searchParams = req.nextUrl.searchParams;
    const employeeId = searchParams.get("employeeId");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const query: any = {};

    const userRoles = authResult.user.roles.map((r: string) => r.toLowerCase());
    const isAdminOrManager =
      userRoles.includes("admin") || userRoles.includes("manager");

    if (!isAdminOrManager) {
      query.employeeId = authResult.user.id;
    }

    if (employeeId) query.employeeId = employeeId;
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const [leaveRequests, total] = await Promise.all([
      LeaveRequest.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      LeaveRequest.countDocuments(query),
    ]);

    // ✅ Return leave requests WITHOUT populated data
    return NextResponse.json({
      success: true,
      data: leaveRequests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new leave request
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
    const { startDate, endDate, reason, status } = body;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: "Start date and end date are required" },
        { status: 400 }
      );
    }

    if (!reason || reason.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: "Reason must be at least 10 characters long" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid date format" },
        { status: 400 }
      );
    }

    if (end < start) {
      return NextResponse.json(
        { success: false, error: "End date must be after start date" },
        { status: 400 }
      );
    }

    const userRoles = authResult.user.roles.map((r: string) => r.toLowerCase());
    const autoApproveStatus =
      userRoles.includes("admin") || userRoles.includes("manager")
        ? LeaveStatus.APPROVED
        : status || LeaveStatus.PENDING;

    const leaveRequestData = {
      employeeId: authResult.user.id,
      startDate: start,
      endDate: end,
      reason: reason.trim(),
      status: autoApproveStatus,
    };

    const leaveRequest = await LeaveRequest.create(leaveRequestData);

    // ✅ Return WITHOUT populate
    return NextResponse.json(
      {
        success: true,
        data: leaveRequest,
        message: "Leave request created successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Leave request creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create leave request",
      },
      { status: 500 }
    );
  }
}
