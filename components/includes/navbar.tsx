"use client";

import { Bell, Settings } from "lucide-react";
import { ModeToggle } from "../theme/ThemeSwitcher";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Left Section - Logo, Brand and Notification */}
          <div className="flex items-center space-x-24">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-emerald-600">
                dexwin
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enterprise
              </p>
            </div>
            <button className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
          {/* Center Section - Greeting */}
          <div className="flex-1 flex justify-start ml-16">
            <div className="text-base font-normal text-[#001F37] dark:text-gray-400">
              Good morning kofi
            </div>
          </div>

          {/* Right Section - Settings and Theme Toggle */}
          <div className="flex items-center space-x-2 sm:space-x-3">
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
