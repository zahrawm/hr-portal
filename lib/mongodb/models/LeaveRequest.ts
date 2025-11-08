// src/lib/mongodb/models/LeaveRequest.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export enum LeaveType {
  ANNUAL = "ANNUAL",
  SICK = "SICK",
  UNPAID = "UNPAID",
  SPECIAL = "SPECIAL",
}

export enum LeaveStatus {
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  DENIED = "DENIED",
}

export interface ILeaveRequest extends Document {
  _id: string;
  employeeId: mongoose.Types.ObjectId;
  type: LeaveType;
  status: LeaveStatus;
  startDate: Date;
  endDate: Date;
  reason?: string;
  approverId?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  denialReason?: string;
  daysCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const leaveRequestSchema = new Schema<ILeaveRequest>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: [true, "Employee ID is required"],
    },
    type: {
      type: String,
      enum: Object.values(LeaveType),
      required: [true, "Leave type is required"],
    },
    status: {
      type: String,
      enum: Object.values(LeaveStatus),
      default: LeaveStatus.DRAFT,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
      validate: {
        validator: function (this: ILeaveRequest, value: Date) {
          return value >= this.startDate;
        },
        message: "End date must be after or equal to start date",
      },
    },
    reason: {
      type: String,
      trim: true,
    },
    approverId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
    },
    approvedAt: {
      type: Date,
    },
    denialReason: {
      type: String,
      trim: true,
    },
    daysCount: {
      type: Number,
      default: 1,
      min: [0, "Days count cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
leaveRequestSchema.index({ employeeId: 1 });
leaveRequestSchema.index({ status: 1 });
leaveRequestSchema.index({ startDate: 1, endDate: 1 });
leaveRequestSchema.index({ approverId: 1 });

// Calculate days count before saving
leaveRequestSchema.pre("save", function (next) {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(
      this.endDate.getTime() - this.startDate.getTime()
    );
    this.daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
  next();
});

const LeaveRequest: Model<ILeaveRequest> =
  mongoose.models.LeaveRequest ||
  mongoose.model<ILeaveRequest>("LeaveRequest", leaveRequestSchema);

export default LeaveRequest;
