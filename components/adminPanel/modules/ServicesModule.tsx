// components/adminPanel/modules/ServicesModule.tsx
"use client";
import React, { useState, useEffect } from "react";
import { serviceApi } from "@/utils/api";
import { useNotifications } from "@/context/NotificationContext";

// Service interface matching your API schema
interface Service {
  id: number;
  name: string;
  display_name: string;
  login_url: string;
  description: string;
  logo_url?: string | null;
  category: string;
  is_active: boolean;
}

// Category options - update these based on your API
const CATEGORY_OPTIONS = [
  "AI Chat",
  "AI Image",
  "SEO Tools",
  "Analytics",
  "Other",
];

const ServicesModule: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const { addNotification } = useNotifications();

  const [newService, setNewService] = useState<Omit<Service, "id">>({
    name: "",
    display_name: "",
    login_url: "",
    description: "",
    logo_url: "",
    category: "",
    is_active: true,
  });

  // Fetch services from API
  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await serviceApi.getServices();
      setServices(response.data as Service[]);
    } catch (error: any) {
      addNotification({
        type: "error",
        title: "Error fetching services",
        message: error.response?.data?.detail || "Failed to load services",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const newValue =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    if (editingService) {
      setEditingService({
        ...editingService,
        [name]: newValue,
      });
    } else {
      setNewService({
        ...newService,
        [name]: newValue,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const serviceData = editingService || newService;

    // Validate required fields
    if (
      !serviceData.name.trim() ||
      !serviceData.display_name.trim() ||
      !serviceData.login_url.trim() ||
      !serviceData.description.trim() ||
      !serviceData.category.trim()
    ) {
      addNotification({
        type: "error",
        title: "Validation Error",
        message: "Please fill in all required fields",
      });
      return;
    }

    // Validate URL format
    try {
      new URL(serviceData.login_url);
    } catch {
      addNotification({
        type: "error",
        title: "Validation Error",
        message: "Please enter a valid URL for login URL",
      });
      return;
    }

    try {
      setIsCreating(true);

      if (editingService) {
        // Update existing service
        await serviceApi.updateService(editingService.id, serviceData);
        addNotification({
          type: "success",
          title: "Service Updated",
          message: "Service has been updated successfully",
        });
        setEditingService(null);
      } else {
        // Create new service
        await serviceApi.createService(serviceData);
        addNotification({
          type: "success",
          title: "Service Created",
          message: "Service has been created successfully",
        });

        // Reset form
        setNewService({
          name: "",
          display_name: "",
          login_url: "",
          description: "",
          logo_url: "",
          category: "",
          is_active: true,
        });
      }

      // Refresh services list
      fetchServices();
    } catch (error: any) {
      addNotification({
        type: "error",
        title: editingService
          ? "Error updating service"
          : "Error creating service",
        message:
          error.response?.data?.detail ||
          `Failed to ${editingService ? "update" : "create"} service`,
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteService = async (id: number) => {
    if (!confirm("Are you sure you want to delete this service?")) {
      return;
    }

    try {
      await serviceApi.deleteService(id);
      addNotification({
        type: "success",
        title: "Service Deleted",
        message: "Service has been deleted successfully",
      });
      fetchServices();
    } catch (error: any) {
      addNotification({
        type: "error",
        title: "Error deleting service",
        message: error.response?.data?.detail || "Failed to delete service",
      });
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await serviceApi.toggleServiceStatus(id);
      addNotification({
        type: "success",
        title: "Status Updated",
        message: "Service status has been updated",
      });
      fetchServices();
    } catch (error: any) {
      addNotification({
        type: "error",
        title: "Error updating status",
        message:
          error.response?.data?.detail || "Failed to update service status",
      });
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
  };

  const handleCancelEdit = () => {
    setEditingService(null);
  };

  const currentService = editingService || newService;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Services Management</h2>

      {/* Create/Edit Service Form */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-3">
          {editingService ? "Edit Service" : "Create New Service"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Service Name *
              </label>
              <input
                type="text"
                name="name"
                value={currentService.name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
                placeholder="e.g. netflix"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Display Name *
              </label>
              <input
                type="text"
                name="display_name"
                value={currentService.display_name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
                placeholder="e.g. Netflix"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Login URL *
              </label>
              <input
                type="url"
                name="login_url"
                value={currentService.login_url}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
                placeholder="https://www.netflix.com/login"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category *
              </label>
              <select
                name="category"
                value={currentService.category}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="">Select a category</option>
                {CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Logo URL
              </label>
              <input
                type="url"
                name="logo_url"
                value={currentService.logo_url || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={currentService.is_active}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">Active</label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description *
            </label>
            <textarea
              name="description"
              rows={3}
              value={currentService.description}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
              placeholder="Brief description of the service"
            />
          </div>

          <div className="flex justify-end space-x-2">
            {editingService && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isCreating}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isCreating
                ? "Saving..."
                : editingService
                ? "Update Service"
                : "Add Service"}
            </button>
          </div>
        </form>
      </div>

      {/* Services List */}
      <div className="bg-white rounded-lg shadow">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Services List</h3>
          <div className="text-sm text-gray-500">
            {services.length} service{services.length !== 1 ? "s" : ""} total
          </div>
        </div>

        {loading ? (
          <div className="p-4 text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-sm text-gray-500">Loading services...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Service
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Category
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Login URL
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Description
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {services.length > 0 ? (
                  services.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {service.logo_url && (
                            <img
                              className="h-8 w-8 rounded-full mr-3"
                              src={service.logo_url}
                              alt={service.display_name}
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {service.display_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {service.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {service.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a
                          href={service.login_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-900 text-sm"
                        >
                          {service.login_url.length > 30
                            ? `${service.login_url.substring(0, 30)}...`
                            : service.login_url}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(service.id)}
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            service.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {service.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {service.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditService(service)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteService(service.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No services found. Create your first service above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesModule;
