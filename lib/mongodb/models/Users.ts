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
  password: string;
  name: string;
  role: UserRole[]; // Permission role (ADMIN/MANAGER/EMPLOYEE)
  jobTitle: string; // Job title (Backend Developer, Frontend Developer, etc.)
  department: string; // Department (Operations, CyberSecurity, etc.)
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
      required: [true, "Password is required"],
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
      // NEW FIELD
      type: String,
      trim: true,
    },
    department: {
      // NEW FIELD
      type: String,
      trim: true,
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

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
