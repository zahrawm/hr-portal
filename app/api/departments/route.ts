// ============================================
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb/connection";
import Department from "@/lib/mongodb/models/Department";

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
            { departmentName: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { status: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const departments = await Department.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Department.countDocuments(query);

    return NextResponse.json(
      {
        success: true,
        data: departments,
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
        error: error.message || "Failed to fetch departments",
      },
      { status: 500 }
    );
  }
}

// POST: Create a new department
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { departmentName, status, description } = body;

    if (!departmentName) {
      return NextResponse.json(
        {
          success: false,
          error: "Department name is required",
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

    const existingDepartment = await Department.findOne({
      departmentName: departmentName.trim(),
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

    // Capitalize status if provided
    const normalizedStatus = status
      ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
      : "Active";

    const department = await Department.create({
      name: departmentName.trim(), // Store in name field for uniqueness
      departmentName: departmentName.trim(),
      status: normalizedStatus, // Ensure capitalized
      description,
    });

    return NextResponse.json(
      {
        success: true,
        data: department,
        message: "Department created successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create department",
      },
      { status: 500 }
    );
  }
}
