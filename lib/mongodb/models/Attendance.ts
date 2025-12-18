import mongoose, { Schema, Document, Model } from "mongoose";
export { default as User } from "./Users";

export interface IAttendance extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  date: Date;
  clockIn: Date;
  clockOut?: Date;
  hoursWorked?: number;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: [true, "User ID is required"],
      ref: "User", // FIXED: Added back the reference
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: () => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      },
    },
    clockIn: {
      type: Date,
      required: [true, "Clock in time is required"],
      default: Date.now,
    },
    clockOut: {
      type: Date,
      validate: {
        validator: function (this: IAttendance, value: Date) {
          return !value || value > this.clockIn;
        },
        message: "Clock out time must be after clock in time",
      },
    },
    hoursWorked: {
      type: Number,
      min: [0, "Hours worked cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });

attendanceSchema.pre("save", function (next) {
  if (this.clockOut && this.clockIn) {
    const diffMs = this.clockOut.getTime() - this.clockIn.getTime();
    this.hoursWorked = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
  }
  next();
});

const Attendance: Model<IAttendance> =
  mongoose.models.Attendance ||
  mongoose.model<IAttendance>("Attendance", attendanceSchema);

export default Attendance;
