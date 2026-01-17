"use client";
import React, { useEffect, useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { useTheme } from "next-themes";
import { AppLayout } from "@/components/layout/app";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { useUser, useAuth } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

const LeaveRequestContent: React.FC = () => {
  const router = useRouter();
  const { isSignedIn, isLoaded, user } = useUser();
  const { getToken } = useAuth();
  const [showToast, setShowToast] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait for Clerk to load
    if (!isLoaded) return;

    // Check both Clerk auth and localStorage token
    const token = localStorage.getItem("token");

    // If user is not signed in with Clerk AND no token in localStorage, redirect to login
    if (!isSignedIn && !token) {
      router.push("/login");
      return;
    }

    // Initialize page and check for success parameter
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("success") === "true") {
        setShowToast(true);
        window.history.replaceState({}, "", "/leaveRequests");
        setTimeout(() => setShowToast(false), 5000);
        // Add a longer delay to ensure backend has processed the request
        setTimeout(() => {
          console.log("Fetching after successful submission...");
          fetchLeaveRequests();
        }, 1000); // Increased from 500ms to 1000ms
        return;
      }
    }

    fetchLeaveRequests();
  }, [isLoaded, isSignedIn, router]);

  // Listen for storage events to detect when a leave request is submitted
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "leaveRequestSubmitted" && e.newValue === "true") {
        console.log("Leave request submitted, refreshing...");
        // Add delay before fetching
        setTimeout(() => {
          fetchLeaveRequests();
        }, 500);
        localStorage.removeItem("leaveRequestSubmitted");
      }
    };

    const handleCustomRefresh = () => {
      console.log("Custom refresh event triggered");
      // Add delay before fetching
      setTimeout(() => {
        fetchLeaveRequests();
      }, 500);
    };

    // Check on mount if there's a pending refresh
    const checkPendingRefresh = () => {
      if (localStorage.getItem("leaveRequestSubmitted") === "true") {
        console.log("Pending refresh detected on mount");
        setTimeout(() => {
          fetchLeaveRequests();
        }, 500);
        localStorage.removeItem("leaveRequestSubmitted");
      }
    };

    checkPendingRefresh();
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("refreshLeaveRequests", handleCustomRefresh);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("refreshLeaveRequests", handleCustomRefresh);
    };
  }, [isSignedIn, user]);

  // Refetch when page gains focus (user comes back from submit page)
  useEffect(() => {
    const handleFocus = () => {
      console.log("Page focused, refetching leave requests...");
      fetchLeaveRequests();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("Tab became visible, refetching leave requests...");
        fetchLeaveRequests();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isSignedIn, user]);

  const fetchLeaveRequests = async () => {
    console.log("=== FETCHING LEAVE REQUESTS ===");
    setIsLoading(true);
    try {
      const localToken = localStorage.getItem("token");

      // Get Clerk token if signed in with Clerk
      let clerkToken = null;
      if (isSignedIn) {
        try {
          clerkToken = await getToken();
          console.log("Clerk token obtained");
        } catch (error) {
          console.error("Error getting Clerk token:", error);
        }
      }

      // If no auth method available, return
      if (!localToken && !clerkToken) {
        console.log("No authentication found");
        setIsLoading(false);
        return;
      }

      let userId;

      if (localToken) {
        // Decode token to get user ID from localStorage auth
        const decodedToken: any = jwtDecode(localToken);
        userId = decodedToken.id || decodedToken.userId || decodedToken.sub;
        console.log("Using localStorage auth, userId:", userId);
      } else if (isSignedIn && user) {
        // Use Clerk user ID if signed in with Clerk
        userId = user.id;
        console.log("Using Clerk auth, userId:", userId);
      }

      if (!userId) {
        console.error("No user ID found");
        setIsLoading(false);
        return;
      }

      console.log("Fetching leave requests for user:", userId);

      // Prepare headers
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Add authorization token (prioritize Clerk token for new users)
      if (clerkToken) {
        headers.Authorization = `Bearer ${clerkToken}`;
        console.log("Using Clerk token for authentication");
      } else if (localToken) {
        headers.Authorization = `Bearer ${localToken}`;
        console.log("Using localStorage token for authentication");
      }

      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const url = `${process.env.NEXT_PUBLIC_API_URL}/leave-requests?employeeId=${userId}&t=${timestamp}`;
      console.log("Fetching from URL:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: headers,
        credentials: "include",
        cache: "no-store",
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(
          `Failed to fetch leave requests: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("API Response data:", data);
      console.log(
        "Number of requests received:",
        Array.isArray(data)
          ? data.length
          : data.leaveRequests?.length || data.data?.length || 0
      );

      const requestsArray = Array.isArray(data)
        ? data
        : data.leaveRequests || data.data || [];

      console.log("Requests array:", requestsArray);
      console.log("Requests array length:", requestsArray.length);

      if (requestsArray.length === 0) {
        console.log("No leave requests found for this user");
        setLeaveRequests([]);
        setIsLoading(false);
        return;
      }

      const transformedData = requestsArray.map((request: any) => {
        const createdDate = new Date(request.createdAt);
        const formattedDate = `${createdDate
          .getDate()
          .toString()
          .padStart(2, "0")}/${(createdDate.getMonth() + 1)
          .toString()
          .padStart(2, "0")}/${createdDate
          .getFullYear()
          .toString()
          .slice(-2)} | ${createdDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })}`;

        let statusColor = "text-gray-600 dark:text-gray-400";
        let statusBg = "bg-gray-100 dark:bg-gray-700";
        let statusDot = "bg-gray-400 dark:bg-gray-500";
        let displayStatus = "Pending Approval";

        if (request.status === "APPROVED") {
          statusColor = "text-green-600 dark:text-green-400";
          statusBg = "bg-green-50 dark:bg-green-900/20";
          statusDot = "bg-green-500 dark:bg-green-400";
          displayStatus = "Approved";
        } else if (
          request.status === "REJECTED" ||
          request.status === "DENIED"
        ) {
          statusColor = "text-red-600 dark:text-red-400";
          statusBg = "bg-red-50 dark:bg-red-900/20";
          statusDot = "bg-red-500 dark:bg-red-400";
          displayStatus = "Rejected";
        }

        return {
          id: request._id || request.id,
          date: formattedDate,
          status: displayStatus,
          statusColor,
          statusBg,
          statusDot,
          message: request.reason || "No reason provided",
          rawDate: createdDate,
        };
      });

      console.log("Transformed data:", transformedData);
      console.log(
        "Setting leave requests with",
        transformedData.length,
        "items"
      );
      setLeaveRequests(transformedData);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      // Show user-friendly error message
      setLeaveRequests([]);
    } finally {
      setIsLoading(false);
      console.log("=== FETCH COMPLETE ===");
    }
  };

  const handleSubmit = () => {
    router.push("/leaveSubmit");
  };

  const { theme } = useTheme();

  // Show loading while Clerk is checking auth status
  if (!isLoaded) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </AppLayout>
    );
  }

  const filteredRequests = leaveRequests.filter((request) => {
    const matchesSearch =
      request.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.message.toLowerCase().includes(searchTerm.toLowerCase());

    const requestDateStr = request.date.split(" | ")[0];
    const [day, month, year] = requestDateStr.split("/");
    const requestDate = new Date(`20${year}-${month}-${day}`);

    let matchesDateRange = true;
    if (startDate) {
      const start = new Date(startDate);
      matchesDateRange = matchesDateRange && requestDate >= start;
    }
    if (endDate) {
      const end = new Date(endDate);
      matchesDateRange = matchesDateRange && requestDate <= end;
    }

    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "newest" && true) ||
      (selectedFilter === "oldest" && true) ||
      (selectedFilter === "custom" && matchesDateRange);

    return (
      matchesSearch &&
      (selectedFilter === "custom" ? matchesDateRange : matchesFilter)
    );
  });

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    if (selectedFilter === "newest") {
      return b.rawDate.getTime() - a.rawDate.getTime();
    } else if (selectedFilter === "oldest") {
      return a.rawDate.getTime() - b.rawDate.getTime();
    }
    // Default to newest first when filter is "all"
    return b.rawDate.getTime() - a.rawDate.getTime();
  });

  console.log(
    "Rendering component with",
    leaveRequests.length,
    "leave requests"
  );
  console.log("Sorted requests:", sortedRequests.length);

  return (
    <AppLayout>
      {showToast && (
        <div className="fixed top-6 right-6 z-50">
          <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]">
            <span className="flex-1">Leave Submitted Successfully</span>
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center">
                <img
                  src="../img/leave.svg"
                  alt="Department Icon"
                  className="h-8 w-8 dark:brightness-0 dark:invert"
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

        <div className="flex flex-col sm:flex-row gap-3 mb-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Type or search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent text-sm"
            />

            {showFilterDropdown && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                <div className="p-2">
                  <button
                    onClick={() => {
                      setSelectedFilter("all");
                      setStartDate("");
                      setEndDate("");
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                      selectedFilter === "all"
                        ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    All Dates
                  </button>
                  <button
                    onClick={() => {
                      setSelectedFilter("newest");
                      setStartDate("");
                      setEndDate("");
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                      selectedFilter === "newest"
                        ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    Newest First
                  </button>
                  <button
                    onClick={() => {
                      setSelectedFilter("oldest");
                      setStartDate("");
                      setEndDate("");
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                      selectedFilter === "oldest"
                        ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    Oldest First
                  </button>

                  <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                  <div className="px-3 py-2">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Custom Date Range
                    </p>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400">
                          From
                        </label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => {
                            setStartDate(e.target.value);
                            setSelectedFilter("custom");
                          }}
                          className="w-full mt-1 px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400">
                          To
                        </label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => {
                            setEndDate(e.target.value);
                            setSelectedFilter("custom");
                          }}
                          className="w-full mt-1 px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      {(startDate || endDate) && (
                        <button
                          onClick={() => {
                            setStartDate("");
                            setEndDate("");
                            setSelectedFilter("all");
                          }}
                          className="w-full px-2 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                          Clear dates
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-8">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors whitespace-nowrap"
            >
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

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-4 sm:py-5">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              Leave Request Status Tracker
            </h3>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="text-gray-400 dark:text-gray-500 mb-3">
                  <svg
                    className="animate-spin h-12 w-12 mx-auto"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
                  Loading...
                </p>
              </div>
            ) : sortedRequests.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-t border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      Date Submitted
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
                  {sortedRequests.map((request) => (
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
                        <button className="flex items-center gap-2 px-3 py-1.5 rounded bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors w-40">
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
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="text-gray-400 dark:text-gray-500 mb-3">
                  <svg
                    className="w-16 h-16 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
                  No dates found
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
                  Try adjusting your search or filter
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default LeaveRequestContent;
