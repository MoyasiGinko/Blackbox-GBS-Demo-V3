// components/AdminProtectedRoute.tsx - Admin role-based protection
"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({
  children,
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

    // Authenticated and verified, but not admin: redirect to user dashboard
    if (!user?.is_admin) {
      if (!isRedirecting) {
        setIsRedirecting(true);
        router.replace("/user/dashboard");
      }
      return;
    }

    // Authenticated, verified, and admin: allow access
    setIsChecking(false);
  }, [isLoading, isAuthenticated, user, router, isRedirecting]);

  if (isChecking || isLoading || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent absolute top-0 left-0"></div>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900">
              {isRedirecting ? "Redirecting..." : "Verifying access..."}
            </p>
            <p className="text-xs text-gray-500 mt-1">Please wait a moment</p>
          </div>
        </div>
      </div>
    );
  }

  // If not admin, show fallback or access denied
  if (!user?.is_admin) {
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
              Admin Access Required
            </h2>
            <p className="text-gray-600 mb-6">
              You must be an admin to access this page.
            </p>
            <button
              onClick={() => router.replace("/login")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
