"use client";

import { AppLayout } from "@/components/layout/app";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EmployeeProfileContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("info");
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch employee data from localStorage or API
    const storedEmployee = localStorage.getItem("selectedEmployee");
    if (storedEmployee) {
      const employee = JSON.parse(storedEmployee);
      setEmployeeData(employee);

      // Fetch leave requests for this employee
      fetchLeaveRequests(employee._id);
    }
  }, []);

  const fetchLeaveRequests = async (employeeId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/leave-requests?employeeId=${employeeId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setLeaveRequests(result.data || result || []);
      }
    } catch (error) {
      console.error("Error fetching leave requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "info", label: "Info" },
    { id: "roles", label: "Roles" },
    { id: "leaves", label: "Leaves" },
    { id: "reviews", label: "Reviews", badge: 2 },
  ];

  // Get initials from name
  const getInitials = (name: string) => {
    if (!name) return "NA";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format date range
  const formatDateRange = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return "N/A";
    const start = new Date(startDate);
    const end = new Date(endDate);

    const startFormatted = start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const endFormatted = end.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return `${startFormatted} – ${endFormatted}`;
  };

  // Calculate duration in days
  const calculateDuration = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
    return diffDays;
  };

  // Calculate leave balance summary
  const calculateLeaveBalance = () => {
    const annualAllotment = 20; // Default annual leave days

    // Calculate total used days from approved leave requests
    const approvedLeaves = leaveRequests.filter(
      (request) =>
        request.status === "APPROVED" || request.status === "Approved"
    );

    const timeUsed = approvedLeaves.reduce((total, request) => {
      return total + calculateDuration(request.startDate, request.endDate);
    }, 0);

    const currentBalance = annualAllotment - timeUsed;

    return {
      annualAllotment,
      timeUsed,
      currentBalance,
    };
  };

  // Get status display name
  const getStatusDisplay = (status: string) => {
    if (!status) return "Pending Approval";
    if (status === "PENDING") return "Pending Approval";
    if (status === "APPROVED") return "Approved";
    if (status === "REJECTED") return "Rejected";
    return status;
  };

  // Get status color classes
  const getStatusClasses = (status: string) => {
    if (!status || status === "PENDING") {
      return {
        bg: "bg-gray-100 dark:bg-gray-700",
        dot: "bg-gray-400",
        text: "text-gray-600 dark:text-gray-400",
      };
    }
    if (status === "APPROVED") {
      return {
        bg: "bg-green-50 dark:bg-green-900/20",
        dot: "bg-green-500",
        text: "text-gray-900 dark:text-gray-100",
      };
    }
    if (status === "REJECTED") {
      return {
        bg: "bg-red-50 dark:bg-red-900/20",
        dot: "bg-red-500",
        text: "text-red-600 dark:text-red-400",
      };
    }
    return {
      bg: "bg-gray-100 dark:bg-gray-700",
      dot: "bg-gray-400",
      text: "text-gray-600 dark:text-gray-400",
    };
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-gray-600 dark:text-gray-400">Loading...</div>
        </div>
      </AppLayout>
    );
  }

  const leaveBalance = calculateLeaveBalance();

  return (
    <AppLayout>
      <div className="flex-1 bg-white dark:bg-gray-900">
        {/* Breadcrumb */}
        <div className="px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span
              onClick={() => router.push("/employeesProfile")}
              className="hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
            >
              Employees Profile
            </span>
            <span>›</span>
            <span>Profile page</span>
          </div>
        </div>

        {/* Header with Icon */}
        <div className="px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <img
                src="../img/user.svg"
                alt="Employee Profile Icon"
                className="h-6 w-6 dark:brightness-0 dark:invert"
              />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Profile
            </h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-8">
          <div className="flex gap-48">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative py-4 text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "text-green-500"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {tab.label}
                {tab.badge && (
                  <span className="text-gray-600 dark:text-gray-400">
                    {tab.badge}
                  </span>
                )}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500"></span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="px-8 py-6">
          {activeTab === "info" && employeeData && (
            <div className="flex flex-col items-center">
              {/* Profile Avatar */}
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 mb-6">
                <span className="text-5xl font-medium text-gray-700 dark:text-gray-300">
                  {getInitials(employeeData.name)}
                </span>
              </div>

              {/* Name and ID */}
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {employeeData.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Employee ID: {employeeData._id || "N/A"}
              </p>

              {/* Role Badge */}
              <div className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg mb-8">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {employeeData.role || "N/A"}
                </span>
              </div>

              {/* Info Grid */}
              <div className="w-full max-w-4xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8">
                <div className="grid grid-cols-2 gap-x-16 gap-y-8">
                  {/* Left Column */}
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Department
                    </p>
                    <p className="text-base font-medium text-gray-900 dark:text-gray-100 mb-6">
                      {employeeData.department || "N/A"}
                    </p>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Brief Description
                    </p>
                    <p className="text-base text-gray-900 dark:text-gray-100 mb-6">
                      Some Context here
                    </p>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Manager
                    </p>
                    <p className="text-base font-medium text-green-500 mb-6">
                      Henry
                    </p>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Location
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🇦🇺</span>
                      <span className="text-base text-gray-900 dark:text-gray-100">
                        Melbourne, Australia
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 mt-6">
                      Email
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-medium text-green-500">
                        {employeeData.email || "N/A"}
                      </span>
                      <button className="text-green-500 hover:text-green-600">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Employment Type
                    </p>
                    <p className="text-base font-medium text-gray-900 dark:text-gray-100 mb-6">
                      Full Time
                    </p>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Current Employment Status
                    </p>
                    <div className="flex items-center gap-2 mb-6">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          employeeData.status === "Active"
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      ></span>
                      <span className="text-base font-medium text-gray-900 dark:text-gray-100">
                        {employeeData.status || "N/A"}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Emergency Contact
                    </p>
                    <p className="text-base font-medium text-green-500 mb-6">
                      John Debrah - 0576896734
                    </p>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Location of Emergency Contact
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🇦🇺</span>
                      <span className="text-base text-gray-900 dark:text-gray-100">
                        Melbourne, Australia
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "roles" && employeeData && (
            <div className="max-w-4xl">
              {/* Roles Card */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8">
                <div className="space-y-6">
                  {/* Job Title */}
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Job Title
                    </p>
                    <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {employeeData.role || "N/A"}
                    </p>
                  </div>

                  {/* Role Start Date */}
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Role Start Date
                    </p>
                    <p className="text-base text-gray-900 dark:text-gray-100">
                      June 1, 2023
                    </p>
                  </div>

                  {/* Functional Area */}
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Functional Area
                    </p>
                    <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {employeeData.department || "N/A"}
                    </p>
                  </div>

                  {/* Location/Assignment */}
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Location/Assignment
                    </p>
                    <p className="text-base text-gray-900 dark:text-gray-100">
                      Remote – EST
                    </p>
                  </div>

                  {/* Direct Manager */}
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Direct Manager
                    </p>
                    <p className="text-base font-medium text-green-500">
                      Sophia Reyes, VP of Product
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "leaves" && (
            <div className="space-y-6">
              {/* Leave Balances Summary */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                  Leave Balances Summary
                </h3>

                <div className="space-y-6">
                  <div className="grid grid-cols-4 gap-8">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Leave Type
                      </p>
                      <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                        Vacation / Annual Leave
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Annual Allotment
                      </p>
                      <p className="text-base text-gray-900 dark:text-gray-100">
                        {leaveBalance.annualAllotment} Days
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Time Used
                      </p>
                      <p className="text-base text-gray-900 dark:text-gray-100">
                        {leaveBalance.timeUsed} Days
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Current Balance
                      </p>
                      <p className="text-base text-gray-900 dark:text-gray-100">
                        {leaveBalance.currentBalance} Days
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pending & Approved Leave Requests */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                  Pending & Approved Leave Requests
                </h3>

                {leaveRequests && leaveRequests.length > 0 ? (
                  <div className="space-y-6">
                    {leaveRequests.map((request: any, index: number) => {
                      const statusClasses = getStatusClasses(request.status);
                      const duration = calculateDuration(
                        request.startDate,
                        request.endDate
                      );

                      return (
                        <div key={index} className="grid grid-cols-4 gap-8">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              Date Range
                            </p>
                            <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                              {formatDateRange(
                                request.startDate,
                                request.endDate
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              Type
                            </p>
                            <p className="text-base text-gray-900 dark:text-gray-100">
                              Vacation
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              Duration
                            </p>
                            <p className="text-base text-gray-900 dark:text-gray-100">
                              {duration} {duration === 1 ? "Day" : "Days"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              Status
                            </p>
                            <div
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg ${statusClasses.bg}`}
                            >
                              <span
                                className={`h-2 w-2 rounded-full ${statusClasses.dot}`}
                              ></span>
                              <span className={`text-sm ${statusClasses.text}`}>
                                {getStatusDisplay(request.status)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No leave requests available
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Performance Review History
              </h3>

              <div className="space-y-6">
                {/* First Review */}
                <div className="grid grid-cols-4 gap-8">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Review Period
                    </p>
                    <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                      Annual 2024
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Overall Rating
                    </p>
                    <p className="text-base text-gray-900 dark:text-gray-100">
                      Exceeds Expectations
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Completed Date
                    </p>
                    <p className="text-base text-gray-900 dark:text-gray-100">
                      Jan 15, 2025
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Manager
                    </p>
                    <p className="text-base text-gray-900 dark:text-gray-100">
                      Alvin Ofori
                    </p>
                  </div>
                </div>

                {/* Second Review */}
                <div className="grid grid-cols-4 gap-8">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Review Period
                    </p>
                    <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                      Mid-Year 2024
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Overall Rating
                    </p>
                    <p className="text-base text-gray-900 dark:text-gray-100">
                      Exceeds Expectations
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Completed Date
                    </p>
                    <p className="text-base text-gray-900 dark:text-gray-100">
                      Jan 15, 2025
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Manager
                    </p>
                    <p className="text-base text-gray-900 dark:text-gray-100">
                      Alvin Ofori
                    </p>
                  </div>
                </div>

                {/* Third Review */}
                <div className="grid grid-cols-4 gap-8">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Review Period
                    </p>
                    <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                      Annual 2023
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Overall Rating
                    </p>
                    <p className="text-base text-gray-900 dark:text-gray-100">
                      Meets Expectations
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Completed Date
                    </p>
                    <p className="text-base text-gray-900 dark:text-gray-100">
                      Jan 15, 2025
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Manager
                    </p>
                    <p className="text-base text-gray-900 dark:text-gray-100">
                      Alvin Ofori
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
