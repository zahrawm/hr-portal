// types/permissions.ts

export enum Role {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  EMPLOYEE = "EMPLOYEE",
}

export enum Permission {
  // Department permissions
  CREATE_DEPARTMENT = "CREATE_DEPARTMENT",
  UPDATE_DEPARTMENT = "UPDATE_DEPARTMENT",
  DELETE_DEPARTMENT = "DELETE_DEPARTMENT",
  VIEW_DEPARTMENT = "VIEW_DEPARTMENT",

  // Role Title permissions
  CREATE_ROLE_TITLE = "CREATE_ROLE_TITLE",
  UPDATE_ROLE_TITLE = "UPDATE_ROLE_TITLE",
  DELETE_ROLE_TITLE = "DELETE_ROLE_TITLE",
  VIEW_ROLE_TITLE = "VIEW_ROLE_TITLE",

  // Leave Request permissions
  CREATE_LEAVE_REQUEST = "CREATE_LEAVE_REQUEST",
  UPDATE_OWN_LEAVE_REQUEST = "UPDATE_OWN_LEAVE_REQUEST",
  DELETE_OWN_LEAVE_REQUEST = "DELETE_OWN_LEAVE_REQUEST",
  VIEW_OWN_LEAVE_REQUEST = "VIEW_OWN_LEAVE_REQUEST",
  APPROVE_LEAVE_REQUEST = "APPROVE_LEAVE_REQUEST",
  DENY_LEAVE_REQUEST = "DENY_LEAVE_REQUEST",
  VIEW_ALL_LEAVE_REQUESTS = "VIEW_ALL_LEAVE_REQUESTS",

  // Attendance permissions
  CLOCK_IN_OUT_SELF = "CLOCK_IN_OUT_SELF",
  EDIT_ATTENDANCE = "EDIT_ATTENDANCE",
  VIEW_OWN_ATTENDANCE = "VIEW_OWN_ATTENDANCE",
  VIEW_ALL_ATTENDANCE = "VIEW_ALL_ATTENDANCE",

  // User management
  VIEW_USERS = "VIEW_USERS",
  MANAGE_USERS = "MANAGE_USERS",
}

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    // Admin has ALL permissions
    Permission.CREATE_DEPARTMENT,
    Permission.UPDATE_DEPARTMENT,
    Permission.DELETE_DEPARTMENT,
    Permission.VIEW_DEPARTMENT,
    Permission.CREATE_ROLE_TITLE,
    Permission.UPDATE_ROLE_TITLE,
    Permission.DELETE_ROLE_TITLE,
    Permission.VIEW_ROLE_TITLE,
    Permission.CREATE_LEAVE_REQUEST,
    Permission.UPDATE_OWN_LEAVE_REQUEST,
    Permission.DELETE_OWN_LEAVE_REQUEST,
    Permission.VIEW_OWN_LEAVE_REQUEST,
    Permission.APPROVE_LEAVE_REQUEST,
    Permission.DENY_LEAVE_REQUEST,
    Permission.VIEW_ALL_LEAVE_REQUESTS,
    Permission.CLOCK_IN_OUT_SELF,
    Permission.EDIT_ATTENDANCE,
    Permission.VIEW_OWN_ATTENDANCE,
    Permission.VIEW_ALL_ATTENDANCE,
    Permission.VIEW_USERS,
    Permission.MANAGE_USERS,
  ],

  [Role.MANAGER]: [
    Permission.VIEW_DEPARTMENT,
    Permission.VIEW_ROLE_TITLE,
    Permission.CREATE_LEAVE_REQUEST,
    Permission.UPDATE_OWN_LEAVE_REQUEST,
    Permission.DELETE_OWN_LEAVE_REQUEST,
    Permission.VIEW_OWN_LEAVE_REQUEST,
    Permission.APPROVE_LEAVE_REQUEST, // For their reports
    Permission.DENY_LEAVE_REQUEST, // For their reports
    Permission.VIEW_ALL_LEAVE_REQUESTS, // Can view team requests
    Permission.CLOCK_IN_OUT_SELF,
    Permission.EDIT_ATTENDANCE, // Can edit team attendance
    Permission.VIEW_OWN_ATTENDANCE,
    Permission.VIEW_ALL_ATTENDANCE, // Can view team attendance
    Permission.VIEW_USERS,
  ],

  [Role.EMPLOYEE]: [
    Permission.VIEW_DEPARTMENT,
    Permission.VIEW_ROLE_TITLE,
    Permission.CREATE_LEAVE_REQUEST,
    Permission.UPDATE_OWN_LEAVE_REQUEST,
    Permission.DELETE_OWN_LEAVE_REQUEST, // Only DRAFT/PENDING
    Permission.VIEW_OWN_LEAVE_REQUEST,
    Permission.CLOCK_IN_OUT_SELF,
    Permission.VIEW_OWN_ATTENDANCE,
  ],
};

export interface User {
  id: string;
  email: string;
  role: Role;
  managerId?: string | null;
}

export enum LeaveRequestStatus {
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  DENIED = "DENIED",
}
