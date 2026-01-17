// src/lib/mongodb/models/Users.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export enum UserRole {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  EMPLOYEE = "EMPLOYEE",
}

export interface IUser extends Document {
  _id: string;
  email: string;
  password?: string; // Made optional for Clerk users
  name: string;
  role: UserRole[]; // Permission role (ADMIN/MANAGER/EMPLOYEE)
  jobTitle?: string; // Job title (Backend Developer, Frontend Developer, etc.)
  department?: string; // Department (Operations, CyberSecurity, etc.)
  // clerkId?: string; // Clerk authentication ID
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: false, // Not required for Clerk users
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    role: {
      type: [String],
      default: [UserRole.EMPLOYEE],
      enum: Object.values(UserRole),
    },
    jobTitle: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    // clerkId: {
    //   type: String,
    //   unique: true,
    //   sparse: true, // Allows null values while maintaining uniqueness for non-null values
    //   trim: true,
    // },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
userSchema.index({ email: 1 });
// userSchema.index({ clerkId: 1 });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
