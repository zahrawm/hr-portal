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
import axios from "axios";

import { Toast } from "./toast";
import EditDepartmentModal from "../layout/edit-department-modal";

import EditEmployeeForm from "../layout/edit-employee";

import { useRouter } from "next/navigation";

type tableData = {
  _id: string;
  timestamp: string;
  timeIn: string;
  timeOut: string;
  duration: string;
};

interface TableProps {
  userId?: string;
}

export default function EmployeeAttendanceTable({ userId }: TableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(
    null
  );

  const router = useRouter();

  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showResetPinModal, setShowResetPinModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDenyModal, setShowDenyModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedConflict, setSelectedConflict] = useState<any>(null);
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [newDepartmentDescription, setNewDepartmentDescription] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showManageEmployeeModal, setshowMangeEmployeeModal] = useState(false);
  const [showEditManageEmployeeModal, setshowEditMangeEmployeeModal] =
    useState(false);

  const [tableDetails, setTableDetails] = useState<tableData[]>([]);
  const [loading, setLoading] = useState(true);

  const closeModal = () => {
    setshowEditMangeEmployeeModal(false);
    setshowMangeEmployeeModal(false);
    setShowViewModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowDenyModal(false);
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
  };

  const handleDelete = () => {
    console.log("Approving User:", selectedConflict);
    closeModal();
    setToastMessage(" Employees Leave has approve  Successfully");
    setShowToast(true);
  };

  const handleDeny = () => {
    console.log("Denying:", selectedConflict);
    closeModal();
    setToastMessage(" Employees Leave has denied  Successfully");
    setShowToast(true);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setShowApproveModal(false);
    setToastMessage("Employees Edited Successfully");
    setShowToast(true);
    setshowEditMangeEmployeeModal(false);
  };

  const [filteredData, setFilteredData] = useState<tableData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState<"all" | "timestamp">("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // Calculate duration between clock in and clock out
  // Replace your calculateDuration function with this fixed version:

  const calculateDuration = (clockIn: string, clockOut: string): string => {
    if (!clockIn || clockIn === "N/A" || !clockOut || clockOut === "N/A") {
      return "N/A";
    }

    try {
      // Parse 12-hour format time (e.g., "02:30 PM") to 24-hour format
      const parseTime = (timeStr: string): Date => {
        const [time, period] = timeStr.split(" ");
        let [hours, minutes] = time.split(":").map(Number);

        if (period === "PM" && hours !== 12) {
          hours += 12;
        } else if (period === "AM" && hours === 12) {
          hours = 0;
        }

        const date = new Date(1970, 0, 1, hours, minutes, 0);
        return date;
      };

      const inTime = parseTime(clockIn);
      const outTime = parseTime(clockOut);
      const diffMs = outTime.getTime() - inTime.getTime();

      if (diffMs < 0) return "N/A";

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      return `${hours}h ${minutes}m`;
    } catch (error) {
      return "N/A";
    }
  };

  useEffect(() => {
    fetchAttendanceRecords();
  }, [userId]);

  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 100 };
      if (userId) params.userId = userId;

      console.log("Fetching attendance with params:", params);
      console.log("API URL:", `${process.env.NEXT_PUBLIC_API_URL}/attendance`);

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/attendance`,
        { params, ...getAuthHeaders() }
      );

      console.log("Attendance response:", response.data);

      if (response.data.success && response.data.data) {
        const formattedData = response.data.data.map((record: any) => {
          // Ensure we get the correct ID - MongoDB returns _id as an object sometimes
          const recordId =
            typeof record._id === "object" ? record._id.toString() : record._id;

          console.log("Processing record:", {
            originalId: record._id,
            processedId: recordId,
            type: typeof record._id,
          });

          const timeIn = record.clockIn
            ? new Date(record.clockIn).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
            : "N/A";

          const timeOut = record.clockOut
            ? new Date(record.clockOut).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
            : "N/A";

          return {
            _id: recordId,
            timestamp: new Date(record.date).toLocaleDateString(),
            timeIn,
            timeOut,
            duration: calculateDuration(timeIn, timeOut),
          };
        });
        setTableDetails(formattedData);
      } else {
        setTableDetails([]);
      }
    } catch (error: any) {
      console.error("Error fetching attendance:", error);
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);
      console.error("Error message:", error.message);

      // Only show toast for actual errors, not for empty data
      if (error.response?.status !== 404) {
        setToastMessage(
          error.response?.data?.error ||
            error.response?.data?.message ||
            "Failed to fetch attendance records"
        );
        setShowToast(true);
      }
      setTableDetails([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async (recordId: string) => {
    console.log("🔵 CLOCK IN BUTTON CLICKED!");
    try {
      const cleanId = String(recordId).trim();

      console.log("Clock In - Record ID:", cleanId);

      const authHeaders = getAuthHeaders();
      const requestBody = {
        clockIn: new Date().toISOString(),
      };

      console.log(
        "Sending request to:",
        `${process.env.NEXT_PUBLIC_API_URL}/attendance/${cleanId}`
      );

      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/attendance/${cleanId}`,
        requestBody,
        authHeaders
      );

      console.log("Clock In Response:", response.data);

      if (response.data.success) {
        setToastMessage(response.data.message || "Clocked in successfully");
        setShowToast(true);
        await fetchAttendanceRecords();
      }
    } catch (error: any) {
      console.error("Clock In Error:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to clock in";
      setToastMessage(errorMessage);
      setShowToast(true);
    }
  };

  const handleClockOut = async (recordId: string) => {
    console.log("🔴 CLOCK OUT BUTTON CLICKED!");
    try {
      const cleanId = String(recordId).trim();

      console.log("Clock Out - Record ID:", cleanId);

      const authHeaders = getAuthHeaders();
      const requestBody = {
        clockOut: new Date().toISOString(),
      };

      console.log(
        "Sending request to:",
        `${process.env.NEXT_PUBLIC_API_URL}/attendance/${cleanId}`
      );

      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/attendance/${cleanId}`,
        requestBody,
        authHeaders
      );

      console.log("Clock Out Response:", response.data);

      if (response.data.success) {
        setToastMessage(response.data.message || "Clocked out successfully");
        setShowToast(true);
        await fetchAttendanceRecords();
      }
    } catch (error: any) {
      console.error("Clock Out Error:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to clock out";
      setToastMessage(errorMessage);
      setShowToast(true);
    }
  };

  useEffect(() => {
    if (!tableDetails || tableDetails.length === 0) {
      setFilteredData([]);
      return;
    }

    const filtered = tableDetails.filter((item) => {
      const searchLower = searchTerm.toLowerCase();
      if (filterBy === "timestamp") {
        return item.timestamp?.toLowerCase().includes(searchLower);
      } else {
        return item.timestamp?.toLowerCase().includes(searchLower);
      }
    });
    setFilteredData(filtered);
  }, [searchTerm, filterBy, tableDetails]);

  const columnHelper = createColumnHelper<tableData>();

  const columns = [
    columnHelper.accessor("timestamp", {
      cell: (info) => (
        <span className="text-sm text-gray-900 dark:text-gray-100">
          {info.getValue()}
        </span>
      ),
      header: () => (
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Timestamps
        </span>
      ),
      size: 180,
    }),
    columnHelper.display({
      id: "timeInOut",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-900 dark:text-gray-100">
            {row.original.timeIn}
          </span>
          <span className="text-gray-400 dark:text-gray-500">←</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {row.original.duration}
          </span>
          <span className="text-gray-400 dark:text-gray-500">→</span>
          <span className="text-sm text-gray-900 dark:text-gray-100">
            {row.original.timeOut}
          </span>
        </div>
      ),
      header: () => (
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Clock-In & Out
        </span>
      ),
      size: 300,
    }),
    columnHelper.display({
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleClockIn(row.original._id)}
            className="rounded-lg border border-black dark:border-white bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clock In
          </button>
          <button
            onClick={() => handleClockOut(row.original._id)}
            className="rounded-lg border border-black dark:border-white bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clock Out
          </button>
        </div>
      ),
      header: () => <span></span>,
      size: 250,
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

  if (loading) {
    return (
      <div className="w-full bg-white dark:bg-gray-900 p-4 sm:p-6">
        <div className="flex justify-center items-center py-20">
          <div className="text-gray-600 dark:text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full bg-white dark:bg-gray-900 p-4 sm:p-6">
        {/* Search and Actions Bar */}
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
                    setFilterBy("timestamp");
                    setShowFilterDropdown(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-700"
                >
                  Timestamp
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
                Filter by: {filterBy === "all" ? "All" : "Timestamp"}
              </span>
            </button>
          </div>
        </div>

        {/* Empty State - when no data at all */}
        {filteredData.length === 0 &&
          (!tableDetails || tableDetails.length === 0) && (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <svg
                  className="h-8 w-8 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                No Attendance yet
              </h3>

              <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
                Looks like there was no attendance here on HR mini. Click the
                "Refresh" button to reload the page.
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => fetchAttendanceRecords()}
                  className="w-full sm:w-auto sm:ml-auto rounded-lg bg-[#02AA69] px-8 py-2 text-sm font-medium text-white transition-colors hover:bg-[#029858] flex items-center justify-center gap-2"
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

        {/* Empty State - when no results found */}
        {filteredData.length === 0 &&
          searchTerm.length > 0 &&
          tableDetails &&
          tableDetails.length > 0 && (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 dark:bg-gray-800 hover:bg-green-50">
                <img
                  src="../img/plus.svg"
                  className="h-8 w-8 text-green-50 dark:text-green-50 dark:brightness-0 dark:invert
                  
                  "
                />
              </div>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                No Attendance yet
              </h3>

              <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
                Looks like there are no attendance here on the HR Mini. Click
                the "Reload" button to try again
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSearchTerm("");
                    fetchAttendanceRecords();
                  }}
                  className="w-full sm:w-auto sm:ml-auto rounded-lg bg-green-500 px-3 py-1.5 text-sm font-medium text-white  transition-colors hover:bg-gray-100 flex items-center justify-center gap-2"
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

        {/* Table - only show if there are filtered results */}
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

            {/* Pagination - Inside Table */}
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

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        visible={showToast}
        onClose={() => setShowToast(false)}
      />
    </>
  );
}
