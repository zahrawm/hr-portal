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
import ManageEmployeeTable from "@/components/ui/manage-employee-table";
import AddEmployeeForm from "@/components/layout/add-employee";
import { useRouter } from "next/navigation";
import ManageLeaveRequestTable from "@/components/ui/manage-leave-request-table";

type ConflictType = adminLeaveRequest | null;

interface adminLeaveRequest {
  _id?: string;
  name: string;
  email: string;
  department: string;
  status: string;
  role: string;
  aprove?: string;
  deny?: string;
  view: string;
  reason?: string;
  startDate?: string;
  endDate?: string;
  daysCount?: number;
  denialReason?: string;
  employeeId?: any;
  approverId?: any;
}

const AdminLeaveRequest: React.FC = () => {
  const router = useRouter();
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
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(
    null
  );
  const [showManageEmployeeModal, setshowMangeEmployeeModal] = useState(false);

  // New state for leave requests
  const [manageLeaveRequests, setManageLeaveRequests] = useState<
    adminLeaveRequest[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch leave requests from API
  const fetchLeaveRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/leave-requests`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch leave requests");
      }

      const result = await response.json();

      let requestsArray = result;

      if (result.data && Array.isArray(result.data)) {
        requestsArray = result.data;
      } else if (!Array.isArray(requestsArray)) {
        requestsArray = [];
      }

      const transformedData = requestsArray.map((request: any) => ({
        _id: request._id || request.id,
        name: request.employeeId?.name || "Unknown",
        email: request.employeeId?.email || "Unknown",
        department: request.employeeId?.department || "N/A",
        status: request.status || "PENDING",
        role: request.employeeId?.jobTitle || "N/A",
        aprove: "",
        deny: "",
        view: "",
        reason: request.reason,
        startDate: request.startDate,
        endDate: request.endDate,
        daysCount: request.daysCount,
        denialReason: request.denialReason,
        employeeId: request.employeeId,
        approverId: request.approverId,
      }));

      setManageLeaveRequests(transformedData);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching leave requests:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      setIsLoading(false);
    }
  };

  // Fetch leave requests on component mount
  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const closeModal = () => {
    setShowViewModal(false);
    setshowMangeEmployeeModal(false);
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
    console.log("Deleting employee:", selectedConflict);
    closeModal();
  };

  const handleResetPin = () => {
    console.log("Resetting PIN for user:", selectedConflict);
    closeModal();
  };

  const handleExportCSV = () => {
    // Define CSV headers
    const headers = ["Name", "Email", "Department", "Role Name"];

    const rows = manageLeaveRequests.map((adminLeaveRequest) => [
      adminLeaveRequest.name,
      adminLeaveRequest.email,
      adminLeaveRequest.department,
      adminLeaveRequest.role,
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
      `leaveRequests_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = 10;

  // Loading State
  if (isLoading) {
    return (
      <AppLayout>
        <div className="overflow-hidden rounded-lg bg-white dark:bg-gray-900 shadow">
          <div className="flex flex-col items-center justify-center py-12 sm:py-20 px-4">
            <div className="text-gray-400 dark:text-gray-500 mb-3">
              <svg
                className="animate-spin h-12 w-12 mx-auto"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
              Loading leave requests...
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Error State
  if (error) {
    return (
      <AppLayout>
        <div className="overflow-hidden rounded-lg bg-white dark:bg-gray-900 shadow">
          <div className="flex flex-col items-center justify-center py-12 sm:py-20 px-4">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <X className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Error Loading Leave Requests
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
              Unable to load leave requests. Please try again.
            </p>
            <button
              onClick={fetchLeaveRequests}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#02AA69] px-4 py-2 text-sm font-medium text-white hover:bg-[#029858] transition-colors"
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
      {/* Success Notification */}
      {showSuccessNotification && (
        <div className="fixed right-4 top-4 z-50 flex items-center gap-3 rounded-lg bg-green-500 px-4 py-3 text-white shadow-lg max-w-md">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <span className="font-medium text-sm sm:text-base">
            New employees added successfully
          </span>
          <button
            onClick={() => setShowSuccessNotification(false)}
            className="ml-2 rounded-full p-1 hover:bg-green-600 flex-shrink-0"
          >
            <X className="h-4 w-4 dark:brightness-0 dark:invert" />
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 flex-shrink-0">
            <img
              src="../img/leave.svg"
              alt="Leave Request Icon"
              className="h-6 w-6 dark:brightness-0 dark:invert"
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              Leave Requests Management
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Review and manage employee leave requests
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
            className="h-4 w-4 dark:brightness-0 dark:invert"
          />
          Export CSV
        </button>
      </div>

      {/* User Table or Empty State */}
      {manageLeaveRequests.length === 0 ? (
        // Empty State
        <div className="overflow-hidden rounded-lg bg-white dark:bg-gray-900 shadow">
          <div className="flex flex-col items-center justify-center py-12 sm:py-20 px-4">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <img
                src="../img/leave.svg"
                alt="Leave Icon"
                className="h-8 w-8 dark:brightness-0 dark:invert"
              />
            </div>

            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 text-center">
              No Leave Requests Yet
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md mb-6 px-4">
              There are no leave requests to review at the moment. New requests
              will appear here when employees submit them.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto px-4">
              <button
                onClick={fetchLeaveRequests}
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
            <ManageLeaveRequestTable
              tableDetails={manageLeaveRequests}
              onRefresh={fetchLeaveRequests}
            />
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default AdminLeaveRequest;
