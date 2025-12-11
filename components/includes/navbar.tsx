"use client";

import { Bell, Settings } from "lucide-react";
import { ModeToggle } from "../theme/ThemeSwitcher";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [employee, setEmployee] = useState<any>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [greeting, setGreeting] = useState("Good morning"); // Add this line

  // ---- Load user from localStorage safely ----
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

      setEmployee(storedUser);
      setUserRoles(storedUser?.role || []);
      setIsLoaded(true);
    }
  }, []);

  // ---- Set greeting based on time ----
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good morning");
    } else if (hour < 18) {
      setGreeting("Good afternoon");
    } else {
      setGreeting("Good evening");
    }
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Left Section - Logo and Brand */}
          <div className="flex items-center space-x-24">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-emerald-600">
                dexwin
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enterprise
              </p>
            </div>
          </div>

          {/* Center Section - Greeting */}
          <div className="flex-1 flex justify-start ml-40">
            <div className="text-base font-bold text-[#001F37] dark:text-gray-400 ">
              {greeting} {employee?.name}
            </div>
          </div>

          {/* Right Section - Bell, Settings and Theme Toggle */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <button className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <Settings className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <ModeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
