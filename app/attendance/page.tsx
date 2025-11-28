"use client";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/app";
import UserTable from "@/components/ui/table";
import DepartmentModal from "@/components/layout/create-department-modal";
import AdminAttendanceTable from "@/components/ui/admin-attendance-table";

type ConflictType = Attendance | null;

interface Attendance {
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
  const [showClockInNotification, setShowClockInNotification] = useState(true);
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(
    null
  );

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

  const attendance: Attendance[] = [
    {
      name: "Luke Smart",
      employeeId: 202541,
      status: "Active",
      timeIn: "10 : 02 AM",
      timeOut: "5 : 00 PM",
    },
    {
      name: "Yakubu",
      employeeId: 202542,
      status: "Active",
      timeIn: "10 : 02 AM",
      timeOut: "5 : 00 PM",
    },
    {
      name: "Ernest",
      employeeId: 202543,
      status: "Active",
      timeIn: "10 : 02 AM",
      timeOut: "5 : 00 PM",
    },
    {
      name: "Swaatson",
      employeeId: 202544,
      status: "Active",
      timeIn: "10 : 02 AM",
      timeOut: "5 : 00 PM",
    },
    {
      name: "John Doe",
      employeeId: 202545,
      status: "Active",
      timeIn: "10 : 02 AM",
      timeOut: "5 : 00 PM",
    },
    {
      name: "Henry",
      employeeId: 202546,
      status: "Active",
      timeIn: "10 : 02 AM",
      timeOut: "5 : 00 PM",
    },
    {
      name: "Emmanuel",
      employeeId: 202547,
      status: "Active",
      timeIn: "10 : 02 AM",
      timeOut: "5 : 00 PM",
    },
    {
      name: "Alberta",
      employeeId: 202548,
      status: "Active",
      timeIn: "10 : 02 AM",
      timeOut: "5 : 00 PM",
    },
  ];

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
              className="h-6 w-6"
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              Attendance
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Check all the attendance on the HR Mini
            </p>
          </div>
        </div>
        <button
          onClick={handleExportCSV}
          className="mr-10 w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg border border-gray-600 dark:border-gray-500 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <img
            src="../img/leftf.svg"
            alt="Department Icon"
            className="h-4 w-4"
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
                className="h-8 w-8"
              />
            </div>

            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 text-center">
              No Results found
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md mb-6 px-4">
              Looks like there are no attendance created on HR mini. Click the
              "Refresh" button to reload the page or click the "Create
              Department" button to create a department
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto px-4">
              <button
                onClick={() => {
                  setShowViewModal(true);
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-[#02AA69] px-4 py-2 text-sm font-medium text-white hover:bg-[#029858] transition-colors"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="7" />
                  <path d="M12 9v6M9 12h6" strokeLinecap="round" />
                </svg>
                Create Department
              </button>
              {showViewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div
                    className="absolute inset-0 bg-black opacity-50"
                    onClick={closeModal}
                  ></div>
                  <div className="relative z-[60] rounded-lg bg-white shadow-lg w-full max-w-2xl">
                    <DepartmentModal
                      onClose={closeModal}
                      visible={showViewModal}
                      onSuccess={handleUserAddSuccess}
                    />
                  </div>
                </div>
              )}

              <button className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
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
            <AdminAttendanceTable tableDetails={attendance} />
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default AdminAttendace;
