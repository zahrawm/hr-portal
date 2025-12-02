// src/lib/mongodb/models/Department.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDepartment extends Document {
  _id: string;
  name: string;
  departmentName?: string;
  status?: string;
  description?: string;
  leadId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const departmentSchema = new Schema<IDepartment>(
  {
    name: {
      type: String,
      required: [true, "Department name is required"],
      unique: true,
      trim: true,
    },
    departmentName: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
  },
  {
    timestamps: true,
  }
);

// Remove the Indexes section completely - unique: true already creates an index

const Department: Model<IDepartment> =
  mongoose.models.Department ||
  mongoose.model<IDepartment>("Department", departmentSchema);

export default Department;
