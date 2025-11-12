// src/lib/mongodb/models/RoleTitle.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRoleTitle extends Document {
  _id: string;
  name: string;
  level: number;
  minSalary: number;
  maxSalary: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const roleTitleSchema = new Schema<IRoleTitle>(
  {
    name: {
      type: String,
      required: [true, 'Role title name is required'],
      unique: true,
      trim: true,
    },
    level: {
      type: Number,
      required: [true, 'Level is required'],
      min: [1, 'Level must be at least 1'],
    },
    minSalary: {
      type: Number,
      required: [true, 'Minimum salary is required'],
      min: [0, 'Minimum salary cannot be negative'],
    },
    maxSalary: {
      type: Number,
      required: [true, 'Maximum salary is required'],
      min: [0, 'Maximum salary cannot be negative'],
      validate: {
        validator: function(this: IRoleTitle, value: number) {
          return value >= this.minSalary;
        },
        message: 'Maximum salary must be greater than or equal to minimum salary',
      },
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

// Indexes
roleTitleSchema.index({ name: 1 });
roleTitleSchema.index({ level: 1 });

const RoleTitle: Model<IRoleTitle> = 
  mongoose.models.RoleTitle || mongoose.model<IRoleTitle>('RoleTitle', roleTitleSchema);

export default RoleTitle;