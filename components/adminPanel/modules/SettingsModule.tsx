// components/adminPanel/modules/SettingsModule.tsx
"use client";
import React, { useState } from "react";
import { useNotifications } from "@/context/NotificationContext";

interface SystemSettings {
  site_name: string;
  admin_email: string;
  max_users_per_service: number;
  session_timeout: number;
  enable_registration: boolean;
  require_email_verification: boolean;
  maintenance_mode: boolean;
  max_file_upload_size: number;
  allowed_file_types: string[];
}

const SettingsModule: React.FC = () => {
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const [settings, setSettings] = useState<SystemSettings>({
    site_name: "Blackbox GBS",
    admin_email: "admin@blackboxgbs.com",
    max_users_per_service: 1000,
    session_timeout: 24,
    enable_registration: true,
    require_email_verification: true,
    maintenance_mode: false,
    max_file_upload_size: 10,
    allowed_file_types: ["jpg", "jpeg", "png", "pdf", "doc", "docx"],
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
          ? Number(value)
          : value,
    }));
  };

  const handleArrayChange = (name: string, value: string) => {
    const array = value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item);
    setSettings((prev) => ({
      ...prev,
      [name]: array,
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      addNotification({
        type: "success",
        title: "Settings Saved",
        message: "System settings have been updated successfully",
      });
    } catch (error) {
      addNotification({
        type: "error",
        title: "Error saving settings",
        message: "Failed to update system settings",
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "general", name: "General", icon: "⚙️" },
    { id: "security", name: "Security", icon: "🔒" },
    { id: "email", name: "Email", icon: "📧" },
    { id: "uploads", name: "File Uploads", icon: "📁" },
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
        <button
          onClick={handleSaveSettings}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "general" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                General Settings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Name
                  </label>
                  <input
                    type="text"
                    name="site_name"
                    value={settings.site_name}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Users Per Service
                  </label>
                  <input
                    type="number"
                    name="max_users_per_service"
                    value={settings.max_users_per_service}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout (hours)
                  </label>
                  <input
                    type="number"
                    name="session_timeout"
                    value={settings.session_timeout}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="maintenance_mode"
                    checked={settings.maintenance_mode}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Enable Maintenance Mode
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Security Settings
              </h3>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="enable_registration"
                    checked={settings.enable_registration}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Enable User Registration
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="require_email_verification"
                    checked={settings.require_email_verification}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Require Email Verification
                  </label>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-yellow-800">
                  Security Notice
                </h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Changes to security settings will affect all users. Please
                  ensure you understand the implications before making changes.
                </p>
              </div>
            </div>
          )}

          {activeTab === "email" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Email Settings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    name="admin_email"
                    value={settings.admin_email}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This email will receive system notifications and alerts.
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-blue-800">
                  Email Configuration
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  Configure SMTP settings in your environment variables for
                  email functionality.
                </p>
              </div>
            </div>
          )}

          {activeTab === "uploads" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                File Upload Settings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max File Size (MB)
                  </label>
                  <input
                    type="number"
                    name="max_file_upload_size"
                    value={settings.max_file_upload_size}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allowed File Types
                  </label>
                  <input
                    type="text"
                    value={settings.allowed_file_types.join(", ")}
                    onChange={(e) =>
                      handleArrayChange("allowed_file_types", e.target.value)
                    }
                    placeholder="jpg, png, pdf, doc"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate file extensions with commas.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-gray-800">
                  Current Settings
                </h4>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600">
                    Max file size:{" "}
                    <span className="font-medium">
                      {settings.max_file_upload_size} MB
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Allowed types:{" "}
                    <span className="font-medium">
                      {settings.allowed_file_types.join(", ")}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModule;
