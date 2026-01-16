"use client";
import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AppLayout } from "@/components/layout/app";
import { useRouter } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";

const SubmitLeaveForm: React.FC = () => {
  const router = useRouter();
  const { isSignedIn, user, isLoaded } = useUser();
  const { getToken, isLoaded: authLoaded } = useAuth();
  const [dateRange, setDateRange] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [reason, setReason] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Get authentication token on mount
  useEffect(() => {
    const getAuthToken = async () => {
      // First check localStorage for regular login token
      const localToken = localStorage.getItem("token");
      if (localToken) {
        setAuthToken(localToken);
        console.log("Using localStorage token");
        return;
      }

      // If no localStorage token and Clerk is loaded, try to get Clerk token
      if (authLoaded && isSignedIn) {
        try {
          const clerkToken = await getToken();
          if (clerkToken) {
            setAuthToken(clerkToken);
            console.log("Using Clerk token");
          } else {
            console.error("Clerk sign in detected but no token available");
          }
        } catch (error) {
          console.error("Error getting Clerk token:", error);
        }
      }
    };

    getAuthToken();
  }, [isSignedIn, authLoaded, getToken]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Previous month days
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonthDay = new Date(year, month, -startingDayOfWeek + i + 1);
      days.push({ date: prevMonthDay, isCurrentMonth: false });
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    return days;
  };

  const handleDateClick = (date: Date) => {
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      setSelectedStartDate(date);
      setSelectedEndDate(null);
    } else if (selectedStartDate && !selectedEndDate) {
      if (date >= selectedStartDate) {
        setSelectedEndDate(date);
        const start = selectedStartDate.toLocaleDateString();
        const end = date.toLocaleDateString();
        setDateRange(`${start} - ${end}`);
        setShowCalendar(false);
      } else {
        setSelectedStartDate(date);
        setSelectedEndDate(null);
      }
    }
  };

  const isDateInRange = (date: Date) => {
    if (!selectedStartDate) return false;
    if (!selectedEndDate)
      return date.toDateString() === selectedStartDate.toDateString();
    return date >= selectedStartDate && date <= selectedEndDate;
  };

  const previousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const handleSubmit = async () => {
    // Validation
    if (!dateRange) {
      alert("Please select a date range");
      return;
    }

    if (!reason.trim()) {
      alert("Please provide a reason");
      return;
    }

    if (reason.trim().length < 10) {
      alert("Reason must be at least 10 characters long");
      return;
    }

    if (!selectedStartDate || !selectedEndDate) {
      alert("Please select both start and end dates");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get fresh token
      let token = authToken;

      // Try to get a fresh Clerk token if user is signed in with Clerk
      if (isSignedIn && authLoaded) {
        try {
          const freshClerkToken = await getToken();
          if (freshClerkToken) {
            token = freshClerkToken;
            console.log("Using fresh Clerk token for submission");
          }
        } catch (err) {
          console.error("Error getting fresh Clerk token:", err);
        }
      }

      // Final check for token
      if (!token) {
        alert("Authentication required. Please log in again.");
        router.push("/login");
        return;
      }

      const requestData = {
        startDate: selectedStartDate.toISOString(),
        endDate: selectedEndDate.toISOString(),
        reason: reason.trim(),
        status: "PENDING",
      };

      console.log("Submitting leave request...");
      console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);
      console.log("Request data:", requestData);
      console.log("Token available:", !!token);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/leave-requests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestData),
        }
      );

      console.log("Response status:", response.status);
      console.log("Response OK:", response.ok);

      if (!response.ok) {
        let errorMessage = `Server error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          console.error("Error response data:", errorData);
        } catch (e) {
          console.error("Could not parse error response");
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Leave request submitted successfully:", data);

      // Clear form
      setDateRange("");
      setReason("");
      setSelectedStartDate(null);
      setSelectedEndDate(null);

      // Navigate back to Leave Request page with success flag
      router.push("/leaveRequests?success=true");
    } catch (error: any) {
      console.error("Error submitting leave request:", error);
      alert(
        `Failed to submit leave request: ${error.message}\n\nPlease check your internet connection and try again. If the problem persists, try logging out and logging back in.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-white dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
        {/* Breadcrumb */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span
              onClick={() => router.push("/leaveRequests")}
              className="hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
            >
              Leave Request
            </span>
            <span>&gt;</span>
            <span className="text-gray-900 dark:text-white font-medium">
              Submit Leave
            </span>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
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
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                Submit Leave
              </h1>
              {isSignedIn && user && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Logged in as: {user.primaryEmailAddress?.emailAddress}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-6xl">
          {/* Date Range Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Date range
            </label>
            <div className="relative">
              <input
                type="text"
                value={dateRange}
                onClick={() => setShowCalendar(!showCalendar)}
                placeholder="Select a date range"
                readOnly
                className="w-full px-4 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent text-sm cursor-pointer"
              />
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />

              {/* Calendar Popup */}
              {showCalendar && (
                <div className="absolute z-10 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 w-full sm:w-96">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={previousMonth}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <span className="text-base font-semibold text-gray-900 dark:text-white">
                      {monthNames[currentMonth.getMonth()]}{" "}
                      {currentMonth.getFullYear()}
                    </span>
                    <button
                      onClick={nextMonth}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>

                  {/* Day Names */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {dayNames.map((day, index) => (
                      <div
                        key={`day-name-${index}`}
                        className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-1">
                    {getDaysInMonth(currentMonth).map((day, index) => {
                      const isInRange = isDateInRange(day.date);
                      const isStart =
                        selectedStartDate &&
                        day.date.toDateString() ===
                          selectedStartDate.toDateString();
                      const isEnd =
                        selectedEndDate &&
                        day.date.toDateString() ===
                          selectedEndDate.toDateString();

                      return (
                        <button
                          key={`calendar-day-${day.date.getFullYear()}-${day.date.getMonth()}-${day.date.getDate()}-${index}`}
                          onClick={() => handleDateClick(day.date)}
                          className={`
                            p-2 text-sm rounded-lg transition-colors
                            ${
                              !day.isCurrentMonth
                                ? "text-gray-300 dark:text-gray-600"
                                : "text-gray-900 dark:text-white"
                            }
                            ${
                              isInRange
                                ? "bg-emerald-100 dark:bg-emerald-900/30"
                                : "hover:bg-gray-100 dark:hover:bg-gray-700"
                            }
                            ${
                              isStart || isEnd
                                ? "bg-emerald-500 text-white hover:bg-emerald-600"
                                : ""
                            }
                          `}
                        >
                          {day.date.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reason Field */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Type your reason here."
              rows={2}
              className="w-full px-4 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent text-sm resize-none"
            />
          </div>

          {/* Debug Info (remove in production) */}
          {process.env.NODE_ENV === "development" && (
            <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs">
              <p className="font-semibold mb-2">Debug Info:</p>
              <p>Clerk Loaded: {isLoaded ? "Yes" : "No"}</p>
              <p>Auth Loaded: {authLoaded ? "Yes" : "No"}</p>
              <p>Signed In: {isSignedIn ? "Yes" : "No"}</p>
              <p>Has Token: {authToken ? "Yes" : "No"}</p>
              <p>API URL: {process.env.NEXT_PUBLIC_API_URL || "Not set"}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !authToken}
            className="w-full px-6 py-3 sm:py-3.5 bg-emerald-500 dark:bg-emerald-600 text-white rounded-lg hover:bg-emerald-600 dark:hover:bg-emerald-700 transition-colors font-medium text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? "Submitting..."
              : !authToken
              ? "Loading authentication..."
              : "Submit Leave"}
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default SubmitLeaveForm;
