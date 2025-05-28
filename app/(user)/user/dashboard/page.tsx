import DashboardPage from "@/components/userPanel/dashboard";
import UserProtectedRoute from "@/context/UserProtectedRoute";
import React from "react";

export default function Page() {
  return (
    <UserProtectedRoute>
      <DashboardPage />
    </UserProtectedRoute>
  );
}
