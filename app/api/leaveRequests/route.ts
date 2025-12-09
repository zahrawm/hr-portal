import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb/connection";
import LeaveRequest from "@/lib/mongodb/models/LeaveRequest";

interface Params {
  params: {
    id: string;
  };
}

// GET single leave request
export async function GET(req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = params;

    const leave = await LeaveRequest.findById(id);

    if (!leave) {
      return NextResponse.json(
        { error: "Leave request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: leave }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// UPDATE leave request
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = params;
    const body = await req.json();

    const updated = await LeaveRequest.findByIdAndUpdate(id, body, {
      new: true,
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Leave request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Leave request updated", data: updated },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE leave request
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = params;

    const deleted = await LeaveRequest.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Leave request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Leave request deleted" },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
