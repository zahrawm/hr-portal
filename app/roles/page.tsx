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
import RoleTable from "@/components/ui/roles-table";
import RoleModal from "@/components/layout/add-role-modal";

type ConflictType = Roles | null;

interface Roles {
  actions: string;
  roleName: string;
  description: string;
  department: string;
  status: string;
  dateCreated: string;
  role: string;
}

const RolesManagement: React.FC = () => {
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
  const [showRowViewModal, setShowRowViewModal] = useState(false);
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
    console.log("Deletingrole:", selectedConflict);
    closeModal();
  };

  const handleExportCSV = async () => {
    try {
      // Fetch latest data from API
      const response = await fetch("/api/role-titles");
      const result = await response.json();

      if (!result.success || !result.data || result.data.length === 0) {
       // alert("No roles to export");
        return;
      }

      const roleTitles = result.data;

      const headers = ["Role Name", "Description", "Status", "Date Created"];

      const rows = roleTitles.map((role: any) => {
        const date = new Date(role.createdAt);
        const formattedDate = date
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          })
          .replace(/\//g, "/");
        const formattedTime = date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });

        return [
          role.roleName,
          role.description || "",
          role.status || "Active",
          `${formattedDate} | ${formattedTime}`,
        ];
      });

      // Combine headers and rows
      const csvContent = [
        headers.join(","),
        ...rows.map((row: any) =>
          row.map((cell: any) => `"${cell}"`).join(",")
        ),
      ].join("\n");

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `roles_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      alert("Failed to export CSV");
    }
  };

  const roles: Roles[] = [
    {
      actions: "",
      roleName: "Product Designer",
      description: "Creative intuitive product.....",
      status: "Active",
      dateCreated: "26/10/25|12:41 AM",
      department: "",
      role: "",
    },
    {
      actions: "",
      roleName: "Security Analyst",
      description: "Marketing and Sales Growth...",
      status: "Active",
      dateCreated: "26/10/25|12:41 AM",
      department: "",
      role: "",
    },
    {
      actions: "",
      roleName: "Backend Developer",
      description: "Creative intuitive product.....",
      status: "Active",
      dateCreated: "26/10/25|12:41 AM",
      department: "",
      role: "",
    },
    {
      actions: "",
      roleName: "Frontend Developer",
      description: "Creative intuitive product.....",
      status: "Active",
      dateCreated: "26/10/25|12:41 AM",
      department: "",
      role: "",
    },
    {
      actions: "",
      roleName: "UI Designer",
      description: "Hoummann.",
      status: "Active",
      dateCreated: "26/10/25|12:41 AM",
      department: "",
      role: "",
    },
    {
      actions: "",
      roleName: "Product Designer",
      description: "Branding Awareness Growth.....",
      status: "Active",
      dateCreated: "26/10/25|12:41 AM",
      department: "",
      role: "",
    },
    {
      actions: "",
      roleName: "AI Developer",
      description: "Creative intuitive product.....",
      status: "Active",
      dateCreated: "26/10/25|12:41 AM",
      department: "",
      role: "",
    },
    {
      actions: "",
      roleName: "ML Developer",
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
        <div className="fixed right-4 top-4 z-50 flex items-center gap-3 rounded-lg bg-green-500 px-4 py-3 text-white shadow-lg max-w-md">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <span className="font-medium text-sm sm:text-base">
            New roles created successfully
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
              src="../img/square.svg"
              alt="Role Icon"
              className="h-6 w-6 dark:brightness-0 dark:invert"
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              Roles
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Manage the roles titles for the HR Mini
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
      {roles.length === 0 ? (
        // Empty State
        <div className="overflow-hidden rounded-lg bg-white dark:bg-gray-900 shadow">
          <div className="flex flex-col items-center justify-center py-12 sm:py-20 px-4">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <img
                src="../img/square.svg"
                alt="Roles Icon"
                className="h-8 w-8 dark:brightness-0 dark:invert"
              />
            </div>

            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 text-center">
              No Roles yet
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md mb-6 px-4">
              Looks like there are no roles created on HR mini. Click the
              "Refresh" button to reload the page or click the "Add Role" button
              to add a role
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto px-4">
              <button
                onClick={() => {
                  setShowRowViewModal(true);
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-[#02AA69] px-4 py-3 text-sm font-medium text-white hover:bg-[#029858] transition-colors"
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
                Add Role
              </button>
              {/* AddNewUserForm Modal */}
              {showRowViewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div
                    className="absolute inset-0 bg-black opacity-50"
                    onClick={closeModal}
                  ></div>
                  <div className="relative z-[60] rounded-lg bg-white shadow-lg w-full max-w-2xl">
                    <RoleModal
                      onClose={closeModal}
                      visible={showRowViewModal}
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
            <RoleTable tableDetails={roles} />
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default RolesManagement;
