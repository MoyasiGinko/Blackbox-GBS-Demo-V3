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

  // Enhanced state management
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [currentStep, setCurrentStep] = useState("Initializing...");

  useEffect(() => {
    // Debug logs
    console.log("[ProtectedRoute] user:", user);
    console.log("[ProtectedRoute] isAuthenticated:", isAuthenticated);
    console.log("[ProtectedRoute] isLoading:", isLoading);
    console.log("[ProtectedRoute] authCheckComplete:", authCheckComplete);

    // Step 1: Wait for initial auth loading to complete
    if (isLoading) {
      setCurrentStep("Checking authentication...");
      setAuthCheckComplete(false);
      return;
    }

    // Step 2: Authentication check is complete, now process the results
    if (!authCheckComplete) {
      setCurrentStep("Processing authentication results...");

      // Small delay to ensure state is stable and prevent flash
      const timer = setTimeout(() => {
        setAuthCheckComplete(true);
      }, 100);

      return () => clearTimeout(timer);
    }

    // Step 3: Now we can safely make routing decisions
    if (authCheckComplete && !isRedirecting) {
      // Case 1: Not authenticated at all
      if (!isAuthenticated) {
        setCurrentStep("Redirecting to login...");
        setIsRedirecting(true);
        router.replace("/login");
        return;
      }

      // Case 2: Authenticated but not verified
      if (user && !user.is_verified) {
        setCurrentStep("Account not verified, redirecting...");
        setIsRedirecting(true);
        if (typeof window !== "undefined") {
          localStorage.clear();
          sessionStorage.clear();
        }
        router.replace("/login");
        return;
      }

      // Case 3: Authenticated, verified, and admin - redirect to admin dashboard
      if (user && user.is_verified && user.is_admin) {
        setCurrentStep("Redirecting to admin dashboard...");
        setIsRedirecting(true);
        router.replace("/admin/dashboard");
        return;
      }

      // Case 4: Authenticated, verified, non-admin - check role requirements
      if (user && user.is_verified && !user.is_admin) {
        if (requiredRole && user.role !== requiredRole) {
          setCurrentStep("Checking role permissions...");
          // Don't redirect for role mismatch, just show access denied
          const timer = setTimeout(() => {
            setCurrentStep("");
          }, 300);
          return () => clearTimeout(timer);
        }

        // Case 5: All checks passed - grant access
        setCurrentStep("Access granted!");
        const timer = setTimeout(() => {
          setCurrentStep("");
        }, 300);
        return () => clearTimeout(timer);
      }

      // Case 6: Fallback - something unexpected, wait a bit more
      setCurrentStep("Verifying permissions...");
      const fallbackTimer = setTimeout(() => {
        if (!user) {
          setIsRedirecting(true);
          router.replace("/login");
        }
      }, 1000);
      return () => clearTimeout(fallbackTimer);
    }
  }, [
    isLoading,
    isAuthenticated,
    user,
    router,
    authCheckComplete,
    isRedirecting,
    requiredRole,
  ]);

  // Show loading state until everything is properly resolved
  const shouldShowLoading =
    isLoading ||
    !authCheckComplete ||
    isRedirecting ||
    currentStep !== "" ||
    (authCheckComplete && !user) ||
    (authCheckComplete && user && user.is_admin && !isRedirecting);

  if (shouldShowLoading) {
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
              {currentStep || "Verifying authentication..."}
            </p>
            <p className="text-xs text-gray-500 mt-1">Please wait a moment</p>
          </div>
        </div>
      </div>
    );
  }

  // Check role-based access for authenticated users (only after auth check is complete)
  if (authCheckComplete && requiredRole && user?.role !== requiredRole) {
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

  // Final check: if we've completed all checks and user should not have access, show error
  if (authCheckComplete && user && (!user.is_verified || user.is_admin)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg">
          <div className="mb-6">
            <svg
              className="mx-auto h-20 w-20 text-yellow-500"
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
            {!user?.is_verified ? "Account Not Verified" : "Wrong Access Level"}
          </h2>
          <p className="text-gray-600 mb-6">
            {!user?.is_verified
              ? "Your account needs to be verified to access this page."
              : "This page is for regular users only. You will be redirected to the appropriate dashboard."}
          </p>
          <button
            onClick={() =>
              router.replace(user?.is_admin ? "/admin/dashboard" : "/login")
            }
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            {user?.is_admin ? "Go to Admin Dashboard" : "Go to Login"}
          </button>
        </div>
      </div>
    );
  }

  // SUCCESS: Only render children if user is authenticated, verified, non-admin, and has required role (if any)
  return <>{children}</>;
};

export default ProtectedRoute;
