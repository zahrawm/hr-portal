// src/lib/mongodb/models/Department.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDepartment extends Document {
  _id: string;
  name: string;
  code: string;
  description?: string;
  leadId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const departmentSchema = new Schema<IDepartment>(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Department code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    leadId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
departmentSchema.index({ name: 1 });
departmentSchema.index({ code: 1 });

const Department: Model<IDepartment> = 
  mongoose.models.Department || mongoose.model<IDepartment>('Department', departmentSchema);

export default Department;