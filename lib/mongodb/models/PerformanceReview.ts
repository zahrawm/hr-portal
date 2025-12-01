// src/lib/mongodb/models/PerformanceReview.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPerformanceReview extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  reviewerId: mongoose.Types.ObjectId;
  periodStart: Date;
  periodEnd: Date;
  rating: number;
  strengths?: string;
  areasForImprovement?: string;
  goals?: string;
  comments?: string;
  status: "DRAFT" | "SUBMITTED" | "ACKNOWLEDGED";
  acknowledgedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const performanceReviewSchema = new Schema<IPerformanceReview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Reviewer ID is required"],
    },
    periodStart: {
      type: Date,
      required: [true, "Period start date is required"],
    },
    periodEnd: {
      type: Date,
      required: [true, "Period end date is required"],
      validate: {
        validator: function (this: IPerformanceReview, value: Date) {
          return value >= this.periodStart;
        },
        message: "Period end date must be after or equal to start date",
      },
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must be at most 5"],
    },
    strengths: {
      type: String,
      trim: true,
    },
    areasForImprovement: {
      type: String,
      trim: true,
    },
    goals: {
      type: String,
      trim: true,
    },
    comments: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["DRAFT", "SUBMITTED", "ACKNOWLEDGED"],
      default: "DRAFT",
    },
    acknowledgedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
performanceReviewSchema.index({ userId: 1 });
performanceReviewSchema.index({ reviewerId: 1 });
performanceReviewSchema.index({ periodStart: 1, periodEnd: 1 });
performanceReviewSchema.index({ status: 1 });

performanceReviewSchema.pre("save", function (next) {
  if (this.userId.equals(this.reviewerId)) {
    next(new Error("An user cannot review themselves"));
  }
  next();
});

const PerformanceReview: Model<IPerformanceReview> =
  mongoose.models.PerformanceReview ||
  mongoose.model<IPerformanceReview>(
    "PerformanceReview",
    performanceReviewSchema
  );

export default PerformanceReview;
