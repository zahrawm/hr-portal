"use client";
import React, { useEffect, useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { useTheme } from "next-themes";
import { AppLayout } from "@/components/layout/app";
import { useRouter, useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic";

const LeaveRequestContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    // Check if redirected with success flag
    if (searchParams.get("success") === "true") {
      setShowToast(true);

      // Auto-hide toast after 5 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 5000);

      // Clean up URL
      router.replace("/leaveRequests");
    }
  }, [searchParams, router]);

  const handleSubmit = () => {
    router.push("/leaveSubmit");
  };

  const { theme } = useTheme();

  const leaveRequests = [
    {
      id: 1,
      date: "26/10/25 | 12:41 AM",
      status: "Pending Approval",
      statusColor: "text-gray-600 dark:text-gray-400",
      statusBg: "bg-gray-100 dark:bg-gray-700",
      statusDot: "bg-gray-400 dark:bg-gray-500",
      message:
        "Your request has been successfully submitted and is awaiting review by your manager.",
    },
    {
      id: 2,
      date: "26/10/25 | 12:41 AM",
      status: "Action Required",
      statusColor: "text-emerald-600 dark:text-emerald-400",
      statusBg: "bg-emerald-50 dark:bg-emerald-900/20",
      statusDot: "bg-emerald-500 dark:bg-emerald-400",
      message:
        "Your manager needs clarification or an updated document (e.g., a doctor's note) before they can approve the request.",
    },
  ];

  return (
    <AppLayout>
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-6 right-6 z-50">
          <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]">
            <span className="flex-1">Leave Summitted Successfully</span>
            <button
              onClick={() => setShowToast(false)}
              className="hover:bg-green-700 rounded p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="bg-gray-50 dark:bg-gray-900 p-2">
        {/* Header */}

        {/* Leave Requests Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center">
                <img
                  src="../img/leave.svg"
                  alt="Department Icon"
                  className="h-8 w-8"
                />
              </div>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                Leave Requests
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Summit your leave request on the HR Mini
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Type or search..."
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent text-sm"
            />
          </div>
          <div className="flex gap-8">
            <button className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors whitespace-nowrap">
              <Filter className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Filter by
              </span>
            </button>
            <button
              onClick={() => handleSubmit()}
              className="px-6 py-2.5 sm:py-3 bg-emerald-500 dark:bg-emerald-600 text-white rounded-lg hover:bg-emerald-600 dark:hover:bg-emerald-700 transition-colors font-medium text-sm whitespace-nowrap"
            >
              Submit Leave
            </button>
          </div>
        </div>

        {/* Leave Request Status Tracker */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-4 sm:py-5">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              Leave Request Status Tracker
            </h3>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-t border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    Date Summited
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    What it Means
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {leaveRequests.map((request) => (
                  <tr
                    key={request.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-4 sm:px-6 py-4 sm:py-5 text-xs sm:text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
                      {request.date}
                    </td>
                    <td className="px-4 sm:px-6 py-4 sm:py-5 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                      <div className="max-w-xl">{request.message}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 sm:py-5 whitespace-nowrap">
                      <button className="flex items-center gap-2 px-3 py-1.5 rounded bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                        <span
                          className={`w-2 h-2 rounded-full ${request.statusDot}`}
                        ></span>
                        <span
                          className={`text-xs sm:text-sm font-medium ${request.statusColor}`}
                        >
                          {request.status}
                        </span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default LeaveRequestContent;
