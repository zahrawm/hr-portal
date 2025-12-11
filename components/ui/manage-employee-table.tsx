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
} from "lucide-react";
import { useEffect, useState } from "react";

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
  actions: string;
};

interface TableProps {
  tableDetails: tableData[];
  onRefresh?: () => void;
}

export default function ManageEmployeeTable({
  tableDetails,
  onRefresh,
}: TableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(
    null
  );

  const router = useRouter();

  const handleNavigate = () => {
    router.push("/addEmployee");
  };

  const handleEdit = (employee: tableData) => {
    // Store employee data in localStorage before navigating
    localStorage.setItem("editEmployee", JSON.stringify(employee));
    console.log("Storing employee for edit:", employee); // Debug log
    router.push("/editEmployee");
  };

  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showResetPinModal, setShowResetPinModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedConflict, setSelectedConflict] = useState<any>(null);
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [newDepartmentDescription, setNewDepartmentDescription] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showManageEmployeeModal, setshowMangeEmployeeModal] = useState(false);
  const [showEditManageEmployeeModal, setshowEditMangeEmployeeModal] =
    useState(false);

  const closeModal = () => {
    setshowEditMangeEmployeeModal(false);
    setshowMangeEmployeeModal(false);
    setShowViewModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowResetPinModal(false);
    setSelectedConflict(null);
    setShowApproveModal(false);
  };

  const handleResetPin = () => {
    console.log("Resetting PIN for user:", selectedConflict);
    closeModal();
  };

  const handleUserAddSuccess = () => {
    setShowViewModal(false);
    setshowEditMangeEmployeeModal(false);
    setToastMessage("Employees Successfully Created");
    setShowToast(true);
    if (onRefresh) {
      onRefresh();
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
              info.getValue() === "Active"
                ? "bg-green-500"
                : "bg-gray-300 dark:bg-gray-600"
            }`}
          ></span>
          <span
            className={`text-sm font-medium ${
              info.getValue() === "Active"
                ? "text-gray-900 dark:text-gray-100"
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
    columnHelper.accessor("actions", {
      cell: (info) => (
        <div className="relative flex items-center justify-start">
          <button
            onClick={() =>
              setOpenDropdownIndex(
                openDropdownIndex === info.row.index ? null : info.row.index
              )
            }
            className="flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Ellipsis className="h-5 w-5" />
          </button>
          {openDropdownIndex === info.row.index && (
            <div className="absolute right-0 top-8 z-10 w-40 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
              <button
                onClick={() => {
                  handleEdit(info.row.original);
                  setOpenDropdownIndex(null);
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <img
                  src="../img/edit.svg"
                  className="h-4 w-4 text-green-50 dark:text-green-50 brightness-0 invert"
                />
                Edit
              </button>

              <button
                onClick={() => {
                  setShowDeleteModal(true);
                  setSelectedConflict(info.row.original);
                  setOpenDropdownIndex(null);
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <img
                  src="../img/bin.svg"
                  className="h-4 w-4 text-red-500 dark:text-red-500 brightness-0 invert"
                />
                Delete
              </button>
            </div>
          )}
        </div>
      ),
      header: () => (
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Actions
        </span>
      ),
      size: 80,
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

          <button
            onClick={() => {
              handleNavigate();
            }}
            className="w-full sm:w-[180px] sm:ml-auto rounded-lg bg-[#02AA69] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#029858] flex items-center justify-center gap-2"
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
            Add Employee
          </button>
        </div>

        {filteredData.length === 0 && tableDetails.length > 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <img
                src="../img/department.svg"
                className="h-8 w-8 text-green-50 dark:text-green-50 brightness-0 invert"
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
                  handleNavigate();
                }}
                className="w-full sm:w-auto sm:ml-auto rounded-lg bg-[#02AA69] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#029858] flex items-center justify-center gap-2"
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
                Add Employee
              </button>

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
                        <th key={header.id} className="px-2 py-3 text-left">
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

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={closeModal}
          ></div>
          <div className="relative z-[60] w-full max-w-md rounded-lg bg-white dark:bg-gray-900 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Delete this?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this employee?
            </p>

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={closeModal}
                className="w-full sm:w-auto rounded-md px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                <Trash size={14} color="#FFF" />
                Delete
              </button>
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
