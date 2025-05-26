import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  withCredentials: true,
});

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post("/auth/login/", { email, password }),
  refresh: () => apiClient.post("/auth/refresh/"),
  register: (data: any) => apiClient.post("/auth/register/", data),
  getProfile: () => apiClient.get("/auth/profile/"),
};

export const serviceApi = {
  getServices: () => apiClient.get("/service/services/"),
  getUserServices: () => apiClient.get("/service/user-services/"),
};

export const subscriptionApi = {
  getSubscriptions: () => apiClient.get("/subscription/subscriptions/"),
  purchaseSubscription: (data: any) =>
    apiClient.post("/subscription/subscriptions/purchase/", data),
};

export const paymentApi = {
  createPayment: (data: any) =>
    apiClient.post("/payment/payments/create/", data),
};

export const cookieManagementApi = {
  addLoginService: (data: any) =>
    apiClient.post("/cookie_management/login_services/add/", data),
  getCookieData: (id: string) =>
    apiClient.get(`/cookie_management/cookies/${id}/`),
};
