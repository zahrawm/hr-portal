// "use client";

// import {
//   createColumnHelper,
//   flexRender,
//   getCoreRowModel,
//   getSortedRowModel,
//   SortingState,
//   useReactTable,
// } from "@tanstack/react-table";
// import { Edit, Ellipsis, Eye, RotateCcw, Search, Trash2 } from "lucide-react";
// import { useEffect, useState } from "react";

// type tableData = {
//   actions: string;
//   departmentName: string;
//   description: string;
//   department: string;
//   status: string;
//   dateCreated: string;
//   role: string;
// };

// interface TableProps {
//   tableDetails: tableData[];
// }

// export default function UserTable({ tableDetails }: TableProps) {
//   const [sorting, setSorting] = useState<SortingState>([]);
//   const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(
//     null
//   );

//   const [showViewModal, setShowViewModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showApproveModal, setShowApproveModal] = useState(false);
//   const [showResetPinModal, setShowResetPinModal] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [selectedConflict, setSelectedConflict] = useState<any>(null);

//   const closeModal = () => {
//     setShowViewModal(false);
//     setShowEditModal(false);
//     setShowDeleteModal(false);
//     setShowResetPinModal(false);
//     setSelectedConflict(null);
//     setShowApproveModal(false);
//   };

//   const handleDelete = () => {
//     console.log("Deleting user:", selectedConflict);
//     closeModal();
//   };

//   const handleResetPin = () => {
//     console.log("Resetting PIN for user:", selectedConflict);
//     closeModal();
//   };

//   const [filteredData, setFilteredData] = useState<tableData[]>(tableDetails);
//   const [searchTerm, setSearchTerm] = useState("");

//   const columnHelper = createColumnHelper<tableData>();

//   const columns = [
//     columnHelper.accessor("dateCreated", {
//       cell: (info) => {
//         const dateValue = info.getValue();
//         const date = new Date(dateValue);

//         // Check if date is valid
//         if (isNaN(date.getTime())) {
//           // If invalid date, just display the original string
//           return (
//             <span className="text-sm text-gray-900 dark:text-gray-100">
//               {dateValue}
//             </span>
//           );
//         }

//         const formattedDate = date
//           .toLocaleDateString("en-GB", {
//             day: "2-digit",
//             month: "2-digit",
//             year: "2-digit",
//           })
//           .replace(/\//g, "/");
//         const formattedTime = date.toLocaleTimeString("en-US", {
//           hour: "2-digit",
//           minute: "2-digit",
//           hour12: true,
//         });
//         return (
//           <span className="text-sm text-gray-900 dark:text-gray-100">{`${formattedDate} | ${formattedTime}`}</span>
//         );
//       },
//       header: () => (
//         <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
//           Date Created
//         </span>
//       ),
//       size: 180,
//     }),
//     columnHelper.accessor("departmentName", {
//       cell: (info) => (
//         <span className="text-sm text-gray-900 dark:text-gray-100">
//           {info.getValue()}
//         </span>
//       ),
//       header: () => (
//         <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
//           Department Name
//         </span>
//       ),
//       size: 180,
//     }),
//     columnHelper.accessor("description", {
//       cell: (info) => (
//         <span className="text-sm text-gray-900 dark:text-gray-100">
//           {info.getValue()}
//         </span>
//       ),
//       header: () => (
//         <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
//           Description
//         </span>
//       ),
//       size: 300,
//     }),
//     columnHelper.accessor("status", {
//       cell: (info) => (
//         <div className="flex items-center gap-2">
//           <span
//             className={`h-2 w-2 rounded-full ${
//               info.getValue() === "Active"
//                 ? "bg-green-500"
//                 : "bg-gray-300 dark:bg-gray-600"
//             }`}
//           ></span>
//           <span
//             className={`text-sm font-medium ${
//               info.getValue() === "Active"
//                 ? "text-gray-900 dark:text-gray-100"
//                 : "text-gray-400 dark:text-gray-500"
//             }`}
//           >
//             {info.getValue()}
//           </span>
//         </div>
//       ),
//       header: () => (
//         <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
//           Status
//         </span>
//       ),
//       size: 120,
//     }),
//     columnHelper.accessor("actions", {
//       cell: (info) => (
//         <div className="relative flex items-center justify-start">
//           <button
//             onClick={() =>
//               setOpenDropdownIndex(
//                 openDropdownIndex === info.row.index ? null : info.row.index
//               )
//             }
//             className="flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
//           >
//             <Ellipsis className="h-5 w-5" />
//           </button>
//           {openDropdownIndex === info.row.index && (
//             <div className="absolute right-0 top-8 z-10 w-40 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
//               <button
//                 onClick={() => {
//                   setShowViewModal(true);
//                   setSelectedConflict(info.row.original);
//                   setOpenDropdownIndex(null);
//                 }}
//                 className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
//               >
//                 <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />
//                 View
//               </button>
//               <button
//                 onClick={() => {
//                   setShowEditModal(true);
//                   setSelectedConflict(info.row.original);
//                   setOpenDropdownIndex(null);
//                   setShowApproveModal(true);
//                 }}
//                 className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
//               >
//                 <Edit className="h-4 w-4 text-gray-500 dark:text-gray-400" />
//                 Edit
//               </button>
//               <button
//                 onClick={() => {
//                   setShowResetPinModal(true);
//                   setSelectedConflict(info.row.original);
//                   setOpenDropdownIndex(null);
//                 }}
//                 className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
//               >
//                 <RotateCcw className="h-4 w-4 text-gray-500 dark:text-gray-400" />
//                 Reset PIN
//               </button>
//               <button
//                 onClick={() => {
//                   setShowDeleteModal(true);
//                   setSelectedConflict(info.row.original);
//                   setOpenDropdownIndex(null);
//                 }}
//                 className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
//               >
//                 <Trash2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
//                 Delete
//               </button>
//             </div>
//           )}
//         </div>
//       ),
//       header: () => (
//         <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
//           Actions
//         </span>
//       ),
//       size: 80,
//     }),
//   ];

