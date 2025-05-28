// utils/api.ts
import { apiClient } from "./axiosInterceptors";
import { User, AuthTokens, LoginRequest } from "@/types/auth";
import { SessionManager } from "./sessionManager";

// Admin APIs
export const adminApi = {
  getUsers: () => apiClient.get("/admin/users/"),
  getUser: (id: number) => apiClient.get(`/admin/users/${id}/`),
  updateUser: (id: number, data: Partial<User>) =>
    apiClient.put(`/admin/users/${id}/`, data),
  deleteUser: (id: number) => apiClient.delete(`/admin/users/${id}/`),
  getDashboardStats: () => apiClient.get("/admin/dashboard/stats/"),
};

// Auth APIs
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<AuthTokens>("/auth/login/", { email, password }),
  refresh: (refreshToken?: string) => {
    const token = refreshToken || SessionManager.getRefreshToken();
    if (!token) throw new Error("No refresh token available");
    return apiClient.post<AuthTokens>("/auth/refresh/", { refresh: token });
  },
  logout: () => apiClient.post("/auth/logout/"),
  forgotPassword: (email: string) =>
    apiClient.post("/auth/forgot-password/", { email }),
  resetPassword: (token: string, password: string) =>
    apiClient.post("/auth/reset-password/", { token, password }),
  verifyEmail: (token: string) =>
    apiClient.post("/auth/verify-email/", { token }),
  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.post("/auth/change-password/", {
      current_password: currentPassword,
      new_password: newPassword,
    }),
};

// Cookie Management APIs
export const cookieManagementApi = {
  getCookie: (id: string) => apiClient.get(`/cookie_management/cookies/${id}/`),
  getCookies: (params?: any) =>
    apiClient.get("/cookie_management/cookies/", { params }),
  addLoginService: (data: any) =>
    apiClient.post("/cookie_management/login_services/add/", data),
  getLoginServices: () => apiClient.get("/cookie_management/login_services/"),
  updateLoginService: (id: string, data: any) =>
    apiClient.put(`/cookie_management/login_services/${id}/`, data),
  deleteLoginService: (id: string) =>
    apiClient.delete(`/cookie_management/login_services/${id}/`),
};

// Payment APIs
export const paymentApi = {
  createPayment: (data: any) =>
    apiClient.post("/payment/payments/create/", data),
  getPayments: (params?: any) =>
    apiClient.get("/payment/payments/", { params }),
  getPayment: (id: string) => apiClient.get(`/payment/payments/${id}/`),
  updatePayment: (id: string, data: any) =>
    apiClient.put(`/payment/payments/${id}/`, data),
  cancelPayment: (id: string) =>
    apiClient.post(`/payment/payments/${id}/cancel/`),
  refundPayment: (id: string, amount?: number) =>
    apiClient.post(`/payment/payments/${id}/refund/`, { amount }),
  getPaymentMethods: () => apiClient.get("/payment/methods/"),
  addPaymentMethod: (data: any) => apiClient.post("/payment/methods/", data),
  deletePaymentMethod: (id: string) =>
    apiClient.delete(`/payment/methods/${id}/`),
};

