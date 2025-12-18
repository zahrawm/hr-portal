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
import EmployeeAttendanceTable from "@/components/ui/employee-attendance-table";
import axios from "axios";

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

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching attendance data...");
      console.log("API URL:", `${process.env.NEXT_PUBLIC_API_URL}/attendance`);

      // Don't filter by date - fetch all records
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/attendance`,
        {
          params: { limit: 1000 }, // Remove date filter to get all records
          ...getAuthHeaders(),
        }
      );

      console.log("Full attendance response:", response.data);
      console.log("Number of records:", response.data.data?.length);

      if (response.data.success && response.data.data) {
        console.log("Raw data from API:", response.data.data);

        const formattedData = response.data.data.map(
          (record: any, index: number) => {
            console.log(`Processing record ${index}:`, record);

            // Get the date from either date field or clockIn
            const recordDate = record.date || record.clockIn;

            // Format the date properly
            let formattedDate = "N/A";
            let formattedTime = "N/A";

            if (recordDate) {
              const dateObj = new Date(recordDate);
              formattedDate = dateObj.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              });

              // Use clockIn for time if available, otherwise use date
              const timeSource = record.clockIn || recordDate;
              formattedTime = new Date(timeSource).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              });
            }

            const formatted = {
              name: record.userId?.name || "Unknown",
              employeeId: record.userId?.employeeId || record.userId?._id || 0,
              status: "Active",
              time: `${formattedDate} ${formattedTime}`,
            };

            console.log(`Formatted record ${index}:`, formatted);
            return formatted;
          }
        );

        console.log("Total formatted records:", formattedData.length);
        console.log("Formatted data:", formattedData);
        setAttendance(formattedData);
      } else {
        console.warn("No data in response");
        setAttendance([]);
      }
    } catch (error: any) {
      console.error("Error fetching attendance:", error);
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);
      console.error("Error message:", error.message);
      setError(
        error.response?.data?.error ||
          error.message ||
          "Failed to fetch attendance"
      );
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

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
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/attendance`,
        {
          params: { limit: 1000 },
          ...getAuthHeaders(),
        }
      );

      if (response.data.success) {
        const headers = [
          "Employee Name",
          "Employee ID",
          "Clock In",
          "Clock Out",
          "Date",
        ];

        const rows = response.data.data.map((record: any) => [
          record.userId?.name || "Unknown",
          record.userId?.employeeId || record.userId?._id || "N/A",
          record.clockIn ? new Date(record.clockIn).toLocaleString() : "N/A",
          record.clockOut ? new Date(record.clockOut).toLocaleString() : "N/A",
          record.date ? new Date(record.date).toLocaleDateString() : "N/A",
        ]);

        const csvContent = [
          headers.join(","),
          ...rows.map((row: any[]) => row.map((cell) => `"${cell}"`).join(",")),
        ].join("\n");

        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);

        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `attendance_${new Date().toISOString().split("T")[0]}.csv`
        );
        link.style.visibility = "hidden";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Error exporting CSV:", error);
    }
  };

  const totalPages = 10;

  if (loading) {
    return (
      <AppLayout>
        <div className="overflow-hidden rounded-lg bg-white dark:bg-gray-900 shadow">
          <div className="flex flex-col items-center justify-center py-12 sm:py-20 px-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Loading attendance records...
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="overflow-hidden rounded-lg bg-white dark:bg-gray-900 shadow">
          <div className="flex flex-col items-center justify-center py-12 sm:py-20 px-4">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <X className="h-8 w-8 text-red-600 dark:text-red-300" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 text-center">
              Error Loading Attendance
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md mb-6 px-4">
              {error}
            </p>
            <button
              onClick={fetchAttendanceData}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 transition-colors"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Retry
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
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
      {attendance.length === 0 ? (
        // Empty State
        <div className="overflow-hidden rounded-lg bg-white dark:bg-gray-900 shadow">
          <div className="flex flex-col items-center justify-center py-12 sm:py-20 px-4">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <img
                src="../img/plus.svg"
                alt="Department Icon"
                className="h-8 w-8 dark:brightness-0 dark:invert"
              />
            </div>

            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 text-center">
              No Results found
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md mb-6 px-4">
              Looks like there are no attendance records on HR mini. Click the
              "Refresh" button to reload the page.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto px-4">
              <button
                onClick={fetchAttendanceData}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Table with data
        <div className="overflow-hidden rounded-lg bg-white dark:bg-gray-900 shadow">
          <div className="overflow-x-auto">
            <EmployeeAttendanceTable userId={undefined} />
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default EmployeeAttendace;
