import DashboardPage from "@/components/adminPanel/dashboard";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import React from "react";

export default function Page() {
  return (
    <AdminProtectedRoute>
      <DashboardPage />
    </AdminProtectedRoute>
  );
}
