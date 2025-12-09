"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import axios from "axios";
import { useRouter } from "next/navigation";

interface EditEmployeeFormProps {
  employeeId?: string;
  initialData?: {
    name?: string;
    email?: string;
    role?: string[];
    isActive?: boolean;
  };
  onSuccess?: () => void; // Add callback prop for successful updates
}

const EditEmployeeForm = ({
  employeeId,
  initialData,
  onSuccess,
}: EditEmployeeFormProps) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDarkMode = theme === "dark";
  const router = useRouter();

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [searchRole, setSearchRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [employeeIdState, setEmployeeIdState] = useState("");

  // Load employee data from localStorage on mount
  useEffect(() => {
    const storedEmployee = localStorage.getItem("editEmployee");
    if (storedEmployee) {
      try {
        const employeeData = JSON.parse(storedEmployee);
        console.log("Loaded employee data:", employeeData);

        setEmployeeIdState(employeeData._id || "");
        setName(employeeData.name || "");
        setEmail(employeeData.email || "");
        setSelectedDepartment(employeeData.department || "");
        setSelectedRole(employeeData.role || "");
        setIsActive(employeeData.status === "Active");

        // Clear the stored data after loading
        localStorage.removeItem("editEmployee");
      } catch (error) {
        console.error("Error parsing employee data:", error);
      }
    }
  }, []);

  const roles = [
    "Product Designer",
    "Frontend Developer",
    "Backend Developer",
    "Human Resource Management",
    "Customer Support",
  ];

  const filteredRoles = roles.filter((role) =>
    role.toLowerCase().includes(searchRole.toLowerCase())
  );

  const departments = [
    "Engineering",
    "Design",
    "Human Resources",
    "Customer Success",
    "Marketing",
  ];

  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 4));

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({ day: prevMonthLastDay - i, isCurrentMonth: false });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, isCurrentMonth: false });
    }

    return days;
  };

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

  const handleEditEmployee = async () => {
    if (!name.trim()) {
      alert("Name is required");
      return;
    }
    if (!email.trim()) {
      alert("Email is required");
      return;
    }
    if (!selectedDepartment) {
      alert("Department is required");
      return;
    }
    if (!selectedRole) {
      alert("Role is required");
      return;
    }

    setIsLoading(true);

    try {
      const mapRoleToEnum = (uiRole: string): string => {
        const roleMap: { [key: string]: string } = {
          "Product Designer": "EMPLOYEE",
          "Frontend Developer": "EMPLOYEE",
          "Backend Developer": "EMPLOYEE",
          "Human Resource Management": "MANAGER",
          "Customer Support": "EMPLOYEE",
        };
        return roleMap[uiRole] || "EMPLOYEE";
      };

      const payload = {
        id: employeeIdState,
        name: name.trim(),
        email: email.trim(),
        role: [mapRoleToEnum(selectedRole)],
        jobTitle: selectedRole,
        department: selectedDepartment,
        isActive: isActive, // Include the status in the payload
      };

      console.log("Sending update payload:", payload);

      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/users`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("User updated:", response.data);

      setIsLoading(false);
      setShowToast(true);

      // Call onSuccess callback to refresh parent component
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1000);
      }

      // Hide toast and navigate after 3 seconds
      setTimeout(() => {
        setShowToast(false);
        router.push("/manageEmployees");
      }, 3000);
    } catch (err: any) {
      setIsLoading(false);
      console.error("Error updating user:", err);

      if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert("Failed to update user. Please try again.");
      }
    }
  };

  // Prevent hydration mismatch by not rendering theme-dependent content until mounted
  if (!mounted) {
    return (
      <div className="p-8">
        <div className="max-w-full rounded-lg shadow-sm p-20">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-8 ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      {showToast && (
        <div className="fixed top-8 right-8 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-slide-in">
          <span className="font-medium">Employee Successfully Updated</span>
          <button
            onClick={() => setShowToast(false)}
            className="hover:bg-green-700 rounded p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className={`max-w-full rounded-lg shadow-sm p-20`}>
        <div className="flex items-center gap-4 mb-8">
          <div
            className={`p-3 rounded-lg ${
              isDarkMode ? "bg-gray-700" : "bg-gray-100"
            }`}
          >
            <img
              src="../img/group.svg"
              alt="Loading"
              className="h-5 w-5 sm:h-6 sm:w-6"
            />
          </div>
          <div>
            <h1
              className={`text-xl font-semibold ${
                isDarkMode ? "text-gray-100" : "text-gray-900"
              }`}
            >
              Edit Employee
            </h1>
            <p
              className={`text-sm mt-1 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Edit your employees on the HR Mini
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Name
              </label>
              <input
                type="text"
                placeholder="Luke Smart"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                }`}
              />
            </div>
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Email
              </label>
              <input
                type="email"
                placeholder="Name@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="relative">
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Department
              </label>
              <button
                onClick={() => {
                  setShowDepartmentDropdown(!showDepartmentDropdown);
                  setShowRoleDropdown(false);
                  setShowDatePicker(false);
                }}
                disabled={isLoading}
                className={`w-full px-4 py-2.5 border rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent flex items-center justify-between ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-gray-400"
                    : "bg-white border-gray-300 text-gray-500"
                }`}
              >
                {selectedDepartment || "Select a department"}
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </button>
              {showDepartmentDropdown && (
                <div
                  className={`absolute z-10 w-full mt-2 border border-emerald-500 rounded-lg shadow-lg ${
                    isDarkMode ? "bg-gray-700" : "bg-white"
                  }`}
                >
                  {departments.map((dept, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setSelectedDepartment(dept);
                        setShowDepartmentDropdown(false);
                      }}
                      className={`px-4 py-3 cursor-pointer ${
                        isDarkMode
                          ? "text-gray-200 hover:bg-gray-600"
                          : "text-gray-700 hover:bg-green-50"
                      }`}
                    >
                      {dept}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Role
              </label>
              <button
                onClick={() => {
                  setShowRoleDropdown(!showRoleDropdown);
                  setShowDepartmentDropdown(false);
                  setShowDatePicker(false);
                }}
                disabled={isLoading}
                className={`w-full px-4 py-2.5 border rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent flex items-center justify-between ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-gray-400"
                    : "bg-white border-gray-300 text-gray-500"
                }`}
              >
                {selectedRole || "Select a Role"}
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </button>
              {showRoleDropdown && (
                <div
                  className={`absolute z-10 w-full mt-2 border border-emerald-500 rounded-lg shadow-lg ${
                    isDarkMode ? "bg-gray-700" : "bg-white"
                  }`}
                >
                  <div
                    className={`p-3 ${
                      isDarkMode ? "border-gray-600" : "border-gray-200"
                    } border-b`}
                  >
                    <div
                      className={`flex items-center gap-2 px-3 py-2 border rounded-lg ${
                        isDarkMode
                          ? "bg-gray-600 border-gray-500"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      <Search className="w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Type or search..."
                        value={searchRole}
                        onChange={(e) => setSearchRole(e.target.value)}
                        className={`w-full outline-none text-sm ${
                          isDarkMode
                            ? "bg-gray-600 text-gray-200 placeholder-gray-500"
                            : "bg-white text-gray-900 placeholder-gray-400"
                        }`}
                      />
                    </div>
                  </div>
                  {filteredRoles.map((role, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setSelectedRole(role);
                        setShowRoleDropdown(false);
                        setSearchRole("");
                      }}
                      className={`px-4 py-3 cursor-pointer ${
                        isDarkMode
                          ? "text-gray-200 hover:bg-gray-600"
                          : "text-gray-700 hover:bg-green-50"
                      }`}
                    >
                      {role}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="relative w-full">
            <label
              className={`block text-sm font-medium mb-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Start Date
            </label>
            <button
              onClick={() => {
                setShowDatePicker(!showDatePicker);
                setShowDepartmentDropdown(false);
                setShowRoleDropdown(false);
              }}
              disabled={isLoading}
              className={`w-full px-4 py-2.5 border rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent flex items-center justify-between ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-gray-400"
                  : "bg-white border-gray-300 text-gray-500"
              }`}
            >
              {selectedDate || "Select date"}
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </button>
            {showDatePicker && (
              <div
                className={`absolute z-10 mt-2 border border-emerald-500 rounded-lg shadow-lg p-4 ${
                  isDarkMode ? "bg-gray-700" : "bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() =>
                      setCurrentMonth(
                        new Date(
                          currentMonth.getFullYear(),
                          currentMonth.getMonth() - 1
                        )
                      )
                    }
                    className={`p-1 rounded ${
                      isDarkMode ? "hover:bg-gray-600" : "hover:bg-green-50"
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span
                    className={`font-medium ${
                      isDarkMode ? "text-gray-200" : "text-gray-900"
                    }`}
                  >
                    {monthNames[currentMonth.getMonth()]}{" "}
                    {currentMonth.getFullYear()}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentMonth(
                        new Date(
                          currentMonth.getFullYear(),
                          currentMonth.getMonth() + 1
                        )
                      )
                    }
                    className={`p-1 rounded ${
                      isDarkMode ? "hover:bg-gray-600" : "hover:bg-green-50"
                    }`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <div
                      key={day}
                      className={`font-medium py-2 ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                  {getDaysInMonth(currentMonth).map((dateObj, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (dateObj.isCurrentMonth) {
                          setSelectedDate(
                            `${dateObj.day} ${
                              monthNames[currentMonth.getMonth()]
                            } ${currentMonth.getFullYear()}`
                          );
                          setShowDatePicker(false);
                        }
                      }}
                      className={`py-2 rounded ${
                        isDarkMode ? "hover:bg-gray-600" : "hover:bg-green-50"
                      } ${
                        !dateObj.isCurrentMonth
                          ? "text-gray-300"
                          : isDarkMode
                          ? "text-gray-200"
                          : "text-gray-900"
                      }`}
                    >
                      {dateObj.day}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div
            className={`flex items-center justify-between py-4 border-t ${
              isDarkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <img
                  src="../img/group.svg"
                  alt="Loading"
                  className="h-5 w-5 sm:h-6 sm:w-6"
                />
              </div>
              <div>
                <div
                  className={`font-medium ${
                    isDarkMode ? "text-gray-200" : "text-gray-900"
                  }`}
                >
                  Employee Status
                </div>
                <div
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Decide whether this employee is active on the HR Mini
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {isActive ? "Active" : "Inactive"}
              </span>
              <button
                onClick={() => setIsActive(!isActive)}
                disabled={isLoading}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  isActive
                    ? "bg-emerald-500"
                    : isDarkMode
                    ? "bg-gray-600"
                    : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    isActive ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            {isLoading ? (
              <div
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <img
                  src="../img/loader.svg"
                  alt="Loading"
                  className="h-5 w-5 sm:h-6 sm:w-6"
                />
                <span
                  className={isDarkMode ? "text-gray-400" : "text-gray-600"}
                >
                  Loading...
                </span>
              </div>
            ) : (
              <>
                <button
                  onClick={handleEditEmployee}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => router.push("/manageEmployees")}
                  className={`w-full border font-medium py-3 rounded-lg transition-colors ${
                    isDarkMode
                      ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEmployeeForm;
