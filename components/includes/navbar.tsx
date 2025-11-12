"use client";

import { Bell, Settings } from "lucide-react";
import { ModeToggle } from "../theme/ThemeSwitcher";

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 w-full">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section - Logo, Brand and Notification */}
          <div className="flex items-center space-x-10">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-emerald-600">
                dexwin
              </h1>
              <p className="text-xs text-gray-500">Enterprise</p>
            </div>
            <button className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          {/* Center Section - Greeting */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h2 className="text-base sm:text-lg font-medium text-gray-900 whitespace-nowrap">
              Good morning kofi
            </h2>
          </div>

          {/* Right Section - Settings Icon */}
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <Settings className="h-5 w-5 sm:h-6 sm:w-6" />
              <ModeToggle />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
