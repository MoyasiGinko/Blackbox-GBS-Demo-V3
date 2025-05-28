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

  // Initialize as checking - this ensures loading shows first
  const [isChecking, setIsChecking] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    // Not authenticated: redirect to login
    if (!isAuthenticated) {
      if (!isRedirecting) {
        setIsRedirecting(true);
        router.replace("/login");
      }
      return;
    }

    // Not verified: clear session and redirect to login
    if (!user?.is_verified) {
      if (!isRedirecting) {
        setIsRedirecting(true);
        if (typeof window !== "undefined") {
          localStorage.clear();
          sessionStorage.clear();
        }
        router.replace("/login");
      }
      return;
    }

    // Admin and verified: redirect to admin dashboard
    if (user?.is_admin === true && user?.is_verified === true) {
      if (!isRedirecting) {
        setIsRedirecting(true);
        router.replace("/admin/dashboard");
      }
      return;
    }

    // Authenticated, verified, and not admin: allow access
    setIsChecking(false);
  }, [isLoading, isAuthenticated, user, router, isRedirecting]);

  // ALWAYS show loading state first - this is the key!
  if (isChecking || isLoading || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            {/* Outer spinning ring */}
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
            {/* Inner spinning ring */}
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent absolute top-0 left-0"></div>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900">
              {isRedirecting
                ? "Redirecting to login..."
                : "Verifying authentication..."}
            </p>
            <p className="text-xs text-gray-500 mt-1">Please wait a moment</p>
          </div>
        </div>
      </div>
    );
  }

  // Check role-based access for authenticated users
  if (requiredRole && user?.role !== requiredRole) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg">
            <div className="mb-6">
              <svg
                className="mx-auto h-20 w-20 text-red-500"
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
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-6">
              You don't have the required permissions to access this page.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Required role:</span>{" "}
                {requiredRole}
              </p>
              <p className="text-sm text-gray-700 mt-1">
                <span className="font-semibold">Your role:</span>{" "}
                {user?.role || "None assigned"}
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      )
    );
  }

  // SUCCESS: User is authenticated and authorized - render children
  return <>{children}</>;
};

export default ProtectedRoute;