// Profile APIs
export const profileApi = {
  getProfile: () => apiClient.get<User>("/profile/"),
  updateProfile: (data: Partial<User>) => apiClient.put("/profile/", data),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return apiClient.post("/profile/avatar/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  deleteAvatar: () => apiClient.delete("/profile/avatar/"),
  getSettings: () => apiClient.get("/profile/settings/"),
  updateSettings: (data: any) => apiClient.put("/profile/settings/", data),
  getActivityLog: (params?: any) =>
    apiClient.get("/profile/activity/", { params }),
};

// Register APIs
export const registerApi = {
  register: (data: any) => apiClient.post("/register/", data),
  checkEmail: (email: string) =>
    apiClient.post("/register/check-email/", { email }),
  checkUsername: (username: string) =>
    apiClient.post("/register/check-username/", { username }),
};

// Service APIs
export const serviceApi = {
  getServices: (params?: any) =>
    apiClient.get("/service/services/", { params }),
  getService: (id: number) => apiClient.get(`/service/services/${id}/`),
  createService: (data: any) => apiClient.post("/service/services/", data),
  updateService: (id: number, data: any) =>
    apiClient.put(`/service/services/${id}/`, data),
  deleteService: (id: number) => apiClient.delete(`/service/services/${id}/`),
  getUserServices: (params?: any) =>
    apiClient.get("/service/user-services/", { params }),
  getServiceStats: (id: number) =>
    apiClient.get(`/service/services/${id}/stats/`),
  toggleServiceStatus: (id: number) =>
    apiClient.post(`/service/services/${id}/toggle-status/`),
};

// Subscription APIs
export const subscriptionApi = {
  getSubscriptions: (params?: any) =>
    apiClient.get("/subscription/subscriptions/", { params }),
  getSubscription: (id: number) =>
    apiClient.get(`/subscription/subscriptions/${id}/`),
  purchaseSubscription: (data: any) =>
    apiClient.post("/subscription/subscriptions/purchase/", data),
  cancelSubscription: (id: number, reason?: string) =>
    apiClient.post(`/subscription/subscriptions/${id}/cancel/`, { reason }),
  renewSubscription: (id: number) =>
    apiClient.post(`/subscription/subscriptions/${id}/renew/`),
  upgradeSubscription: (id: number, newPlanId: number) =>
    apiClient.post(`/subscription/subscriptions/${id}/upgrade/`, {
      new_plan_id: newPlanId,
    }),
  downgradeSubscription: (id: number, newPlanId: number) =>
    apiClient.post(`/subscription/subscriptions/${id}/downgrade/`, {
      new_plan_id: newPlanId,
    }),
  getSubscriptionHistory: (params?: any) =>
    apiClient.get("/subscription/history/", { params }),
  getPlans: () => apiClient.get("/subscription/plans/"),
  getPlan: (id: number) => apiClient.get(`/subscription/plans/${id}/`),
};

// Notification APIs
export const notificationApi = {
  getNotifications: (params?: any) =>
    apiClient.get("/notifications/", { params }),
  markAsRead: (id: number) => apiClient.post(`/notifications/${id}/read/`),
  markAllAsRead: () => apiClient.post("/notifications/mark-all-read/"),
  deleteNotification: (id: number) => apiClient.delete(`/notifications/${id}/`),
  getUnreadCount: () => apiClient.get("/notifications/unread-count/"),
  updatePreferences: (data: any) =>
    apiClient.put("/notifications/preferences/", data),
};

// File Upload APIs
export const fileApi = {
  uploadFile: (file: File, folder?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (folder) formData.append("folder", folder);

    return apiClient.post("/files/upload/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      // Cast config to any to allow onUploadProgress, or import AxiosRequestConfig and use it as the type
      onUploadProgress: (progressEvent: ProgressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        console.log(`Upload Progress: ${percentCompleted}%`);
      },
    } as any);
  },

  deleteFile: (id: string) => apiClient.delete(`/files/${id}/`),

  getFile: (id: string) => apiClient.get(`/files/${id}/`),

  getFiles: (params?: any) => apiClient.get("/files/", { params }),
};

// Analytics APIs
export const analyticsApi = {
  getDashboardData: (timeRange?: string) =>
    apiClient.get("/analytics/dashboard/", {
      params: timeRange ? { time_range: timeRange } : {},
    }),
  getUserAnalytics: (params?: any) =>
    apiClient.get("/analytics/users/", { params }),
  getServiceAnalytics: (serviceId?: number, params?: any) =>
    apiClient.get(`/analytics/services/${serviceId || ""}`, { params }),
  getRevenueAnalytics: (params?: any) =>
    apiClient.get("/analytics/revenue/", { params }),
  exportData: (type: string, params?: any) =>
    apiClient.get(`/analytics/export/${type}/`, {
      params,
      responseType: "blob",
    }),
};

// Generic API utilities
export const apiUtils = {
  // Generic CRUD operations
  getList: <T>(endpoint: string, params?: any) =>
    apiClient.get<T[]>(endpoint, { params }),

  getById: <T>(endpoint: string, id: number | string) =>
    apiClient.get<T>(`${endpoint}/${id}/`),

  create: <T>(endpoint: string, data: any) => apiClient.post<T>(endpoint, data),

  update: <T>(endpoint: string, id: number | string, data: any) =>
    apiClient.put<T>(`${endpoint}/${id}/`, data),

  patch: <T>(endpoint: string, id: number | string, data: any) =>
    apiClient.patch<T>(`${endpoint}/${id}/`, data),

  delete: (endpoint: string, id: number | string) =>
    apiClient.delete(`${endpoint}/${id}/`),

  // Bulk operations
  bulkCreate: <T>(endpoint: string, data: any[]) =>
    apiClient.post<T[]>(`${endpoint}/bulk/`, { items: data }),

  bulkUpdate: <T>(endpoint: string, data: any[]) =>
    apiClient.put<T[]>(`${endpoint}/bulk/`, { items: data }),

  bulkDelete: (endpoint: string, ids: (number | string)[]) =>
    apiClient.delete(`${endpoint}/bulk/`, { data: { ids } } as any),
};

// Export all APIs
export const api = {
  admin: adminApi,
  auth: authApi,
  cookieManagement: cookieManagementApi,
  payment: paymentApi,
  profile: profileApi,
  register: registerApi,
  service: serviceApi,
  subscription: subscriptionApi,
  notification: notificationApi,
  file: fileApi,
  analytics: analyticsApi,
  utils: apiUtils,
};

export default api;
