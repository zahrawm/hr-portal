"use client";

import { AppLayout } from "@/components/layout/app";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EmployeeProfileContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("info");

  const tabs = [
    { id: "info", label: "Info" },
    { id: "roles", label: "Roles" },
    { id: "leaves", label: "Leaves" },
    { id: "reviews", label: "Reviews", badge: 2 },
  ];

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
                className="h-6 w-6"
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

        {/* Content Area - Empty */}
        <div className="px-8 py-6">
          {/* Content goes here based on active tab */}
        </div>
      </div>
    </AppLayout>
  );
}
