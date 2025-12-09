// src/lib/mongodb/models/RoleTitle.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRoleTitle extends Document {
  _id: string;
  roleName: string;
  status?: string;
  description?: string;
  leadId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const roleTitleSchema = new Schema<IRoleTitle>(
  {
    roleName: {
      type: String,
      required: [true, "Role title name is required"],
      // REMOVED: unique: true - allows multiple roles with same name
      trim: true,
    },
    status: {
      type: String,
      trim: true,
      default: "Active",
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Drop the old model to avoid caching issues
if (mongoose.models.RoleTitle) {
  delete mongoose.models.RoleTitle;
}

const RoleTitle: Model<IRoleTitle> = mongoose.model<IRoleTitle>(
  "RoleTitle",
  roleTitleSchema
);

export default RoleTitle;