//   const table = useReactTable<tableData>({
//     data: filteredData,
//     columns,
//     state: {
//       sorting,
//     },
//     initialState: {
//       pagination: {
//         pageSize: 6,
//       },
//     },
//     getCoreRowModel: getCoreRowModel(),
//     onSortingChange: setSorting,
//     getSortedRowModel: getSortedRowModel(),
//   });

//   useEffect(() => {
//     let result = [...tableDetails];

//     if (searchTerm) {
//       result = result.filter((row) => {
//         const searchLower = searchTerm.toLowerCase();
//         return (
//           (row.departmentName &&
//             row.departmentName.toLowerCase().includes(searchLower)) ||
//           (row.description &&
//             row.description.toLowerCase().includes(searchLower))
//         );
//       });
//     }

//     setFilteredData(result);
//   }, [searchTerm, tableDetails]);

//   return (
//     <>
//       <div className="w-full bg-white dark:bg-gray-900 p-6">
//         {/* Search and Actions Bar */}
//         <div className="flex items-center gap-3 mb-4">
//           <div className="relative flex-1 max-w-md">
//             <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
//             <input
//               type="text"
//               placeholder="Type or search..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 pl-10 pr-4 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-gray-400 dark:focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500"
//             />
//           </div>

//           <button className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
//             <svg
//               className="h-4 w-4"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
//               />
//             </svg>
//             Filter by
//           </button>

//           <button
//             onClick={() => {}}
//             className="ml-auto rounded-lg bg-[#02AA69] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#029858] flex items-center gap-2"
//           >
//             <svg
//               className="h-4 w-4"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//               strokeWidth="2"
//             >
//               <circle cx="12" cy="12" r="7" />
//               <path d="M12 9v6M9 12h6" strokeLinecap="round" />
//             </svg>
//             Create Department
//           </button>
//         </div>

//         {/* Table */}
//         <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
//           <table className="w-full">
//             <thead className="bg-gray-50 dark:bg-gray-800">
//               {table.getHeaderGroups().map((headerGroup) => (
//                 <tr key={headerGroup.id}>
//                   {headerGroup.headers.map((header) => (
//                     <th key={header.id} className="px-2 py-3 text-left">
//                       <div
//                         {...{
//                           className: header.column.getCanSort()
//                             ? "cursor-pointer select-none"
//                             : "",
//                           onClick: header.column.getToggleSortingHandler(),
//                         }}
//                       >
//                         {flexRender(
//                           header.column.columnDef.header,
//                           header.getContext()
//                         )}
//                       </div>
//                     </th>
//                   ))}
//                 </tr>
//               ))}
//             </thead>
//             <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
//               {table.getRowModel().rows.map((row) => (
//                 <tr
//                   key={row.id}
//                   className="hover:bg-gray-50 dark:hover:bg-gray-800"
//                 >
//                   {row.getVisibleCells().map((cell) => (
//                     <td key={cell.id} className="px-2 py-3">
//                       {flexRender(
//                         cell.column.columnDef.cell,
//                         cell.getContext()
//                       )}
//                     </td>
//                   ))}
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           {/* Pagination - Inside Table */}
//           <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3">
//             <div className="text-sm text-gray-600 dark:text-gray-400">
//               0 of {filteredData.length} row(s) selected.
//             </div>
//             <div className="flex gap-2">
//               <button className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
//                 Previous
//               </button>
//               <button className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
//                 Next
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Delete Modal */}
//       {showDeleteModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//           <div
//             className="absolute inset-0 bg-black opacity-50"
//             onClick={closeModal}
//           ></div>
//           <div className="relative z-[60] w-full max-w-md rounded-lg bg-white dark:bg-gray-900 p-6 shadow-xl">
//             <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
//               Delete this?
//             </h3>
//             <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
//               Are you sure you want to delete a Department?
//             </p>

//             <div className="flex justify-end gap-3">
//               <button
//                 onClick={closeModal}
//                 className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleDelete}
//                 className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
//               >
//                 <Trash2 className="h-4 w-4" />
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Reset PIN Modal */}
//       {showResetPinModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//           <div
//             className="absolute inset-0 bg-black opacity-50"
//             onClick={closeModal}
//           ></div>
//           <div className="relative z-[60] w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 p-8 shadow-xl">
//             <button
//               onClick={closeModal}
//               className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
//             >
//               ✕
//             </button>

//             <div className="flex flex-col items-center text-center">
//               <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-50 dark:bg-yellow-900/30">
//                 <RotateCcw className="h-10 w-10 text-yellow-500" />
//               </div>

//               <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
//                 Are you sure you want to reset this user's PIN?
//               </h3>
//               <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
//                 This action will invalidate their current PIN and require them
//                 to create a new one.
//               </p>

//               <div className="mt-6 flex w-full gap-3">
//                 <button
//                   onClick={handleResetPin}
//                   className="flex-1 rounded-lg bg-yellow-500 px-6 py-3 text-sm font-medium text-white hover:bg-yellow-600"
//                 >
//                   Yes, Reset PIN
//                 </button>
//                 <button
//                   onClick={closeModal}
//                   className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

