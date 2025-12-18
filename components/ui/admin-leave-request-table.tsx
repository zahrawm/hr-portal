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
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Toast } from "./toast";

type tableData = {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  aprove: string;
  deny: string;
};

interface TableProps {
  tableDetails: tableData[];
}

export default function LeaveRequesTable({ tableDetails }: TableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showDenyModal, setShowDenyModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const closeModal = () => {
    setShowApproveModal(false);
    setShowDenyModal(false);
    setSelectedRequest(null);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/leave-requests/${selectedRequest.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "APPROVED",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to approve leave request");
      }

      setToastMessage("Leave request approved successfully");
      setShowToast(true);
      closeModal();

      // Reload the page to refresh data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Error approving leave request:", error);
      setToastMessage("Failed to approve leave request");
      setShowToast(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeny = async () => {
    if (!selectedRequest) return;

    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/leave-requests/${selectedRequest.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "REJECTED",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to deny leave request");
      }

      setToastMessage("Leave request denied successfully");
      setShowToast(true);
      closeModal();

      // Reload the page to refresh data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Error denying leave request:", error);
      setToastMessage("Failed to deny leave request");
      setShowToast(true);
    } finally {
      setIsProcessing(false);
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
          item.email.toLowerCase().includes(searchLower) ||
          item.department.toLowerCase().includes(searchLower)
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
      size: 180,
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
      size: 150,
    }),
    columnHelper.accessor("startDate", {
      cell: (info) => (
        <span className="text-sm text-gray-900 dark:text-gray-100">
          {info.getValue()}
        </span>
      ),
      header: () => (
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Start Date
        </span>
      ),
      size: 120,
    }),
    columnHelper.accessor("endDate", {
      cell: (info) => (
        <span className="text-sm text-gray-900 dark:text-gray-100">
          {info.getValue()}
        </span>
      ),
      header: () => (
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          End Date
        </span>
      ),
      size: 120,
    }),
    columnHelper.accessor("reason", {
      cell: (info) => (
        <span className="text-sm text-gray-900 dark:text-gray-100">
          {info.getValue()}
        </span>
      ),
      header: () => (
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Reason
        </span>
      ),
      size: 200,
    }),
    columnHelper.accessor("status", {
      cell: (info) => {
        const status = info.getValue();
        let statusColor = "text-yellow-600 dark:text-yellow-400";
        let statusBg = "bg-yellow-50 dark:bg-yellow-900/20";

        if (status === "APPROVED") {
          statusColor = "text-green-600 dark:text-green-400";
          statusBg = "bg-green-50 dark:bg-green-900/20";
        } else if (status === "REJECTED") {
          statusColor = "text-red-600 dark:text-red-400";
          statusBg = "bg-red-50 dark:bg-red-900/20";
        }

        return (
          <span
            className={`text-sm px-2 py-1 rounded ${statusBg} ${statusColor}`}
          >
            {status}
          </span>
        );
      },
      header: () => (
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Status
        </span>
      ),
      size: 100,
    }),
    columnHelper.accessor("aprove", {
      cell: (info) => {
        const row = info.row.original;
        const isPending = row.status === "PENDING";

        return (
          <div className="flex items-center justify-start">
            <button
              onClick={() => {
                setSelectedRequest(row);
                setShowApproveModal(true);
              }}
              disabled={!isPending}
              className={`flex items-center gap-2 rounded-md border border-gray-900 dark:border-gray-600 bg-white dark:bg-gray-800 px-5 py-2 text-sm font-medium text-gray-900 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                !isPending ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Approve
            </button>
          </div>
        );
      },
      header: () => (
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Approve
        </span>
      ),
      size: 120,
    }),
    columnHelper.accessor("deny", {
      cell: (info) => {
        const row = info.row.original;
        const isPending = row.status === "PENDING";

        return (
          <div className="flex items-center justify-start">
            <button
              onClick={() => {
                setSelectedRequest(row);
                setShowDenyModal(true);
              }}
              disabled={!isPending}
              className={`flex items-center gap-2 rounded-md border border-gray-900 dark:border-gray-600 bg-white dark:bg-gray-800 px-5 py-2 text-sm font-medium text-gray-900 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                !isPending ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Deny
            </button>
          </div>
        );
      },
      header: () => (
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Deny
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
        {/* Search Bar */}
        <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Type or search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 pl-10 pr-4 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-gray-400 dark:focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500"
            />
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

        {/* Table */}
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

            {/* Pagination */}
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

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={closeModal}
          ></div>
          <div className="relative z-[60] w-full max-w-md rounded-lg bg-white dark:bg-gray-900 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Approve Leave Request?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to approve this leave request for{" "}
              {selectedRequest?.name}?
            </p>

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={closeModal}
                disabled={isProcessing}
                className="w-full sm:w-auto rounded-md px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={isProcessing}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50"
              >
                {isProcessing ? "Processing..." : "Approve"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deny Modal */}
      {showDenyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={closeModal}
          ></div>
          <div className="relative z-[60] w-full max-w-md rounded-lg bg-white dark:bg-gray-900 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Deny Leave Request?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to deny this leave request for{" "}
              {selectedRequest?.name}?
            </p>

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={closeModal}
                disabled={isProcessing}
                className="w-full sm:w-auto rounded-md px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeny}
                disabled={isProcessing}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
              >
                {isProcessing ? "Processing..." : "Deny"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        visible={showToast}
        onClose={() => setShowToast(false)}
      />
    </>
  );
}
