"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import { ChevronDown, ChevronUp, LogOutIcon, Menu, X } from "lucide-react";
import { useMemo, useState } from "react";
import chart from "../../../../public/img/chart.svg";
import home from "../../../../public/img/home.svg";
import Link from "next/link";

import wallet from "../../../../public/img/wallet2.svg";

type NavLink = {
  href: string;
  label: string;
  icon:
    | string
    | React.ComponentType<{ size?: number | string; className?: string }>;
  isImage?: boolean;
  activeKey: string;
  iconBg?: string;
};

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  user: {
    name: string;
    avatar?: string;
  };
}

export function Sidebar({ isOpen, setIsOpen, user }: SidebarProps) {
  const pathname = usePathname();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navLinks: NavLink[] = [
    {
      href: "/department",
      label: "Department",
      icon: "../img/department.svg",
      isImage: true,
      activeKey: "department",
    },
    {
      href: "/roles",
      label: "Roles",
      icon: "../img/square.svg",
      isImage: true,
      activeKey: "roles",
    },
    {
      href: "/employeeslist",
      label: "Employees List",
      icon: "../img/circle.svg",
      isImage: true,
      activeKey: "employees list",
    },
    {
      href: "/manageEmployees",
      label: "Manage Employees",
      icon: "../img/group.svg",
      isImage: true,
      activeKey: "manage employees",
    },
    {
      href: "/employeesProfile",
      label: "Employees Profile",
      icon: "../img/user.svg",
      isImage: true,
      activeKey: "employees profile",
    },
    {
      href: "/leaveRequests",
      label: "Leave Requests",
      icon: "../img/leave.svg",
      isImage: true,
      activeKey: "leave requests",
    },
    {
      href: "/attendance",
      label: "Attendance",
      icon: "../img/plus.svg",
      isImage: true,
      activeKey: "attendance",
    },
  ];

  const activeTab = useMemo(() => {
    if (pathname?.includes("/department")) return "department";
    if (pathname?.includes("/roles")) return "roles";
    if (pathname?.includes("/employeeslist")) return "employees list";
    if (pathname?.includes("/manageEmployees")) return "manage employees";
    if (pathname?.includes("/employeesProfile")) return "employees profile";
    if (pathname?.includes("/leaveRequests")) return "leave requests";
    if (pathname?.includes("/attendance")) return "attendance";
    return "";
  }, [pathname]);

  return (
    <>
      {/* ........Sidebar toggle..........*/}
      <button
        className="fixed z-50 cursor-pointer transition-all duration-300 flex items-center justify-center rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
        style={{
          left: isOpen ? "248px" : "8px",
          top: "120px",
          width: "32px",
          height: "32px",
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X size={20} className="text-gray-600 dark:text-gray-300" />
        ) : (
          <Menu size={20} className="text-gray-600 dark:text-gray-300" />
        )}
      </button>

      {/* ....Sidebar........ */}
      <nav
        className={cn(
          "fixed left-0 top-14 z-20 h-[calc(100vh-3.5rem)] origin-left transform overflow-y-auto border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-all duration-300",
          isOpen ? "w-64" : "w-16"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Main Menu Label */}
          {isOpen && (
            <div className="px-4 pb-2 pt-4">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Main Menu
              </p>
            </div>
          )}

          {/* Nav Links */}
          <div
            className={cn(
              "flex flex-1 flex-col gap-1",
              isOpen ? "px-4" : "px-2 pt-4"
            )}
          >
            {navLinks.map((link) => {
              const IconComp = typeof link.icon === "string" ? null : link.icon;
              const isActive = activeTab === link.activeKey;

              return (
                <Link
                  key={link.activeKey}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg transition-colors",
                    isOpen ? "h-[44px] px-3 py-2" : "h-12 justify-center py-3",
                    isActive
                      ? "bg-[#E8F5E9] dark:bg-emerald-900/30"
                      : "hover:bg-green-50 dark:hover:bg-emerald-900/20"
                  )}
                  title={!isOpen ? link.label : undefined}
                >
                  <div
                    className={cn(
                      "flex flex-shrink-0 items-center justify-center",
                      isOpen ? "h-5 w-5" : "h-6 w-6"
                    )}
                  >
                    {link.isImage ? (
                      <img
                        src={link.icon as string}
                        alt={link.label}
                        className="h-5 w-5 object-contain"
                      />
                    ) : (
                      IconComp && <IconComp size={20} />
                    )}
                  </div>

                  {isOpen && (
                    <span className="text-sm font-normal text-gray-900 dark:text-gray-100">
                      {link.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {isOpen ? (
                <>
                  <div className="flex items-center space-x-3">
                    <img
                      src="../img/apraku.svg"
                      alt="user icon"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Kofi Ampraku
                      </div>
                      <h1 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Admin
                      </h1>
                    </div>
                  </div>
                  <img
                    src="../img/arrow.svg"
                    alt="user icon"
                    className="w-4 h-4 rounded-full object-cover mx-auto"
                  />
                </>
              ) : (
                <img
                  src="../img/apraku.svg"
                  alt="user icon"
                  className="w-8 h-8 rounded-full object-cover mx-auto"
                />
              )}
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
