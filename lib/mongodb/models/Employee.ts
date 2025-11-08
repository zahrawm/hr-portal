// src/lib/mongodb/models/Employee.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEmployee extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  employeeId: string;
  departmentId?: mongoose.Types.ObjectId;
  roleTitleId?: mongoose.Types.ObjectId;
  startDate: Date;
  endDate?: Date;
  managerId?: mongoose.Types.ObjectId;
  salary: number;
  phone?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const employeeSchema = new Schema<IEmployee>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      unique: true,
    },
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      unique: true,
      uppercase: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
    },
    roleTitleId: {
      type: Schema.Types.ObjectId,
      ref: "RoleTitle",
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
    },
    salary: {
      type: Number,
      required: [true, "Salary is required"],
      min: [0, "Salary cannot be negative"],
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    emergencyContact: {
      name: {
        type: String,
        trim: true,
      },
      relationship: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
employeeSchema.index({ userId: 1 });
employeeSchema.index({ employeeId: 1 });
employeeSchema.index({ departmentId: 1 });
employeeSchema.index({ managerId: 1 });
employeeSchema.index({ isActive: 1 });

const Employee: Model<IEmployee> =
  mongoose.models.Employee ||
  mongoose.model<IEmployee>("Employee", employeeSchema);

export default Employee;
