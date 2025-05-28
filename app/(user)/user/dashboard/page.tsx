import DashboardPage from "@/components/userPanel/dashboard";
import ProtectedRoute from "@/components/ProtectedRoute";
import React from "react";

export default function Page() {
  return (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  );
}
