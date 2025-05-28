// components/adminPanel/AdminSidebar.tsx
"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";

const links = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Users", href: "/admin/users" },
  { label: "Services", href: "/admin/services" },
  { label: "Payments", href: "/admin/payments" },
  { label: "Settings", href: "/admin/settings" },
];

const AdminSidebar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside className="h-screen w-64 bg-gray-900 text-white flex flex-col py-8 px-4 border-r border-gray-800">
      <div className="mb-8 text-2xl font-bold text-center">Admin Panel</div>
      <nav className="flex-1 space-y-2">
        {links.map((link) => (
          <button
            key={link.href}
            onClick={() => router.push(link.href)}
            className={`w-full text-left px-4 py-2 rounded transition font-medium ${
              pathname === link.href
                ? "bg-indigo-600 text-white"
                : "hover:bg-gray-800 text-gray-200"
            }`}
          >
            {link.label}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
