// components/ProtectedRoute.tsx - Enhanced secure route protection component
"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  fallback,
}) => {
  const { state } = useAuth();
  const { user, isAuthenticated, isLoading } = state;
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Only check after loading is done
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace("/login");
      }
      setChecked(true);
    }
  }, [isLoading, isAuthenticated, router]);

  // Show loading state while checking or loading
  if (isLoading || !checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Show access denied for authenticated users without proper role
  if (isAuthenticated && requiredRole && user?.role !== requiredRole) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
            <p className="text-gray-600">
              You don't have permission to access this page.
            </p>
          </div>
        </div>
      )
    );
  }

  // Only render children when fully authorized
  return <>{children}</>;
};

export default ProtectedRoute;
