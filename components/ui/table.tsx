"use client";
import Title from "@base/resources/js/components/title";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import "flatpickr/dist/themes/material_blue.css";
import { Edit, Ellipsis, Eye, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";

import DetailsModal from "./details";
import ViewDetails from "./users_details";
import Modal from "../layout/modal";

type tableData = {
  name: string;
  country: string;
  phoneNumber: string;
  dateCreated: string;
  role: string;
  actions: string;
};

interface TableProps {
  tableDetails: tableData[];
}

export default function UserTable({ tableDetails }: TableProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [data] = useState(() => [...tableDetails]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGloablFilter] = useState("");
  const [dateRange, setDateRange] = useState<Date[]>([]);
  const columnHelper = createColumnHelper<tableData>();
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(
    null
  );

  // Added missing state declarations
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showResetPinModal, setShowResetPinModal] = useState(false);
  const [showEditApprovalModal, setShowEditApprovalModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedConflict, setSelectedConflict] = useState<any>(null);

  // Added missing functions
  const closeModal = () => {
    setShowViewModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowResetPinModal(false);
    setSelectedConflict(null);
    setShowApproveModal(false);
  };

  const handleUserAddSuccess = () => {
    // Handle success logic here
    setShowViewModal(false);
  };

  const handleDelete = () => {
    // Handle delete logic here
    console.log("Deleting user:", selectedConflict);
    closeModal();
  };

  const handleResetPin = () => {
    // Handle reset PIN logic here
    console.log("Resetting PIN for user:", selectedConflict);
    closeModal();
  };

  const columns = [
    columnHelper.accessor("name", {
      cell: (info) => (
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F2F3F5] px-2.5 sm:h-9 sm:w-9 md:h-10 md:w-10">
            <span className="text-xs font-normal text-[#000] sm:text-[13px] md:text-[15px]">
              {info
                .getValue()
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <span className="text-xs font-normal text-[#080808] sm:text-[13px] md:text-[14px]">
            {info.getValue()}
          </span>
        </div>
      ),
      header: () => <Title text="Name" level={7} weight="normal" />,
    }),
    columnHelper.accessor("phoneNumber", {
      cell: (info) => (
        <span className="text-xs font-normal text-[#080808] sm:text-[13px] md:text-[14px]">
          {info.getValue()}
        </span>
      ),
      header: () => <Title text="Phone Number" level={7} weight="normal" />,
    }),
    columnHelper.accessor("dateCreated", {
      cell: (info) => (
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="truncate text-center text-sm font-normal text-[#080808] sm:text-[15px] md:text-[16px]">
            {info.getValue()}
          </span>
        </div>
      ),
      header: () => <Title text="Date Created" level={7} weight="normal" />,
    }),
    columnHelper.accessor("role", {
      cell: (info) => (
        <span className="text-xs font-normal text-[#080808] sm:text-[13px] md:text-[14px]">
          {info.getValue()}
        </span>
      ),
      header: () => <Title text="Role" level={7} weight="normal" />,
    }),

    columnHelper.accessor("actions", {
      cell: (info) => (
        <div className="relative flex items-center">
          <button
            onClick={() =>
              setOpenDropdownIndex(
                openDropdownIndex === info.row.index ? null : info.row.index
              )
            }
            className="flex items-center justify-center rounded-full border p-1 text-gray-400 hover:text-gray-600"
          >
            <Ellipsis className="h-4 w-4 items-center sm:h-5 sm:w-5" />
          </button>
          {openDropdownIndex === info.row.index && (
            <div className="absolute right-0 z-10 mt-2 w-36 rounded-lg border border-gray-200 bg-white shadow-lg">
              <button
                onClick={() => {
                  setShowViewModal(true);
                  setSelectedConflict(info.row.original);
                  setOpenDropdownIndex(null);
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                <Eye className="h-4 w-4 text-gray-500" />
                View
              </button>

              <button
                onClick={() => {
                  setShowEditModal(true);
                  setSelectedConflict(info.row.original);
                  setOpenDropdownIndex(null);
                  setShowApproveModal(true);
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                <Edit className="h-4 w-4 text-gray-500" />
                Edit
              </button>

              <button
                onClick={() => {
                  setShowResetPinModal(true);
                  setSelectedConflict(info.row.original);
                  setOpenDropdownIndex(null);
                  setShowEditApprovalModal(true);
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                <RotateCcw className="h-4 w-4 text-gray-500" />
                Reset PIN
              </button>

              <button
                onClick={() => {
                  setShowDeleteModal(true);
                  setSelectedConflict(info.row.original);
                  setOpenDropdownIndex(null);
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                <Trash2 className="h-4 w-4 text-gray-500" />
                Delete
              </button>
            </div>
          )}
        </div>
      ),
      header: () => <Title text="Actions" level={7} weight="normal" />,
      meta: {
        className: "sticky right-0 bg-white z-10 w-[80px]",
      },
    }),
  ];

  const table = useReactTable<tableData>({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 4,
      },
    },
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGloablFilter,
    getFilteredRowModel: getFilteredRowModel(),
  });

  const sort = [
    { id: "gh", name: "Admin" },
    { id: "de", name: "Paymasters" },
    { id: "es", name: "Field Agents" },
  ];
  const status = [
    { id: "gh", name: "Pending" },
    { id: "de", name: "Approved" },
    { id: "es", name: "Denied" },
    { id: "es", name: "Successful" },
    { id: "es", name: "Failed" },
  ];
  const payment = [
    { id: "gh", name: "Cash Payment" },
    { id: "de", name: "Mobile Money" },
    { id: "es", name: "Bank Transfer" },
  ];
  const handleCountryApply = (selectedIds: string[]) => {
    console.log("Selected countries:", selectedIds);
  };

  return (
    <>
      <div className="scrollbar-hide mx-auto flex min-h-screen flex-col">
        {/* ......Table Container....... */}
        <div className="overflow-x-hidden rounded-lg border bg-white shadow-sm">
          <table className="w-full min-w-[800px] divide-y divide-gray-200">
            <thead className="whitespace-nowrap border border-[#E2E2E2] bg-[#F6F6F7]">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((headers) => (
                    <th
                      key={headers.id}
                      className="w-10 px-2 py-3 text-left text-[14px] font-normal tracking-wider text-gray-800"
                    >
                      <div
                        {...{
                          className: headers.column.getCanSort()
                            ? "cursor-pointer select-none flex items-center"
                            : "flex items-center",
                          onClick: headers.column.getToggleSortingHandler(),
                        }}
                      >
                        {flexRender(
                          headers.column.columnDef.header,
                          headers.getContext()
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            {/* ....Table Body.......... */}
            <tbody className="divide-y divide-gray-200 border bg-white">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="whitespace-nowrap px-2 py-2 text-[#080808] md:py-3"
                    >
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
      </div>

      {/* View Modal */}
      {showViewModal && (
        <Modal visible={showViewModal} position="right">
          <ViewDetails
            onClose={closeModal}
            visible={showViewModal}
            onSuccess={handleUserAddSuccess}
            mode="view"
          />
        </Modal>
      )}

      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={closeModal}
          ></div>
          <div className="relative z-[60] rounded-lg bg-white shadow-lg">
            <DetailsModal
              onClose={closeModal}
              visible={showApproveModal}
              onSuccess={handleUserAddSuccess}
              mode="edit"
              headerTitle={"Edit User"}
            />
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={closeModal}
          ></div>
          <div className="relative z-[60] w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-400 hover:bg-gray-50"
            >
              ✕
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                <svg
                  className="h-10 w-10 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z" />
                </svg>
              </div>

              <h3 className="text-xl font-semibold text-gray-900">
                Are you sure you want to delete this user?
              </h3>
              <p className="mt-2 text-sm text-gray-500">
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
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
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
          <div className="relative z-[60] w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-400 hover:bg-gray-50"
            >
              ✕
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
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

              <h3 className="text-xl font-semibold text-gray-900">
                Are you sure you want to reset this user's PIN?
              </h3>
              <p className="mt-2 text-sm text-gray-500">
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
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
