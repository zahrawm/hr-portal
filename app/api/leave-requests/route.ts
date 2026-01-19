// src/app/api/leave-requests/route.ts
import { NextRequest, NextResponse } from "next/server";
import LeaveRequest, { LeaveStatus } from "@/lib/mongodb/models/LeaveRequest";
import User from "@/lib/mongodb/models/Users";
import { authenticate } from "@/lib/middleware/auth";
import connectDB from "@/lib/mongodb/connection";
import { clerkClient } from "@clerk/nextjs/server";

// ✅ ENHANCED: Helper function to find user and auto-sync from Clerk if needed
async function findUserByIdentifier(identifier: string) {
  if (!identifier) {
    console.log("❌ No identifier provided");
    return null;
  }

  console.log(`🔍 Looking up user with identifier: "${identifier}"`);

  // Try finding by clerkId first (for Clerk users)
  let user = await User.findOne({ clerkId: identifier })
    .select("name email department role jobTitle clerkId")
    .lean();

  if (user) {
    console.log(`✅ Found user by clerkId:`, {
      name: user.name,
      email: user.email,
      clerkId: user.clerkId,
    });
    return user;
  }

  console.log(`⚠️ User not found by clerkId: "${identifier}"`);

  // ✅ NEW: If identifier looks like a Clerk ID and user not found, try to sync from Clerk
  if (identifier.startsWith("user_")) {
    console.log(`🔄 Attempting to sync Clerk user: ${identifier}`);
    try {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(identifier);

      if (clerkUser) {
        console.log(`📥 Found user in Clerk, syncing to MongoDB...`);

        // Create the user in MongoDB
        const newUser = await User.create({
          clerkId: identifier,
          name:
            `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
            "Clerk User",
          email:
            clerkUser.emailAddresses[0]?.emailAddress || "no-email@clerk.user",
          role: ["EMPLOYEE"],
          department: "Not Assigned",
          jobTitle: "Not Assigned",
          isActive: true,
        });

        console.log(`✅ Successfully synced Clerk user to MongoDB:`, {
          _id: newUser._id,
          clerkId: newUser.clerkId,
          name: newUser.name,
          email: newUser.email,
        });

        return newUser.toObject();
      }
    } catch (clerkError) {
      console.error(`❌ Failed to sync from Clerk:`, clerkError);
      // Continue to other lookup methods
    }
  }

  // If not found and identifier looks like MongoDB ObjectId, try finding by _id (for normal signup)
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    console.log(`🔍 Trying MongoDB _id lookup...`);
    user = await User.findById(identifier)
      .select("name email department role jobTitle clerkId")
      .lean();

    if (user) {
      console.log(`✅ Found user by MongoDB _id:`, {
        name: user.name,
        email: user.email,
      });
      return user;
    }
  }

  console.log(`❌ User not found with identifier: "${identifier}"`);

  // DEBUG: Show what users exist (limit logging after first few failures)
  const allUsers = await User.find()
    .select("clerkId name email")
    .limit(5)
    .lean();
  console.log(`📋 Sample users in database:`, allUsers);

  return null;
}

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

    console.log(`📊 Found ${leaveRequests.length} leave requests`);

    // ✅ OPTIMIZED: Populate employee data with auto-sync
    const populatedRequests = await Promise.all(
      leaveRequests.map(async (request) => {
        const employee = await findUserByIdentifier(request.employeeId);

        return {
          _id: request._id,
          employeeId: request.employeeId,
          status: request.status,
          startDate: request.startDate,
          endDate: request.endDate,
          reason: request.reason,
          daysCount: request.daysCount,
          denialReason: request.denialReason,
          approverId: request.approverId,
          approvedAt: request.approvedAt,
          createdAt: request.createdAt,
          updatedAt: request.updatedAt,
          // Employee fields at root level
          name: employee?.name || "Unknown Employee",
          email: employee?.email || "No Email",
          department: employee?.department || "N/A",
          role: Array.isArray(employee?.role)
            ? employee.role[0]
            : employee?.role || "N/A",
          jobTitle: employee?.jobTitle || "N/A",
        };
      })
    );

    console.log(
      `✅ Successfully populated ${populatedRequests.length} requests`
    );

    return NextResponse.json({
      success: true,
      data: populatedRequests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("❌ Leave requests fetch error:", error);
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

    // ✅ ENSURE: User exists in MongoDB before creating leave request
    await findUserByIdentifier(authResult.user.id);

    const leaveRequestData = {
      employeeId: authResult.user.id, // Works for both Clerk ID and MongoDB ID
      startDate: start,
      endDate: end,
      reason: reason.trim(),
      status: autoApproveStatus,
    };

    const leaveRequest = await LeaveRequest.create(leaveRequestData);

    // Fetch employee data for response
    const employee = await findUserByIdentifier(authResult.user.id);

    return NextResponse.json(
      {
        success: true,
        data: {
          ...leaveRequest.toObject(),
          name: employee?.name || "Unknown Employee",
          email: employee?.email || "No Email",
          department: employee?.department || "N/A",
          role: Array.isArray(employee?.role)
            ? employee.role[0]
            : employee?.role || "N/A",
          jobTitle: employee?.jobTitle || "N/A",
        },
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
