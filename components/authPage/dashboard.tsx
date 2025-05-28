// pages/dashboard.tsx - Example dashboard using the API hooks
"use client";

import React from "react";
import { useAuth } from "../../context/AuthContext";

const DashboardPage: React.FC = () => {
  const { state, logout } = useAuth();
  const { user } = state;

  const handleLogout = async () => {
    await logout();
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">
                Welcome back, {user.username}!
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-6">
        <h2 className="text-2xl font-semibold mb-4">Your Dashboard Content</h2>
        {/* Add more dashboard content here */}
      </main>
    </div>
  );
};

export default DashboardPage;
