// pages/login.tsx - Example login page using the new system
"use client";

import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { validateForm, loginSchema } from "../../utils/validation";
import { useRouter } from "next/navigation";

const LoginPage: React.FC = () => {
  const { state, login } = useAuth();
  const { addNotification } = useNotifications();
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validation = validateForm(loginSchema, formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setValidationErrors({});

    try {
      await login(formData);
      addNotification({
        type: "success",
        title: "Login Successful",
        message: "Welcome back!",
      });
      console.log("User successfully logged in, (wait) not redirecting...");
      // router.push("/dashboard");
    } catch (error: any) {
      addNotification({
        type: "error",
        title: "Login Failed",
        message: error.message || "Please check your credentials",
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (state.isAuthenticated) {
      console.log(
        "Checking if the context works, user is already authenticated, redirecting..."
      );
      // router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  validationErrors.email ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Enter your email"
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  validationErrors.password
                    ? "border-red-300"
                    : "border-gray-300"
                }`}
                placeholder="Enter your password"
              />
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.password}
                </p>
              )}
            </div>
          </div>

          {/* Error display removed because 'error' is not available from useAuth() */}

          <button
            type="submit"
            // disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

// Usage Examples:

// 1. Using in a page that requires authentication:
/*
export default function ServicesPage() {
  return (
    <ProtectedRoute>
      <ServicesPageContent />
    </ProtectedRoute>
  );
}
*/

// 2. Using in an admin page:
/*
export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminPageContent />
    </ProtectedRoute>
  );
}
*/

// 3. Using API hooks in components:
/*
function ServicesList() {
  const { data: services, isLoading, error } = useServices();
  const createServiceMutation = useCreateService({
    onSuccess: () => {
      // Handle success
    }
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {services?.map(service => (
        <div key={service.id}>{service.name}</div>
      ))}
      <button onClick={() => createServiceMutation.mutate(newServiceData)}>
        Create Service
      </button>
    </div>
  );
}
*/

// 4. Using notifications:
/*
function SomeComponent() {
  const { addNotification } = useNotifications();

  const handleAction = () => {
    addNotification({
      type: 'success',
      title: 'Action completed',
      message: 'The action was completed successfully',
      action: {
        label: 'View Details',
        onClick: () => router.push('/details')
      }
    });
  };
}
*/
