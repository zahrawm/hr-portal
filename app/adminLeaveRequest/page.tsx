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

import ManageEmployeeTable from "@/components/ui/manage-employee-table";
import AddEmployeeForm from "@/components/layout/add-employee";
import EmployeeProfileTable from "@/components/ui/empoyee-profile-table";
import LeaveRequesTable from "@/components/ui/admin-leave-request-table";

type ConflictType = adminLeaveRequest | null;

interface adminLeaveRequest {
  name: string;

  email: string;
  department: string;

  role: string;
  aprove: string;
  deny: string;
}

const adminLeaveRequest: React.FC = () => {
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
    const headers = [
      "Name",
      "Email",
      "Department",
      "Role Name",
      "Status",
      "View",
    ];

    const rows = adminLeaveRequest.map((adminLeaveRequest) => [
      adminLeaveRequest.name,
      adminLeaveRequest.email,
      adminLeaveRequest.department,
      adminLeaveRequest.role,
      adminLeaveRequest.aprove,
      adminLeaveRequest.deny,
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
      `employeeProfile_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const adminLeaveRequest: adminLeaveRequest[] = [
    {
      name: "John Doe",

      email: "john.doe@example.com",

      department: "CyberSecurity",
      role: "Product Developer",

      aprove: "",
      deny: "",
    },
    {
      name: "John Doe",

      email: "john.doe@example.com",

      department: "CyberSecurity",
      role: "Security Analyst",
      aprove: "",
      deny: "",
    },
    {
      name: "Kwame",

      email: "john.doe@example.com",

      department: "Operations",
      role: "PRO",
      aprove: "",
      deny: "",
    },
    {
      name: "Luke",

      email: "lukesmart@gmail.com",

      department: "Operations",
      role: "Chief Executive",
      aprove: "",
      deny: "",
    },
    {
      name: "Luke",

      email: "lukesmart@gmail.com",

      department: "Operations",
      role: "Hr",
      aprove: "",
      deny: "",
    },
    {
      name: "Linda",

      email: "linda@gmail.com",

      department: "Operations",
      role: "Head of Department",
      aprove: "",
      deny: "",
    },
    {
      name: "Yakubu",

      email: "yakubu@gmail.com",

      department: "Operations",
      role: "Security Analyst",
      aprove: "",
      deny: "",
    },
    {
      name: "Swaatson",

      email: "swaatson@gmail.com",

      department: "Software Engineering",
      role: "Backend",
      aprove: "",
      deny: "",
    },
  ];

  const totalPages = 10;

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
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 flex-shrink-0">
            <img
              src="../img/user.svg"
              alt="Employee Profile Icon"
              className="h-6 w-6"
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              Employees Profiles
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              View the list of employees for the HR Mini
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
      {adminLeaveRequest.length === 0 ? (
        // Empty State
        <div className="overflow-hidden rounded-lg bg-white dark:bg-gray-900 shadow">
          <div className="flex flex-col items-center justify-center py-12 sm:py-20 px-4">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <img
                src="../img/department.svg"
                alt="Department Icon"
                className="h-8 w-8"
              />
            </div>

            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 text-center">
              No Employee added yet
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md mb-6 px-4">
              Looks like there are no employees created on HR mini. Click the
              "Refresh" button to reload the page or click the "Create Add
              Employee" button to create a employee
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto px-4">
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
        <div className="overflowEmploye-hidden rounded-lg bg-white dark:bg-gray-900 shadow">
          <div className="overflow-x-auto">
            <LeaveRequesTable tableDetails={adminLeaveRequest} />
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default adminLeaveRequest;
