// src/lib/mongodb/models/Users.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export enum UserRole {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  EMPLOYEE = "EMPLOYEE",
}

export interface IUser extends Document {
  _id: string;
  clerkId?: string; // ✅ NEW: Clerk user ID (optional for users who login via Clerk)
  email: string;
  password?: string; // ✅ Make optional for Clerk users
  name: string;
  role: UserRole[];
  jobTitle: string;
  department: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    clerkId: {
      // ✅ NEW FIELD
      type: String,
      unique: true,
      sparse: true, // Allow null/undefined values to be non-unique
      trim: true,
    },
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
      required: function (this: IUser) {
        // Only required if clerkId is not present
        return !this.clerkId;
      },
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
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster lookups
userSchema.index({ clerkId: 1 });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
