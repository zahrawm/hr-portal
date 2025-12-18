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

type ConflictType = Attendance | null;

interface Attendance {
  _id?: string;
  name: string;
  employeeId: number;
  timeIn: string;
  timeOut: string;
  status: string;
}

const AdminAttendace: React.FC = () => {
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
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showClockInNotification, setShowClockInNotification] = useState(false);
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(
    null
  );
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    setShowSuccessNotification(true);
    setTimeout(() => {
      setShowSuccessNotification(false);
    }, 5000);
  };

  const handleDelete = () => {
    console.log("Deleting user:", selectedConflict);
    closeModal();
  };

  const handleResetPin = () => {
    console.log("Resetting PIN for user:", selectedConflict);
    closeModal();
  };

  const fetchAttendanceRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");

      console.log("=== FETCHING ATTENDANCE ===");
      console.log("API URL:", `${process.env.NEXT_PUBLIC_API_URL}/attendance`);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/attendance?limit=1000`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      console.log("Response status:", response.status);

      const result = await response.json();
      console.log("Full API response:", result);

      if (result.success && result.data) {
        console.log("Raw data from API:", result.data);
        console.log("Number of records received:", result.data.length);

        // Transform the backend data to match the frontend format
        const transformedData = result.data.map(
          (record: any, index: number) => {
            console.log(`\n=== Processing record ${index} ===`);
            console.log("Full record:", JSON.stringify(record, null, 2));

            // Check if userId is populated (object) or just a string ID
            const isPopulated =
              typeof record.employeeId === "object" &&
              record.employeeId !== null;

            let userName = "Unknown";
            let employeeIdValue = "N/A";

            if (isPopulated) {
              // userId is populated with user data
              userName =
                record.employeeId.name ||
                record.employeeId.fullName ||
                "Unknown";
              employeeIdValue =
                record.employeeId.employeeId || record.employeeId._id || "N/A";
              console.log(
                "✓ Populated user - Name:",
                userName,
                "ID:",
                employeeIdValue
              );
            } else {
              // userId is just a string - use it as the ID
              employeeIdValue = record.employeeId || "N/A";
              console.log("✗ Non-populated employeeId:", employeeIdValue);
            }

            const transformed = {
              _id: record._id,
              name: userName,
              employeeId: employeeIdValue,
              timeIn: record.clockIn
                ? new Date(record.clockIn).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })
                : "Not clocked in",
              timeOut: record.clockOut
                ? new Date(record.clockOut).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })
                : "Not clocked out",
              status: "Active",
            };

            console.log("Transformed:", transformed);
            return transformed;
          }
        );

        console.log("\n=== FINAL RESULTS ===");
        console.log("Total transformed records:", transformedData.length);
        console.log("All transformed data:", transformedData);

        setAttendance(transformedData);
      } else {
        console.error("API returned error:", result.error);
        setError(result.error || "Failed to fetch attendance records");
      }
    } catch (error: any) {
      console.error("Error fetching attendance records:", error);
      setError("Error fetching attendance records: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  const handleExportCSV = () => {
    // Define CSV headers
    const headers = [
      "Employee Name",
      "Employee ID",
      "Time In",
      "Time Out",
      "Status",
    ];

    // Map user data to CSV rows
    const rows = attendance.map((attendance) => [
      attendance.name,
      attendance.employeeId,
      attendance.timeIn,
      attendance.timeOut,
      attendance.status,
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
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
  };

  const totalPages = 10;

  return (
    <AppLayout>
      {/* Clock-In Success Notification */}
      {showClockInNotification && (
        <div className="fixed right-4 top-4 z-50 flex items-center gap-3 rounded-lg bg-green-500 px-6 py-3 shadow-lg max-w-md">
          <span className="font-medium text-white text-sm">
            Clock-In Successful
          </span>
          <button
            onClick={() => setShowClockInNotification(false)}
            className="ml-auto rounded-full p-1 hover:bg-green-600 flex-shrink-0"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
      )}

      {/* Success Notification */}
      {showSuccessNotification && (
        <div className="fixed right-4 top-4 z-50 flex items-center gap-3 rounded-lg bg-green-500 px-4 py-3 text-white shadow-lg max-w-md">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <span className="font-medium text-sm sm:text-base">
            New user added successfully
          </span>
          <button
            onClick={() => setShowSuccessNotification(false)}
            className="ml-2 rounded-full p-1 hover:bg-green-600 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

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

      {/* Loading State */}
      {loading && (
        <div className="overflow-hidden rounded-lg bg-white dark:bg-gray-900 shadow">
          <div className="flex flex-col items-center justify-center py-12 sm:py-20 px-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Loading attendance records...
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
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
              onClick={fetchAttendanceRecords}
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
      )}

      {/* User Table or Empty State */}
      {!loading && !error && attendance.length === 0 ? (
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
              No Attendance Records Found
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md mb-6 px-4">
              No attendance records found. Check the console for debugging info,
              or try creating attendance by clocking in.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto px-4">
              <button
                onClick={fetchAttendanceRecords}
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
      ) : !loading && !error ? (
        // Table with data
        <div className="overflow-hidden rounded-lg bg-white dark:bg-gray-900 shadow">
          <div className="overflow-x-auto">
            <AdminAttendanceTable tableDetails={attendance} />
          </div>
        </div>
      ) : null}
    </AppLayout>
  );
};

export default AdminAttendace;
