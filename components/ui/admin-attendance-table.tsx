"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { Search } from "lucide-react";

// Toast Component
const Toast = ({
  message,
  visible,
  onClose,
}: {
  message: string;
  visible: boolean;
  onClose: () => void;
}) => {
  React.useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[9999]">
      {message}
    </div>
  );
};

interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  date: string;
  timestamp: string;
  clockIn: string;
  duration: string;
  clockOut: string;
  status: string;
}

const AttendanceTable = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;

  const [data, setData] = useState<AttendanceRecord[]>([]);

  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [filterBy, setFilterBy] = useState<"all" | "date">("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Fetch attendance data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}attendance`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const result = await response.json();

          if (result.success && result.data && result.data.length > 0) {
            const transformedData = result.data.map((record: any) => {
              const clockInTime = new Date(record.clockIn);
              const clockOutTime = record.clockOut
                ? new Date(record.clockOut)
                : null;

              let duration = "In Progress";
              if (clockOutTime) {
                const diffMs = clockOutTime.getTime() - clockInTime.getTime();
                const hours = Math.floor(diffMs / (1000 * 60 * 60));
                const minutes = Math.floor(
                  (diffMs % (1000 * 60 * 60)) / (1000 * 60)
                );
                duration = `${hours}h ${minutes}m`;
              }

              // Log to see what userId contains
              console.log("userId data:", record.userId);

              return {
                id: record._id,
                userId: record.userId?._id || record.userId || "",
                userName: record.userId?.name || "Unknown",
                date: new Date(record.date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                }),
                timestamp: new Date(record.date)
                  .toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })
                  .replace(",", ""),
                clockIn: clockInTime.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }),
                duration: duration,
                clockOut: clockOutTime
                  ? clockOutTime.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : "Not yet",
                status: clockOutTime ? "Completed" : "In Progress",
              };
            });

            setData(transformedData);
          }
        }
      } catch (error) {
        console.error("Error fetching attendance:", error);
      }
    };

    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter((record) => {
      if (filterBy === "date") {
        return record.date.toLowerCase().includes(searchTerm.toLowerCase());
      }
      // Search all fields when filterBy is "all"
      return Object.values(record).some((value) =>
        value.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [data, searchTerm, filterBy]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = currentPage * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const handleClockIn = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}attendance`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action: "clockIn" }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setToastMessage("Clocked In successfully!");
        setShowToast(true);

        // Refresh data from API
        const fetchResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}attendance`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (fetchResponse.ok) {
          const fetchResult = await fetchResponse.json();
          if (
            fetchResult.success &&
            fetchResult.data &&
            fetchResult.data.length > 0
          ) {
            const transformedData = fetchResult.data.map((record: any) => {
              const clockInTime = new Date(record.clockIn);
              const clockOutTime = record.clockOut
                ? new Date(record.clockOut)
                : null;

              let duration = "In Progress";
              if (clockOutTime) {
                const diffMs = clockOutTime.getTime() - clockInTime.getTime();
                const hours = Math.floor(diffMs / (1000 * 60 * 60));
                const minutes = Math.floor(
                  (diffMs % (1000 * 60 * 60)) / (1000 * 60)
                );
                duration = `${hours}h ${minutes}m`;
              }

              return {
                id: record._id,
                userId: record.userId?._id || record.userId || "",
                userName: record.userId?.name || "Unknown",
                date: new Date(record.date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                }),
                timestamp: new Date(record.date)
                  .toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })
                  .replace(",", ""),
                clockIn: clockInTime.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }),
                duration: duration,
                clockOut: clockOutTime
                  ? clockOutTime.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : "Not yet",
                status: clockOutTime ? "Completed" : "In Progress",
              };
            });
            setData(transformedData);
          }
        }
      } else {
        setToastMessage(result.message || "Failed to clock in");
        setShowToast(true);
      }
    } catch (error) {
      console.error("Error clocking in:", error);
      setToastMessage("Failed to clock in");
      setShowToast(true);
    }
  };

  const handleClockOut = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}attendance`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action: "clockOut" }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setToastMessage("Clocked Out successfully!");
        setShowToast(true);

        // Refresh data from API
        const fetchResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}attendance`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (fetchResponse.ok) {
          const fetchResult = await fetchResponse.json();
          if (
            fetchResult.success &&
            fetchResult.data &&
            fetchResult.data.length > 0
          ) {
            const transformedData = fetchResult.data.map((record: any) => {
              const clockInTime = new Date(record.clockIn);
              const clockOutTime = record.clockOut
                ? new Date(record.clockOut)
                : null;

              let duration = "In Progress";
              if (clockOutTime) {
                const diffMs = clockOutTime.getTime() - clockInTime.getTime();
                const hours = Math.floor(diffMs / (1000 * 60 * 60));
                const minutes = Math.floor(
                  (diffMs % (1000 * 60 * 60)) / (1000 * 60)
                );
                duration = `${hours}h ${minutes}m`;
              }

              return {
                id: record._id,
                userId: record.userId?._id || record.userId || "",
                userName: record.userId?.name || "Unknown",
                date: new Date(record.date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                }),
                timestamp: new Date(record.date)
                  .toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })
                  .replace(",", ""),
                clockIn: clockInTime.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }),
                duration: duration,
                clockOut: clockOutTime
                  ? clockOutTime.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : "Not yet",
                status: clockOutTime ? "Completed" : "In Progress",
              };
            });
            setData(transformedData);
          }
        }
      } else {
        setToastMessage(result.message || "Failed to clock out");
        setShowToast(true);
      }
    } catch (error) {
      console.error("Error clocking out:", error);
      setToastMessage("Failed to clock out");
      setShowToast(true);
    }
  };

  const columns = useMemo<ColumnDef<AttendanceRecord>[]>(
    () => [
      {
        accessorKey: "userName",
        header: "Employee Name",
        cell: (info) => (
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {info.getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: "userId",
        header: "Employee ID",
        cell: (info) => (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {info.getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: (info) => (
          <div className="text-sm text-gray-900 dark:text-gray-100">
            {info.getValue() as string}
          </div>
        ),
      },
      {
        id: "clockInOut",
        header: "Time In/ Time Out",
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
              <span>{row.clockIn}</span>
              <span className="text-gray-400 dark:text-gray-500">←</span>
              <span className="text-gray-400 dark:text-gray-500">
                {row.duration}
              </span>
              <span className="text-gray-400 dark:text-gray-500">→</span>
              <span>{row.clockOut}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => {
          return (
            <button className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-md w-24">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Active
              </span>
            </button>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: paginatedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        visible={showToast}
        onClose={() => setShowToast(false)}
      />
      <div className="w-full max-w-7xl mx-auto p-6">
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
                    setFilterBy("date");
                    setShowFilterDropdown(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-700"
                >
                  Date
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
                Filter by: {filterBy === "all" ? "All" : "Date"}
              </span>
            </button>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
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

          {filteredData.length === 0 && searchTerm.length > 0 && (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 dark:bg-gray-800 hover:bg-green-50">
                <img
                  src="../img/plus.svg"
                  alt="Attendance Icon"
                  className="h-6 w-6 dark:brightness-0 dark:invert"
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
                  }}
                  className="w-full sm:w-auto sm:ml-auto rounded-lg bg-green-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-600 flex items-center justify-center gap-2"
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

          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 gap-3">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              0 of {filteredData.length} row(s) selected.
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="flex-1 sm:flex-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
                }
                disabled={currentPage >= totalPages - 1}
                className="flex-1 sm:flex-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AttendanceTable;
