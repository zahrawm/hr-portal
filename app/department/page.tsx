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

type ConflictType = User | null;

interface User {
  actions: string;
  departmentName: string;
  description: string;
  department: string;
  status: string;
  dateCreated: string;
  role: string;
}

const UserManagement: React.FC = () => {
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

  const users: User[] = [
    {
      actions: "",
      departmentName: "Operational",
      description: "Branding Awareness Growth.....",
      status: "Active",
      dateCreated: "26/10/25|12:41 AM",
      department: "",
      role: "",
    },
    {
      actions: "",
      departmentName: "Operational",
      description: "Branding Awareness Growth.....",
      status: "Active",
      dateCreated: "26/10/25|12:41 AM",
      department: "",
      role: "",
    },
    {
      actions: "",
      departmentName: "Operational",
      description: "Branding Awareness Growth.....",
      status: "Active",
      dateCreated: "26/10/25|12:41 AM",
      department: "",
      role: "",
    },
    {
      actions: "",
      departmentName: "Operational",
      description: "Branding Awareness Growth.....",
      status: "Active",
      dateCreated: "26/10/25|12:41 AM",
      department: "",
      role: "",
    },
    {
      actions: "",
      departmentName: "Operational",
      description: "Branding Awareness Growth.....",
      status: "Active",
      dateCreated: "26/10/25|12:41 AM",
      department: "",
      role: "",
    },
    {
      actions: "",
      departmentName: "Operational",
      description: "Branding Awareness Growth.....",
      status: "Active",
      dateCreated: "26/10/25|12:41 AM",
      department: "",
      role: "",
    },
    {
      actions: "",
      departmentName: "Operational",
      description: "Branding Awareness Growth.....",
      status: "Active",
      dateCreated: "26/10/25|12:41 AM",
      department: "",
      role: "",
    },
    {
      actions: "",
      departmentName: "Operational",
      description: "Branding Awareness Growth.....",
      status: "Active",
      dateCreated: "26/10/25|12:41 AM",
      department: "",
      role: "",
    },
  ];

  const totalPages = 10;

  return (
    <AppLayout>
      {/* Success Notification */}
      {showSuccessNotification && (
        <div className="fixed right-4 top-4 z-50 flex items-center gap-3 rounded-lg bg-green-500 px-4 py-3 text-white shadow-lg">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">New user added successfully</span>
          <button
            onClick={() => setShowSuccessNotification(false)}
            className="ml-2 rounded-full p-1 hover:bg-green-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
            <img
              src="../img/department.svg"
              alt="Department Icon"
              className="h-6 w-6"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Department
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              View the list of departments for the HR Mini
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-gray-600 dark:border-gray-500 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
          <img
            src="../img/leftf.svg"
            alt="Department Icon"
            className="h-4 w-4"
          />
          Export CSV
        </button>
      </div>

      {/* AddNewUserForm Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={closeModal}
          ></div>
          <div className="relative z-[60] rounded-lg bg-white dark:bg-gray-900 shadow-lg">
            {/* Modal content */}
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={closeModal}
          ></div>
          <div className="relative z-[60] w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 p-8 shadow-xl">
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              ✕
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/30">
                <svg
                  className="h-10 w-10 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z" />
                </svg>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Are you sure you want to delete this user?
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                This action cannot be undone
              </p>

              <div className="mt-6 flex w-full gap-3">
                <button
                  onClick={handleDelete}
                  className="flex-1 rounded-lg bg-yellow-500 px-6 py-3 text-sm font-medium text-white hover:bg-yellow-600"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showResetPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={closeModal}
          ></div>
          <div className="relative z-[60] w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 p-8 shadow-xl">
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              ✕
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/30">
                <svg
                  className="h-10 w-10 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Are you sure you want to reset this user's PIN?
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                This action will invalidate their current PIN and require them
                to create a new one.
              </p>

              <div className="mt-6 flex w-full gap-3">
                <button
                  onClick={handleResetPin}
                  className="flex-1 rounded-lg bg-yellow-500 px-6 py-3 text-sm font-medium text-white hover:bg-yellow-600"
                >
                  Yes, Reset PIN
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Table */}
      <div className="overflow-hidden rounded-lg bg-white dark:bg-gray-900 shadow">
        <div className="overflow-x-auto">
          <UserTable tableDetails={users} />
        </div>
      </div>
    </AppLayout>
  );
};

export default UserManagement;
