// ============================================
// app/api/departments/[id]/route.ts
// ============================================
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb/connection";
import Department from "@/lib/mongodb/models/Department";
import mongoose from "mongoose";
import { authenticate, hasRole } from "@/lib/middleware/auth";

// GET: Fetch single department by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid department ID",
        },
        { status: 400 }
      );
    }

    const department = await Department.findById(id);

    if (!department) {
      return NextResponse.json(
        {
          success: false,
          error: "Department not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: department,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch department",
      },
      { status: 500 }
    );
  }
}

// PUT: Update department by ID (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const authResult = await authenticate(request);
    if (authResult.error || !authResult.user) {
      return NextResponse.json(
        {
          success: false,
          error: authResult.error || "Authentication failed",
        },
        { status: authResult.status }
      );
    }

    // Check if user is admin
    if (!hasRole(authResult.user.roles, ["ADMIN"])) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Admin access required.",
        },
        { status: 403 }
      );
    }

    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid department ID",
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { departmentName, status, description } = body;

    // Validate status if provided
    if (
      status &&
      !["Active", "Inactive", "active", "inactive"].includes(status)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Status must be either 'Active' or 'Inactive'",
        },
        { status: 400 }
      );
    }

    if (departmentName) {
      const existingDepartment = await Department.findOne({
        departmentName: departmentName.trim(),
        _id: { $ne: id },
      });
      if (existingDepartment) {
        return NextResponse.json(
          {
            success: false,
            error: "Department with this name already exists",
          },
          { status: 409 }
        );
      }
    }

    const updateData: any = {};
    if (departmentName !== undefined) {
      updateData.departmentName = departmentName.trim();
      updateData.name = departmentName.trim(); // Keep both in sync
    }
    if (status !== undefined) {
      // Capitalize status
      updateData.status =
        status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    }
    if (description !== undefined) updateData.description = description;

    const department = await Department.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!department) {
      return NextResponse.json(
        {
          success: false,
          error: "Department not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: department,
        message: "Department updated successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update department",
      },
      { status: 500 }
    );
  }
}

// DELETE: Delete department by ID (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const authResult = await authenticate(request);
    if (authResult.error || !authResult.user) {
      return NextResponse.json(
        {
          success: false,
          error: authResult.error || "Authentication failed",
        },
        { status: authResult.status }
      );
    }

    // STRICT CHECK: Only ADMIN role can delete departments
    // Check if user is admin
    if (!hasRole(authResult.user.roles, ["ADMIN"])) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Admin access required.",
        },
        { status: 403 }
      );
    }

    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid department ID",
        },
        { status: 400 }
      );
    }

    const department = await Department.findByIdAndDelete(id);

    if (!department) {
      return NextResponse.json(
        {
          success: false,
          error: "Department not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Department deleted successfully",
        data: department,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete department",
      },
      { status: 500 }
    );
  }
}
