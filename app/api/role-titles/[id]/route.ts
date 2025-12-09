// app/api/role-titles/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb/connection";
import Department from "@/lib/mongodb/models/Department";
import mongoose from "mongoose";
import { authenticate, hasRole } from "@/lib/middleware/auth";
import { RoleTitle } from "@/lib/mongodb/models";

// GET: Fetch single role title by ID
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
          error: "Invalid role title ID",
        },
        { status: 400 }
      );
    }

    const roleTitle = await RoleTitle.findById(id);

    if (!roleTitle) {
      return NextResponse.json(
        {
          success: false,
          error: "Role title not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: roleTitle,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch role title",
      },
      { status: 500 }
    );
  }
}

// PUT: Update role title by ID (Admin only)
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
          error: "Invalid role title ID",
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { roleName, status, description } = body;

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

    // REMOVED: Duplicate role name check - allows same role name for multiple users

    const updateData: any = {};
    if (roleName !== undefined) updateData.roleName = roleName.trim();
    if (status !== undefined) {
      // Capitalize status
      updateData.status =
        status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    }
    if (description !== undefined) updateData.description = description;

    const roleTitle = await RoleTitle.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!roleTitle) {
      return NextResponse.json(
        {
          success: false,
          error: "Role title not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: roleTitle,
        message: "Role title updated successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update role title",
      },
      { status: 500 }
    );
  }
}

// DELETE: Delete role title by ID (Admin only)
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
          error: "Invalid role title ID",
        },
        { status: 400 }
      );
    }

    const roleTitle = await RoleTitle.findByIdAndDelete(id);

    if (!roleTitle) {
      return NextResponse.json(
        {
          success: false,
          error: "Role title not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Role title deleted successfully",
        data: roleTitle,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete role title",
      },
      { status: 500 }
    );
  }
}