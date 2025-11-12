"use-client";

import { useLocation } from "@/app/hooks/location";
import { cn } from "@/lib/utils";
import { Link } from "@inertiajs/react";
import { ChevronDown, ChevronUp, LogOutIcon } from "lucide-react";
import { useMemo, useState } from "react";
import chart from "../../../../public/img/chart.svg";
import home from "../../../../public/img/home.svg";
import toggler from "../../../../public/img/sidebar_toggle_button.svg";
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
  const location = useLocation();
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
    // {
    //   href: route("web.payments.grain-purchases.index"),
    //   label: "Payments",
    //   icon: wallet,
    //   isImage: true,
    //   activeKey: "payments",
    // },
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
    if (location.pathname?.includes("/department")) return "department";
    if (location.pathname?.includes("/roles")) return "roles";
    if (location.pathname?.includes("/employeeslist")) return "employees list";
    if (location.pathname?.includes("/manageEmployees"))
      return "manage employees";
    if (location.pathname?.includes("/employeesProfile"))
      return "employees profile";
    if (location.pathname?.includes("/leaveRequests")) return "leave requests";
    if (location.pathname?.includes("/attendance")) return "attendance";
    return "";
  }, [location]);

  return (
    <>
      {/* ........Sidebar toggle..........*/}
      <button
        className="fixed z-50 cursor-pointer transition-all duration-300"
        style={{
          left: isOpen ? "225px" : "40px",
          top: isOpen ? "98px" : "80px",
          width: isOpen ? "48px" : "40px",
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <img src={toggler} alt="sidebar_toggler" />
      </button>

      {/* ....Sidebar........ */}
      <nav
        className={cn(
          "fixed left-0 top-16 z-20 h-[calc(100vh-4rem)] origin-left transform overflow-y-auto border-r border-[#D6D8DA] bg-white transition-all duration-300",
          isOpen ? "w-64" : "w-16"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Main Menu Label */}
          {isOpen && (
            <div className="px-4 pb-2 pt-8">
              <p className="text-xs font-medium text-gray-500">Main Menu</p>
            </div>
          )}

          {/* Nav Links */}
          <div
            className={cn(
              "flex flex-1 flex-col gap-1",
              isOpen ? "px-4" : "px-2 pt-8"
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
                    isActive ? "bg-[#E8F5E9]" : "hover:bg-gray-50"
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
                    <span className="text-sm font-normal text-[#333333]">
                      {link.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* ...Logout.... */}
          {/* <div className={cn("border-t border-gray-200 p-4")}>
            <button
              className={cn(
                "flex w-full items-center gap-3 rounded-lg py-2 text-[#333333] transition-colors hover:bg-gray-50",
                isOpen ? "px-3" : "justify-center"
              )}
              title={!isOpen ? "Logout" : undefined}
            >
              <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
                <LogOutIcon size={20} />
              </div>
              {isOpen && <span className="text-sm font-normal">Logout</span>}
            </button>
          </div> */}
          <div className="p-3 border-t border-gray-200">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xl">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {user.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    <img
                      src="../img/apraku.svg"
                      alt="user icon"
                      className="inline w-4 h-4"
                    />
                  </div>
                </div>
              </div>
              {isUserMenuOpen ? (
                <ChevronUp size={16} className="text-gray-400" />
              ) : (
                <ChevronDown size={16} className="text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
