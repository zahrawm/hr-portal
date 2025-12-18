// app/api/role-titles/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb/connection";
import Department from "@/lib/mongodb/models/Department";
import mongoose from "mongoose";
import { authenticate, hasRole } from "@/lib/middleware/auth";
import { RoleTitle } from "@/lib/mongodb/models";

// GET: Fetch all role titles with pagination and search
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const url = request.nextUrl;
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const search = url.searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const query = search
      ? {
          $or: [
            { roleName: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { status: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const roleTitles = await RoleTitle.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await RoleTitle.countDocuments(query);

    return NextResponse.json(
      {
        success: true,
        data: roleTitles,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch role titles",
      },
      { status: 500 }
    );
  }
}

// POST: Create a new role title (Admin only)
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { roleName, status, description } = body;

    if (!roleName) {
      return NextResponse.json(
        {
          success: false,
          error: "Role title name is required",
        },
        { status: 400 }
      );
    }

    // Validate status
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

    // Capitalize status if provided
    const normalizedStatus = status
      ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
      : "Active";

    const roleTitle = await RoleTitle.create({
      roleName: roleName.trim(),
      status: normalizedStatus,
      description,
    });

    return NextResponse.json(
      {
        success: true,
        data: roleTitle,
        message: "Role title created successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create role title",
      },
      { status: 500 }
    );
  }
}

// DELETE: Delete role title(s) - supports both single ID and bulk delete (Admin only)
export async function DELETE(request: NextRequest) {
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

    const body = await request.json();
    const { id, ids } = body;

    // Handle single delete
    if (id) {
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
    }

    // Handle bulk delete
    if (ids && Array.isArray(ids)) {
      const result = await RoleTitle.deleteMany({
        _id: { $in: ids },
      });

      return NextResponse.json(
        {
          success: true,
          message: `${result.deletedCount} role title(s) deleted successfully`,
          deletedCount: result.deletedCount,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Please provide either 'id' or 'ids' in request body",
      },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete role title(s)",
      },
      { status: 500 }
    );
  }
}
