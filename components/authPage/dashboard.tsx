// pages/dashboard.tsx - Example dashboard using the API hooks
("use client");

import React from "react";
import { useAuth } from "../hooks/useAuth";
import {
  useServices,
  useUserServices,
  useSubscriptions,
} from "../hooks/useApi";
import { useSession } from "../hooks/useSession";
import { formatUtils } from "../utils/format";

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { sessionInfo } = useSession();

  // Use API hooks
  const { data: services, isLoading: servicesLoading } = useServices();
  const { data: userServices, isLoading: userServicesLoading } =
    useUserServices();
  const { data: subscriptions, isLoading: subscriptionsLoading } =
    useSubscriptions();

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
              {/* Session Info */}
              {sessionInfo && (
                <div className="text-sm text-gray-500">
                  Session expires:{" "}
                  {formatUtils.formatDate(sessionInfo.expiresAt, "relative")}
                </div>
              )}

              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Services Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">S</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Available Services
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {servicesLoading ? "Loading..." : services?.length || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* User Services Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">U</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Your Services
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {userServicesLoading
                          ? "Loading..."
                          : userServices?.length || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscriptions Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">$</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Subscriptions
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {subscriptionsLoading
                          ? "Loading..."
                          : subscriptions?.length || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Recent Activity
                </h3>
                <div className="text-sm text-gray-500">
                  No recent activity to display.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
