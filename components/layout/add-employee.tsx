"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  UserPlus,
  CirclePlus,
  Loader2,
  X,
} from "lucide-react";

const AddEmployeeForm = () => {
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

  const roles = [
    "Product Designer",
    "Frontend Devloper",
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

  // Calendar generation
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 4)); // May 2025

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({ day: prevMonthLastDay - i, isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true });
    }

    // Next month days
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

  const handleAddEmployee = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }, 2000);
  };

  return (
    <div className="h-screen bg-gray-50 p-8 ">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-8 right-8 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-slide-in">
          <span className="font-medium">Employee Successfully Added</span>
          <button
            onClick={() => setShowToast(false)}
            className="hover:bg-green-700 rounded p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="max-w-full mx-auto bg-white rounded-lg shadow-sm  p-20">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-gray-100 p-3 rounded-lg">
            <img
              src="../img/group.svg"
              alt="Loading"
              className="h-5 w-5 sm:h-6 sm:w-6"
            />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Add Employee
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Add your employees on the HR Mini
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Name and Email Row */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                placeholder="Luke Smart"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="Name@gmail.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Department and Role Row */}
          <div className="grid grid-cols-2 gap-6">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <button
                onClick={() => {
                  setShowDepartmentDropdown(!showDepartmentDropdown);
                  setShowRoleDropdown(false);
                  setShowDatePicker(false);
                }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-left text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent flex items-center justify-between"
              >
                {selectedDepartment || "Select a department"}
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </button>
              {showDepartmentDropdown && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-emerald-500 rounded-lg shadow-lg">
                  {departments.map((dept, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setSelectedDepartment(dept);
                        setShowDepartmentDropdown(false);
                      }}
                      className="px-4 py-3 hover:bg-green-50 cursor-pointer text-gray-700"
                    >
                      {dept}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <button
                onClick={() => {
                  setShowRoleDropdown(!showRoleDropdown);
                  setShowDepartmentDropdown(false);
                  setShowDatePicker(false);
                }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-left text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent flex items-center justify-between"
              >
                {selectedRole || "Select a Role"}
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </button>
              {showRoleDropdown && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-emerald-500 rounded-lg shadow-lg">
                  <div className="p-3 border-b border-gray-200">
                    <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg">
                      <Search className="w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Type or search..."
                        value={searchRole}
                        onChange={(e) => setSearchRole(e.target.value)}
                        className="w-full outline-none text-sm"
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
                      className="px-4 py-3 hover:bg-green-50 cursor-pointer text-gray-700"
                    >
                      {role}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Start Date - Full Width */}
          <div className="relative w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <button
              onClick={() => {
                setShowDatePicker(!showDatePicker);
                setShowDepartmentDropdown(false);
                setShowRoleDropdown(false);
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-left text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent flex items-center justify-between"
            >
              {selectedDate || "Select date"}
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </button>
            {showDatePicker && (
              <div className="absolute z-10 mt-2 bg-white border border-emerald-500 rounded-lg shadow-lg p-4">
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
                    className="p-1 hover:bg-green-50 rounded"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="font-medium">
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
                    className="p-1 hover:bg-green-50 rounded"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <div key={day} className="text-gray-500 font-medium py-2">
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
                      className={`py-2 rounded hover:bg-green-50 ${
                        !dateObj.isCurrentMonth
                          ? "text-gray-300"
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

          {/* Employee Status */}
          <div className="flex items-center justify-between py-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 p-2 rounded-lg">
                <img
                  src="../img/group.svg"
                  alt="Loading"
                  className="h-5 w-5 sm:h-6 sm:w-6"
                />
              </div>
              <div>
                <div className="font-medium text-gray-900">Employee Status</div>
                <div className="text-sm text-gray-500">
                  Decide whether this employee is active on the HR Mini
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {isActive ? "Active" : "Inactive"}
              </span>
              <button
                onClick={() => setIsActive(!isActive)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  isActive ? "bg-emerald-500" : "bg-gray-300"
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

          {/* Submit Button */}
          <div className="pt-4">
            {isLoading ? (
              <div className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 rounded-lg">
                <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                <span className="text-gray-600">Loading...</span>
              </div>
            ) : (
              <button
                onClick={handleAddEmployee}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <CirclePlus className="w-5 h-5" />
                Add Employee
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEmployeeForm;
