import DashboardPage from "@/components/adminPanel/dashboard";
import ProtectedRoute from "@/components/AdminProtectedRoute";
import React from "react";

export default function Page() {
  return (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  );
}
