import DashboardPage from "@/components/userPanel/dashboard";
import ProtectedRoute from "@/components/AdminProtectedRoute";
import React from "react";

export default function Page() {
  return (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  );
}
