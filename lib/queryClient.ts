// lib/queryClient.ts
import {
  QueryClient,
  DefaultOptions,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { SessionManager } from "../utils/sessionManager";

// Default query options
const defaultQueryOptions: DefaultOptions = {
  queries: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  },
  mutations: {
    retry: false,
    onError: (error: any) => {
      console.error("Mutation error:", error);
    },
  },
};

// Create query cache with global error handling
const queryCache = new QueryCache({
  onError: (error: any, query) => {
    console.error("Query error:", error, "Query key:", query.queryKey);

    // Handle auth errors globally
    if (error?.status === 401) {
      SessionManager.clearSession();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:session-expired"));
      }
    }
  },
});

// Create mutation cache with global error handling
const mutationCache = new MutationCache({
  onError: (error: any, variables, context, mutation) => {
    console.error("Mutation error:", error, "Variables:", variables);

    // Handle auth errors globally
    if (error?.status === 401) {
      SessionManager.clearSession();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:session-expired"));
      }
    }
  },
});

// Create and configure query client
export const queryClient = new QueryClient({
  queryCache,
  mutationCache,
  defaultOptions: defaultQueryOptions,
});

// Query invalidation utilities
export const queryInvalidation = {
  // Invalidate all user-related queries
  invalidateUserQueries: () => {
    queryClient.invalidateQueries({ queryKey: ["user"] });
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    queryClient.invalidateQueries({ queryKey: ["userServices"] });
  },

  // Invalidate specific query patterns
  invalidateByPattern: (pattern: string[]) => {
    queryClient.invalidateQueries({ queryKey: pattern });
  },

  // Clear all queries (useful on logout)
  clearAll: () => {
    queryClient.clear();
  },

  // Remove specific queries
  removeQueries: (pattern: string[]) => {
    queryClient.removeQueries({ queryKey: pattern });
  },
};

// Query key factory for consistency
export const queryKeys = {
  // Auth related
  auth: ["auth"] as const,
  profile: () => [...queryKeys.auth, "profile"] as const,

  // User related
  users: ["users"] as const,
  user: (id: number) => [...queryKeys.users, id] as const,
  userServices: () => ["userServices"] as const,

  // Services
  services: ["services"] as const,
  service: (id: number) => [...queryKeys.services, id] as const,

  // Subscriptions
  subscriptions: ["subscriptions"] as const,
  subscription: (id: number) => [...queryKeys.subscriptions, id] as const,

  // Payments
  payments: ["payments"] as const,
  payment: (id: number) => [...queryKeys.payments, id] as const,

  // Admin
  admin: ["admin"] as const,
  adminUsers: () => [...queryKeys.admin, "users"] as const,

  // Cookie Management
  cookies: ["cookies"] as const,
  cookie: (id: string) => [...queryKeys.cookies, id] as const,
  loginServices: () => ["loginServices"] as const,
} as const;

// Prefetch utilities
export const prefetchQueries = {
  profile: async () => {
    if (SessionManager.isSessionValid()) {
      await queryClient.prefetchQuery({
        queryKey: queryKeys.profile(),
        queryFn: async () => {
          const { profileApi } = await import("../utils/api");
          const response = await profileApi.getProfile();
          return response.data;
        },
      });
    }
  },

  services: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.services,
      queryFn: async () => {
        const { serviceApi } = await import("../utils/api");
        const response = await serviceApi.getServices();
        return response.data;
      },
    });
  },
};

// Optimistic update utilities
export const optimisticUpdates = {
  updateProfile: (newData: any) => {
    queryClient.setQueryData(queryKeys.profile(), (old: any) => ({
      ...old,
      ...newData,
    }));
  },

  addService: (newService: any) => {
    queryClient.setQueryData(queryKeys.services, (old: any[]) =>
      old ? [...old, newService] : [newService]
    );
  },

  removeService: (serviceId: number) => {
    queryClient.setQueryData(queryKeys.services, (old: any[]) =>
      old ? old.filter((service) => service.id !== serviceId) : []
    );
  },
};

export default queryClient;
