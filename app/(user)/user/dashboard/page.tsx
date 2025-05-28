import DashboardPage from "@/components/authPage/dashboard";
import ProtectedRoute from "@/components/ProtectedRoute";
import React from "react";

export default function Page() {
  return (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  );
}
