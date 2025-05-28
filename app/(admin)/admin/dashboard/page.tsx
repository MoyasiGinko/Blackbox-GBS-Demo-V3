import DashboardPage from "@/components/adminPanel/modules/DashboardModule";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import React from "react";

export default function Page() {
  return (
    <AdminProtectedRoute>
      <DashboardPage />
    </AdminProtectedRoute>
  );
}
