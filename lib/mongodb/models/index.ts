// src/lib/mongodb/models/index.ts

// Export all models as named exports
export { default as User } from "./Users";

export { default as Department } from "./Department";
export { default as RoleTitle } from "./RoleTitle";
export { default as LeaveRequest } from "./LeaveRequest";
export { default as Attendance } from "./Attendance";
export { default as PerformanceReview } from "./PerformanceReview";

// Export TypeScript interfaces/types

export type { IDepartment } from "./Department";
export type { IRoleTitle } from "./RoleTitle";
export type { ILeaveRequest } from "./LeaveRequest";
export type { IAttendance } from "./Attendance";
export type { IPerformanceReview } from "./PerformanceReview";

// Export enums

