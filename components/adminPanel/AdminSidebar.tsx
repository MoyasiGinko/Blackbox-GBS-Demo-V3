// components/adminPanel/AdminSidebar.tsx
"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import {
  HomeIcon,
  UsersIcon,
  CogIcon,
  CreditCardIcon,
  ServerIcon,
  CakeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";

const links = [
  { label: "Dashboard", href: "/admin/dashboard/", icon: HomeIcon },
  { label: "Users", href: "/admin/dashboard/users", icon: UsersIcon },
  {
    label: "Services",
    href: "/admin/dashboard/services",
    icon: ServerIcon,
    submenu: [
      { label: "List Services", href: "/admin/dashboard/services" },
      { label: "User Services", href: "/admin/dashboard/user-services" },
      { label: "Login Services", href: "/admin/dashboard/login-services" },
    ],
  },
  {
    label: "Payments",
    href: "/admin/dashboard/payments",
    icon: CreditCardIcon,
  },
  {
    label: "Subscriptions",
    href: "/admin/dashboard/subscriptions",
    icon: CreditCardIcon,
  },
  {
    label: "Cookies",
    href: "/admin/dashboard/cookies",
    icon: CakeIcon,
    submenu: [
      { label: "List Cookies", href: "/admin/dashboard/cookies" },
      { label: "Cookies Manager", href: "/admin/dashboard/cookies-manager" },
    ],
  },
  { label: "Settings", href: "/admin/dashboard/settings", icon: CogIcon },
];

const AdminSidebar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { state } = useAuth();
  const [openDropdowns, setOpenDropdowns] = useState<{
    [key: string]: boolean;
  }>({});

  const toggleDropdown = (label: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  return (
    <aside className="h-screen w-64 bg-gray-900 text-white flex flex-col py-6 px-3 border-r border-gray-800 sticky top-0 shadow-lg">
      <div className="mb-8 px-3 flex justify-start">
        <button
          onClick={() => router.push("/admin/dashboard/")}
          className="flex items-center space-x-2"
        >
          <span className="text-xl font-bold bg-gradient-to-r from-gray-50 to-gray-100 bg-clip-text text-transparent">
            Admin Panel
          </span>
        </button>
      </div>
      <nav className="flex-1 space-y-1">
        {links.map((link) => {
          const isActive =
            pathname === link.href || pathname.startsWith(link.href + "/");
          const Icon = link.icon;
          const hasSubmenu = link.submenu && link.submenu.length > 0;
          const isOpen = openDropdowns[link.label];

          return (
            <div key={link.href}>
              <button
                onClick={() => {
                  if (hasSubmenu) {
                    toggleDropdown(link.label);
                  } else {
                    router.push(link.href);
                  }
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive && !hasSubmenu
                    ? "bg-indigo-600 text-white font-medium shadow-md"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${
                    isActive ? "text-white" : "text-gray-400"
                  }`}
                />
                <span>{link.label}</span>
                {hasSubmenu &&
                  (isOpen ? (
                    <ChevronUpIcon className="h-4 w-4 ml-auto text-gray-400" />
                  ) : (
                    <ChevronDownIcon className="h-4 w-4 ml-auto text-gray-400" />
                  ))}
                {isActive && !hasSubmenu && (
                  <div className="w-1 h-5 bg-white rounded-full ml-auto" />
                )}
              </button>

              {hasSubmenu && isOpen && (
                <div className="ml-6 mt-1 space-y-1">
                  {link.submenu.map((subItem) => {
                    const isSubActive = pathname === subItem.href;
                    return (
                      <button
                        key={subItem.href}
                        onClick={() => router.push(subItem.href)}
                        className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                          isSubActive
                            ? "bg-indigo-600 text-white font-medium shadow-md"
                            : "text-gray-300 hover:bg-gray-800 hover:text-white"
                        }`}
                      >
                        <span className="text-sm">{subItem.label}</span>
                        {isSubActive && (
                          <div className="w-1 h-4 bg-white rounded-full ml-auto" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-gray-800 pt-4 px-3">
        <div className="flex items-center space-x-3 px-2 py-3 rounded-lg hover:bg-gray-800 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
            <span className="text-sm font-bold">
              {state.user?.full_name?.charAt(0) ||
                state.user?.email?.charAt(0) ||
                "A"}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">
              {state.user?.full_name || "Admin User"}
            </p>
            <p className="text-xs text-gray-400">
              {state.user?.email || "admin@example.com"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
