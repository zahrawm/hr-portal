"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Edit,
  Ellipsis,
  Eye,
  RotateCcw,
  Search,
  Trash,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Toast } from "./toast";
import EditDepartmentModal from "../layout/edit-department-modal";

import EditEmployeeForm from "../layout/edit-employee";

import { useRouter } from "next/navigation";

type tableData = {
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
};

interface TableProps {
  tableDetails: tableData[];
  onRefresh?: () => void;
}

export default function ManageLeaveRequestTable({
  tableDetails,
  onRefresh,
}: TableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(
    null
  );

  const router = useRouter();

  const handleProfile = () => {
    router.push("/profileContent");
  };

  const handleEdit = (employee: tableData) => {
    localStorage.setItem("editEmployee", JSON.stringify(employee));
    console.log("Storing employee for edit:", employee);
    router.push("/editEmployee");
  };

  const [showEditModal, setShowEditModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showDenyModal, setShowDenyModal] = useState(false);
  const [showResetPinModal, setShowResetPinModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedConflict, setSelectedConflict] = useState<any>(null);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [newDepartmentDescription, setNewDepartmentDescription] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showManageEmployeeModal, setshowMangeEmployeeModal] = useState(false);
  const [showEditManageEmployeeModal, setshowEditMangeEmployeeModal] =
    useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const actionsDropdownRef = useRef<HTMLDivElement>(null);

  const closeModal = () => {
    setshowEditMangeEmployeeModal(false);
    setshowMangeEmployeeModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowResetPinModal(false);
    setSelectedConflict(null);
    setShowApproveModal(false);
    setShowDenyModal(false);
    setSelectedRequest(null);
    setShowDetailsModal(false);
  };

  const handleResetPin = () => {
    console.log("Resetting PIN for user:", selectedConflict);
    closeModal();
  };

  const handleUserAddSuccess = () => {
    setshowEditMangeEmployeeModal(false);
    setToastMessage("Employees Successfully Created");
    setShowToast(true);
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest?._id) return;

    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("/api/leave-requests/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ id: selectedRequest._id }),
      });

      const result = await response.json();

      if (result.success || response.ok) {
        setToastMessage("Leave request approved successfully");
        setShowToast(true);
        closeModal();

        if (onRefresh) {
          setTimeout(() => {
            onRefresh();
          }, 1500);
        } else {
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      } else {
        setToastMessage(
          `Error: ${result.error || "Failed to approve leave request"}`
        );
        setShowToast(true);
      }
    } catch (error) {
      console.error("Error approving leave request:", error);
      setToastMessage("Error approving leave request");
      setShowToast(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeny = async () => {
    if (!selectedRequest?._id) return;

    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("/api/leave-requests/deny", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ id: selectedRequest._id }),
      });

      const result = await response.json();

      if (result.success || response.ok) {
        setToastMessage("Leave request denied successfully");
        setShowToast(true);
        closeModal();

        if (onRefresh) {
          setTimeout(() => {
            onRefresh();
          }, 1500);
        } else {
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      } else {
        setToastMessage(
          `Error: ${result.error || "Failed to deny leave request"}`
        );
        setShowToast(true);
      }
    } catch (error) {
      console.error("Error denying leave request:", error);
      setToastMessage("Error denying leave request");
      setShowToast(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedConflict?._id) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("/api/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ id: selectedConflict._id }),
      });

      const result = await response.json();

      if (result.success || response.ok) {
        setToastMessage("Employee deleted successfully");

        closeModal();

        if (onRefresh) {
          setTimeout(() => {
            onRefresh();
          }, 1500);
        } else {
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      } else {
        setToastMessage(
          `Error: ${result.error || "Failed to delete employee"}`
        );
        setShowToast(true);
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
      setToastMessage("Error deleting employee");
      setShowToast(true);
    }
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setShowApproveModal(false);
    setToastMessage("Employees Edited Successfully");
    setShowToast(true);
    setshowEditMangeEmployeeModal(false);
    if (onRefresh) {
      onRefresh();
    }
  };

  const [filteredData, setFilteredData] = useState<tableData[]>(tableDetails);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState<"all" | "name" | "email">("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (openDropdownIndex !== null && !target.closest(".relative")) {
        setOpenDropdownIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdownIndex]);

  useEffect(() => {
    const filtered = tableDetails.filter((item) => {
      const searchLower = searchTerm.toLowerCase();

      if (filterBy === "name") {
        return item.name.toLowerCase().includes(searchLower);
      } else if (filterBy === "email") {
        return item.email.toLowerCase().includes(searchLower);
      } else {
        return (
          item.name.toLowerCase().includes(searchLower) ||
          item.email.toLowerCase().includes(searchLower)
        );
      }
    });
    setFilteredData(filtered);
  }, [searchTerm, filterBy, tableDetails]);

  const columnHelper = createColumnHelper<tableData>();

  const columns = [
    columnHelper.accessor("name", {
      cell: (info) => (
        <span className="text-sm text-gray-900 dark:text-gray-100">
          {info.getValue()}
        </span>
      ),
      header: () => (
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Name
        </span>
      ),
      size: 250,
    }),
    columnHelper.accessor("email", {
      cell: (info) => (
        <span className="text-sm text-gray-900 dark:text-gray-100">
          {info.getValue()}
        </span>
      ),
      header: () => (
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Email
        </span>
      ),
      size: 180,
    }),
    columnHelper.accessor("department", {
      cell: (info) => (
        <span className="text-sm text-gray-900 dark:text-gray-100">
          {info.getValue()}
        </span>
      ),
      header: () => (
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Department
        </span>
      ),
      size: 300,
    }),
    columnHelper.accessor("role", {
      cell: (info) => (
        <span className="text-sm text-gray-900 dark:text-gray-100">
          {info.getValue()}
        </span>
      ),
      header: () => (
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Role
        </span>
      ),
      size: 300,
    }),
    columnHelper.accessor("status", {
      cell: (info) => (
        <button className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-md">
          <span
            className={`h-2 w-2 rounded-full ${
              info.getValue() === "APPROVED"
                ? "bg-green-500"
                : info.getValue() === "REJECTED"
                ? "bg-red-500"
                : info.getValue() === "PENDING"
                ? "bg-yellow-500"
                : "bg-gray-300 dark:bg-gray-600"
            }`}
          ></span>
          <span
            className={`text-sm font-medium ${
              info.getValue() === "APPROVED"
                ? "text-green-700 dark:text-green-400"
                : info.getValue() === "REJECTED"
                ? "text-red-700 dark:text-red-400"
                : info.getValue() === "PENDING"
                ? "text-yellow-700 dark:text-yellow-400"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {info.getValue()}
          </span>
        </button>
      ),
      header: () => (
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Status
        </span>
      ),
      size: 120,
    }),
    columnHelper.accessor("view", {
      cell: (info) => {
        const row = info.row.original;

        return (
          <div className="flex items-center justify-start">
            <button
              onClick={() => {
                setSelectedRequest(row);
                setShowDetailsModal(true);
                console.log("Selected Request Data:", row);
              }}
              className="flex items-center gap-2 rounded-md border border-gray-900 dark:border-gray-600 bg-white dark:bg-gray-800 px-5 py-2 text-sm font-medium text-gray-900 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              View
            </button>
          </div>
        );
      },
      header: () => (
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          View
        </span>
      ),
      size: 120,
    }),
  ];

  const table = useReactTable<tableData>({
    data: filteredData,
    columns,
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 6,
      },
    },
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <>
      <div className="w-full bg-white dark:bg-gray-900 p-4 sm:p-6">
        <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Type or search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 pl-10 pr-4 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 hover:border-green-500 focus:border-green-500 dark:focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:focus:ring-green-500"
            />
            {showFilterDropdown && (
              <div className="absolute left-0 top-12 z-10 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
                <button
                  onClick={() => {
                    setFilterBy("all");
                    setShowFilterDropdown(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-700"
                >
                  All
                </button>
                <button
                  onClick={() => {
                    setFilterBy("name");
                    setShowFilterDropdown(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-700"
                >
                  Name
                </button>
                <button
                  onClick={() => {
                    setFilterBy("email");
                    setShowFilterDropdown(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-700"
                >
                  Email
                </button>
              </div>
            )}
          </div>

          <div className="w-full sm:w-auto">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <span className="truncate">
                Filter by:{" "}
                {filterBy === "all"
                  ? "All"
                  : filterBy === "name"
                  ? "Name"
                  : "Email"}
              </span>
            </button>
          </div>
        </div>

        {filteredData.length === 0 && tableDetails.length > 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <img
                src="../img/department.svg"
                className="h-8 w-8 text-green-50 dark:text-green-50 dark:brightness-0 dark:invert"
              />
            </div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              No Employees yet
            </h3>

            <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
              Looks like there are was no Employees added on HR mini. Click the
              "Refresh" button to reload the page or click the "Create
              Employees" button to add a department
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (onRefresh) {
                    onRefresh();
                  } else {
                    window.location.reload();
                  }
                }}
                className="w-full sm:w-auto sm:ml-auto rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center gap-2"
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
        )}

        {filteredData.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-2 py-3 text-left border-b border-gray-200 dark:border-gray-700"
                        >
                          <div
                            {...{
                              className: header.column.getCanSort()
                                ? "cursor-pointer select-none"
                                : "",
                              onClick: header.column.getToggleSortingHandler(),
                            }}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-2 py-3">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 gap-3">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                0 of {filteredData.length} row(s) selected.
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="flex-1 sm:flex-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="flex-1 sm:flex-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Side Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={closeModal}
          ></div>
          <div className="relative z-[60] h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto animate-slide-in-right">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Leave Request Details
              </h2>
              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Name
                  </label>
                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {selectedRequest.employeeId?.name ||
                      selectedRequest.name ||
                      "N/A"}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Email
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {selectedRequest.employeeId?.email ||
                      selectedRequest.email ||
                      "N/A"}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Department
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {selectedRequest.department || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Status
                  </label>
                  <p className="mt-1">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        selectedRequest.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                          : selectedRequest.status === "APPROVED"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                      }`}
                    >
                      {selectedRequest.status}
                    </span>
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Leave Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Reason for Leave
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                      {selectedRequest.reason || "No reason provided"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Start Date
                      </label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {selectedRequest.startDate
                          ? new Date(
                              selectedRequest.startDate
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "N/A"}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        End Date
                      </label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {selectedRequest.endDate
                          ? new Date(
                              selectedRequest.endDate
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Duration
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {selectedRequest.daysCount
                        ? `${selectedRequest.daysCount} ${
                            selectedRequest.daysCount === 1 ? "day" : "days"
                          }`
                        : "N/A"}
                    </p>
                  </div>

                  {selectedRequest.denialReason &&
                    selectedRequest.status === "REJECTED" && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          Denial Reason
                        </label>
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {selectedRequest.denialReason}
                        </p>
                      </div>
                    )}
                </div>
              </div>

              {selectedRequest.status === "PENDING" && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleApprove}
                      disabled={isProcessing}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#02AA69] px-4 py-3 text-sm font-medium text-white hover:bg-[#029858] disabled:opacity-50 transition-colors"
                    >
                      {isProcessing ? "Processing..." : "Approve Leave Request"}
                    </button>
                    <button
                      onClick={handleDeny}
                      disabled={isProcessing}
                      className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                    >
                      {isProcessing ? "Processing..." : "Deny Leave Request"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Toast
        message={toastMessage}
        visible={showToast}
        onClose={() => setShowToast(false)}
      />
    </>
  );
}
