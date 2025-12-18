"use client";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  X,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app";
import UserTable from "@/components/ui/table";
import DepartmentModal from "@/components/layout/create-department-modal";
import AdminAttendanceTable from "@/components/ui/admin-attendance-table";

import axios from "axios";
import AttendanceTable from "@/components/ui/attendance-table";
import { Toast } from "@/components/ui/toast";

type ConflictType = Attendance | null;

interface Attendance {
  name: string;
  employeeId: number;
  time: string;
  status: string;
}

const EmployeeAttendace: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("Ghana");
  const [selectedRole, setSelectedRole] = useState("Role");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditApprovalModal, setShowEditApprovalModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showResetPinModal, setShowResetPinModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedConflict, setSelectedConflict] = useState<ConflictType>(null);
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(
    null
  );

  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const closeModal = () => {
    setShowViewModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowApproveModal(false);
    setSelectedConflict(null);
    setShowResetPinModal(false);
    setShowAddUserModal(false);
  };

  const handleUserAddSuccess = () => {
    setShowViewModal(false);
  };

  const handleDelete = () => {
    console.log("Deleting user:", selectedConflict);
    closeModal();
  };

  const handleResetPin = () => {
    console.log("Resetting PIN for user:", selectedConflict);
    closeModal();
  };

  const handleExportCSV = async () => {
    setToastMessage("CSV exported successfully!");
    setShowToast(true);
  };

  const totalPages = 10;
  console.log("Here are the attendance and the error", attendance, error);

  return (
    <>
      <AppLayout>
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 flex-shrink-0">
              <img
                src="../img/plus.svg"
                alt="Attendance Icon"
                className="h-6 w-6 dark:brightness-0 dark:invert"
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                Attendance
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Check all the attendance on the HR Mini ({attendance.length}{" "}
                records)
              </p>
            </div>
          </div>
          <button
            onClick={handleExportCSV}
            disabled={attendance.length === 0}
            className="mr-10 w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg border border-gray-600 dark:border-gray-500 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <img
              src="../img/leftf.svg"
              alt="Department Icon"
              className="h-4 w-4 dark:brightness-0 dark:invert"
            />
            Export CSV
          </button>
        </div>
        {/* User Table or Empty State */}
        <div className="overflow-hidden rounded-lg bg-white dark:bg-gray-900 shadow">
          <div className="overflow-x-auto">
            <AttendanceTable />
          </div>
        </div>
      </AppLayout>
    </>
  );
};

export default EmployeeAttendace;
