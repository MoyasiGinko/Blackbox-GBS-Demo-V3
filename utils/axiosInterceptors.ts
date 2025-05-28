// utils/axiosInterceptors.ts
import axios from "axios";
import { SessionManager } from "./sessionManager";
import { AuthTokens } from "../types/auth";

// Manual type definitions for Axios (compatible with version 1.9.0)
export interface AxiosRequestConfig {
  url?: string;
  method?: string;
  baseURL?: string;
  headers?: Record<string, string>;
  params?: any;
  data?: any;
  timeout?: number;
  withCredentials?: boolean;
  metadata?: {
    startTime?: number;
    [key: string]: any;
  };
  _retry?: boolean;
  [key: string]: any;
}

export interface AxiosResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
  config: AxiosRequestConfig;
  request?: any;
}

export interface AxiosError<T = any> {
  config?: AxiosRequestConfig;
  code?: string;
  request?: any;
  response?: AxiosResponse<T>;
  isAxiosError: boolean;
  message: string;
  name: string;
  stack?: string;
}

// Use the actual Axios instance type and extend it if needed
export type AxiosInstance = typeof axios & {
  interceptors: {
    request: AxiosInterceptorManager<AxiosRequestConfig>;
    response: AxiosInterceptorManager<AxiosResponse>;
  };
};

export interface AxiosInterceptorManager<V> {
  use<T = V>(
    onFulfilled?: (value: V) => T | Promise<T>,
    onRejected?: (error: any) => any
  ): number;
  eject(id: number): void;
}

interface QueuedRequest {
  resolve: (token: string) => void;
  reject: (error: any) => void;
}

class AxiosInterceptorManagerClass {
  private isRefreshing = false;
  private failedQueue: QueuedRequest[] = [];

  setupInterceptors(apiClient: any): void {
    this.setupRequestInterceptor(apiClient);
    this.setupResponseInterceptor(apiClient);
  }

  private setupRequestInterceptor(apiClient: AxiosInstance): void {
    apiClient.interceptors.request.use(
      async (config: AxiosRequestConfig) => {
        // Skip auth for certain endpoints
        if (this.shouldSkipAuth(config.url || "")) {
          return config;
        }

        const token = SessionManager.getAccessToken();

        if (token) {
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`,
          };
        }

        // Add request timestamp for monitoring
        config.metadata = {
          ...config.metadata,
          startTime: Date.now(),
        };

        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(this.transformError(error));
      }
    );
  }

  private setupResponseInterceptor(apiClient: AxiosInstance): void {
    apiClient.interceptors.response.use(
      (response: AxiosResponse) => {
        // Add response time for monitoring
        const requestStartTime = response.config.metadata?.startTime;
        if (requestStartTime) {
          const responseTime = Date.now() - requestStartTime;
          console.debug(
            `API Response Time: ${responseTime}ms for ${response.config.url}`
          );
        }

        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        // Handle 401 errors (Unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.shouldSkipAuth(originalRequest.url || "")) {
            return Promise.reject(this.transformError(error));
          }

          originalRequest._retry = true;

          if (this.isRefreshing) {
            // If already refreshing, queue this request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then((token) => {
              originalRequest.headers = {
                ...originalRequest.headers,
                Authorization: `Bearer ${token}`,
              };
              // Ensure url is a string to satisfy Axios type requirements
              if (!originalRequest.url) {
                throw new Error("Request config is missing a URL.");
              }
              return apiClient({
                ...originalRequest,
                url: originalRequest.url,
              });
            });
          }

          this.isRefreshing = true;

          try {
            const refreshToken = SessionManager.getRefreshToken();

            if (!refreshToken) {
              throw new Error("No refresh token available");
            }

            // Attempt to refresh the token
            const response = await this.refreshAccessToken(
              apiClient,
              refreshToken
            );
            const newTokens: AuthTokens = response.data;

            // Update session with new tokens
            SessionManager.updateTokens(newTokens);

            // Process queued requests
            this.processQueue(null, newTokens.access_token);

            // Retry original request with new token
            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${newTokens.access_token}`,
            };

            // Ensure url is a string to satisfy Axios type requirements
            if (!originalRequest.url) {
              throw new Error("Request config is missing a URL.");
            }
            return apiClient({ ...originalRequest, url: originalRequest.url });
          } catch (refreshError) {
            // Refresh failed, clear session and redirect to login
            this.processQueue(refreshError, null);
            SessionManager.clearSession();

            // Emit event for auth failure (can be caught by auth context)
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("auth:session-expired"));
            }

            return Promise.reject(this.transformError(error));
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(this.transformError(error));
      }
    );
  }
  private async refreshAccessToken(
    apiClient: AxiosInstance,
    refreshToken: string
  ): Promise<AxiosResponse> {
    // Make a direct call without going through interceptors again
    return axios.post(
      `${apiClient.defaults.baseURL}/auth/refresh/`,
      { refresh: refreshToken }, // Use 'refresh' instead of 'refresh_token'
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );
  }

  private processQueue(error: any, token: string | null): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else if (token) {
        resolve(token);
      }
    });

    this.failedQueue = [];
  }

  private shouldSkipAuth(url: string): boolean {
    const skipAuthUrls = [
      "/auth/login/",
      "/auth/register/",
      "/auth/refresh/",
      "/auth/forgot-password/",
      "/auth/reset-password/",
    ];

    return skipAuthUrls.some((skipUrl) => url.includes(skipUrl));
  }

  private transformError(error: AxiosError): any {
    const transformedError = {
      message: error.message,
      status: error.response?.status || 0,
      code: error.code,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
    };

    // Log error for monitoring
    console.error("API Error:", transformedError);

    return transformedError;
  }
}

// Create and export interceptor manager instance
export const interceptorManager = new AxiosInterceptorManagerClass();

// Enhanced API client factory
export const createApiClient = (
  baseURL: string,
  options: AxiosRequestConfig = {}
): AxiosInstance => {
  const apiClient = axios.create({
    baseURL,
    timeout: 30000, // 30 seconds
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  }) as AxiosInstance;

  // Setup interceptors
  interceptorManager.setupInterceptors(apiClient);

  return apiClient;
};

// Default API client (backwards compatible with existing code)
export const apiClient = createApiClient(
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api"
);

export default apiClient;
