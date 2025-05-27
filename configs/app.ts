// config/app.ts
export const appConfig = {
  // API Configuration
  api: {
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api",
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  },

  // Session Configuration
  session: {
    tokenRefreshThreshold: 5, // minutes before expiry
    sessionTimeout: 60 * 24, // 24 hours in minutes
    maxRetries: 3,
    retryDelay: 1000,
  },

  // Query Configuration
  query: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retryAttempts: 3,
    retryDelay: 1000,
  },

  // Notification Configuration
  notifications: {
    defaultDuration: 5000,
    maxNotifications: 5,
    position: "top-right" as const,
  },

  // File Upload Configuration
  fileUpload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "text/csv",
      "application/json",
    ],
    maxFiles: 5,
  },

  // Pagination Configuration
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
    showSizeChanger: true,
    showQuickJumper: true,
  },

  // Theme Configuration
  theme: {
    defaultTheme: "system" as const,
    storageKey: "app-theme",
  },

  // Routes Configuration
  routes: {
    public: ["/login", "/register", "/forgot-password", "/reset-password"],
    protected: ["/dashboard", "/profile", "/services", "/subscriptions"],
    admin: ["/admin"],
    redirectAfterLogin: "/dashboard",
    redirectAfterLogout: "/login",
  },

  // Feature Flags
  features: {
    enableNotifications: true,
    enableThemeToggle: true,
    enableAnalytics: process.env.NODE_ENV === "production",
    enableDevTools: process.env.NODE_ENV === "development",
    enableOfflineMode: false,
  },
};

// utils/validation.ts
import { z } from "zod";

// Common validation schemas
export const emailSchema = z.string().email("Invalid email address");
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain at least one lowercase letter, one uppercase letter, and one number"
  );

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be less than 20 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      ),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  username: z.string().min(3).max(20),
  email: emailSchema,
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone number")
    .optional(),
});

// Validation utilities
export const validateForm = <T>(
  schema: z.ZodSchema<T>,
  data: any
): {
  isValid: boolean;
  errors: Record<string, string>;
  data?: T;
} => {
  try {
    const validatedData = schema.parse(data);
    return { isValid: true, errors: {}, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { general: "Validation failed" } };
  }
};

// utils/format.ts
export const formatUtils = {
  // Date formatting
  formatDate: (
    date: string | Date,
    format: "short" | "long" | "relative" = "short"
  ) => {
    const d = new Date(date);

    if (format === "relative") {
      const now = new Date();
      const diff = now.getTime() - d.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (days === 0) return "Today";
      if (days === 1) return "Yesterday";
      if (days < 7) return `${days} days ago`;
      if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
      if (days < 365) return `${Math.floor(days / 30)} months ago`;
      return `${Math.floor(days / 365)} years ago`;
    }

    return d.toLocaleDateString(
      "en-US",
      format === "long"
        ? { year: "numeric", month: "long", day: "numeric" }
        : { year: "numeric", month: "short", day: "numeric" }
    );
  },

  // Currency formatting
  formatCurrency: (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  },

  // Number formatting
  formatNumber: (num: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat("en-US", options).format(num);
  },

  // File size formatting
  formatFileSize: (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  },

  // Text formatting
  truncateText: (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  },

  // Phone number formatting
  formatPhoneNumber: (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  },
};

// utils/storage.ts
export const storageUtils = {
  // Safe localStorage operations
  setItem: (key: string, value: any) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  },

  getItem: <T>(key: string, defaultValue?: T): T | null => {
    try {
      if (typeof window !== "undefined") {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue || null;
      }
    } catch (error) {
      console.error("Error reading from localStorage:", error);
    }
    return defaultValue || null;
  },

  removeItem: (key: string) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error("Error removing from localStorage:", error);
    }
  },

  clear: () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.clear();
      }
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  },
};

// utils/url.ts
export const urlUtils = {
  // Build URL with query parameters
  buildUrl: (baseUrl: string, params: Record<string, any>) => {
    const url = new URL(baseUrl);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
    return url.toString();
  },

  // Parse query parameters
  parseQuery: (search: string) => {
    const params = new URLSearchParams(search);
    const result: Record<string, string> = {};
    for (const [key, value] of params) {
      result[key] = value;
    }
    return result;
  },

  // Get current URL parameters
  getCurrentParams: () => {
    if (typeof window !== "undefined") {
      return urlUtils.parseQuery(window.location.search);
    }
    return {};
  },
};

// utils/common.ts
export const commonUtils = {
  // Generate unique ID
  generateId: () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // Deep clone object
  deepClone: <T>(obj: T): T => {
    return JSON.parse(JSON.stringify(obj));
  },

  // Debounce function
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // Capitalize first letter
  capitalize: (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  // Check if object is empty
  isEmpty: (obj: any) => {
    return obj == null || Object.keys(obj).length === 0;
  },

  // Sleep function
  sleep: (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },
};

// Export all utilities
export const utils = {
  format: formatUtils,
  storage: storageUtils,
  url: urlUtils,
  common: commonUtils,
  validation: { validateForm, loginSchema, registerSchema, profileSchema },
};

export default utils;
