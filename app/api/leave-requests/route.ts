// FILE 1: src/app/api/leave-requests/route.ts
// ==============================================
import { NextRequest, NextResponse } from "next/server";
import LeaveRequest from "@/lib/mongodb/models/LeaveRequest";
import User from "@/lib/mongodb/models/Users";
import connectDB from "@/lib/mongodb/connection";
import { authenticate } from "@/lib/middleware/auth";

// GET - Fetch leave requests
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const authResult = await authenticate(req);
    console.log("Auth Result:", authResult);

    if (!authResult.user) {
      return NextResponse.json(
        { error: authResult.error || "Unauthorized" },
        { status: authResult.status }
      );
    }

    const userId = authResult.user.id;
    console.log("Authenticated user ID:", userId);

    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId");

    let query: any = {};

    if (employeeId) {
      query.employeeId = employeeId;
      console.log("Fetching for employeeId:", employeeId);
    } else {
      query.employeeId = userId;
      console.log("Fetching for authenticated user:", userId);
    }

    const leaveRequests = await LeaveRequest.find(query)
      .populate({
        path: "employeeId",
        model: "User",
        select: "name fullName email department jobTitle role",
      })
      .sort({ createdAt: -1 })
      .lean();

    console.log(`Found ${leaveRequests.length} leave requests`);

    if (!leaveRequests || leaveRequests.length === 0) {
      return NextResponse.json([]);
    }

    const transformedRequests = leaveRequests.map((request: any) => {
      let employeeData = null;

      if (request.employeeId && typeof request.employeeId === "object") {
        employeeData = {
          _id: request.employeeId._id,
          name:
            request.employeeId.name || request.employeeId.fullName || "Unknown",
          email: request.employeeId.email || "Unknown",
          department: request.employeeId.department || "N/A",
          jobTitle:
            request.employeeId.jobTitle || request.employeeId.role || "N/A",
        };
      }

      return {
        _id: request._id,
        employeeId: employeeData || request.employeeId,
        status: request.status,
        reason: request.reason,
        startDate: request.startDate,
        endDate: request.endDate,
        daysCount: request.daysCount,
        denialReason: request.denialReason,
        approverId: request.approverId,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
      };
    });

    return NextResponse.json(transformedRequests);
  } catch (error: any) {
    console.error("Error fetching leave requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch leave requests" },
      { status: 500 }
    );
  }
}

// POST - Create a leave request
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const authResult = await authenticate(req);

    if (!authResult.user) {
      return NextResponse.json(
        { error: authResult.error || "Unauthorized" },
        { status: authResult.status }
      );
    }

    const userId = authResult.user.id;
    const body = await req.json();
    const { startDate, endDate, reason, status } = body;

    if (!startDate || !endDate || !reason) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    if (end < start) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const leaveRequest = new LeaveRequest({
      employeeId: userId,
      status: status || "PENDING",
      reason,
      startDate: start,
      endDate: end,
      daysCount,
    });

    const savedRequest = await leaveRequest.save();

    const populatedRequest = await LeaveRequest.findById(savedRequest._id)
      .populate({
        path: "employeeId",
        model: "User",
        select: "name fullName email department jobTitle role",
      })
      .lean();

    return NextResponse.json(populatedRequest, { status: 201 });
  } catch (error: any) {
    console.error("Error creating leave request:", error);
    return NextResponse.json(
      { error: "Failed to create leave request" },
      { status: 500 }
    );
  }
}
