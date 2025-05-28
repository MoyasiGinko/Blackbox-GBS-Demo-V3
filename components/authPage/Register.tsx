// components/authPage/Register.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { registerApi } from "../../utils/api";
import { useNotifications } from "../../context/NotificationContext";

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    password: "",
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.email) errors.email = "Email is required";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) errors.email = "Invalid email";
    if (!formData.full_name) errors.full_name = "Full name is required";
    if (!formData.password) errors.password = "Password is required";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await registerApi.register(formData);
      addNotification({
        type: "success",
        title: "Registration Successful",
        message: "You can now log in with your credentials.",
      });
      router.replace("/login");
    } catch (error: any) {
      addNotification({
        type: "error",
        title: "Registration Failed",
        message: error?.response?.data?.detail || error.message || "Please check your input.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
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
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${validationErrors.email ? "border-red-300" : "border-gray-300"}`}
                placeholder="Enter your email"
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                Full name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                value={formData.full_name}
                onChange={handleChange}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${validationErrors.full_name ? "border-red-300" : "border-gray-300"}`}
                placeholder="Enter your full name"
              />
              {validationErrors.full_name && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.full_name}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${validationErrors.password ? "border-red-300" : "border-gray-300"}`}
                placeholder="Enter your password"
              />
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
              )}
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Registering..." : "Register"}
          </button>
        </form>
        <div className="text-center text-sm mt-4">
          Already have an account?{' '}
          <button
            type="button"
            className="text-indigo-600 hover:underline"
            onClick={() => router.replace("/login")}
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
