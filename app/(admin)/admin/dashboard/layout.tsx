import React from "react";
import AdminSidebar from "@/components/adminPanel/AdminSidebar";
import AdminProtectedRoute from "@/context/AdminProtectedRoute";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProtectedRoute>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-6 bg-gray-50 overflow-auto">{children}</main>
      </div>
    </AdminProtectedRoute>
  );
}
