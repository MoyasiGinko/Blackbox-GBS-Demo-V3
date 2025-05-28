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

  // Track whether we've completed the authentication check
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  // Track if we're in the process of redirecting
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Only proceed when auth loading is complete
    if (!isLoading) {
      if (!isAuthenticated) {
        setIsRedirecting(true);
        router.replace("/login");
        return; // Don't set isAuthChecked to true if redirecting
      }

      // Authentication check is complete
      setIsAuthChecked(true);
    }
  }, [isLoading, isAuthenticated, router]);

  // Always show loading state first - before any authentication checks
  // This ensures no flash of unauthorized content
  if (isLoading || !isAuthChecked || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          <p className="text-sm text-gray-600">
            {isRedirecting ? "Redirecting..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  // At this point we know: !isLoading && isAuthChecked && !isRedirecting && isAuthenticated

  // Check role-based access for authenticated users
  if (requiredRole && user?.role !== requiredRole) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="mb-4">
              <svg
                className="mx-auto h-16 w-16 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this page.
            </p>
            <p className="text-sm text-gray-500">
              Required role: <span className="font-medium">{requiredRole}</span>
              <br />
              Your role:{" "}
              <span className="font-medium">{user?.role || "None"}</span>
            </p>
          </div>
        </div>
      )
    );
  }

  // Only render children when fully authorized and checked
  return <>{children}</>;
};

export default ProtectedRoute;
