// hooks/useAuth.ts
export { useAuth } from "../context/AuthContext";

// hooks/useApi.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryClient";
import * as api from "../utils/api";

// Generic API hook factory
export function useApiQuery<TData = any>(
  queryKey: any[],
  queryFn: () => Promise<{ data: TData }>,
  options?: any
) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await queryFn();
      return response.data;
    },
    ...options,
  });
}

export function useApiMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<{ data: TData }>,
  options?: any
) {
  return useMutation({
    mutationFn: async (variables: TVariables) => {
      const response = await mutationFn(variables);
      return response.data;
    },
    ...options,
  });
}

// Specific API hooks
export const useServices = (options?: any) => {
  return useApiQuery(queryKeys.services, api.serviceApi.getServices, options);
};

export const useUserServices = (options?: any) => {
  return useApiQuery(queryKeys.userServices(), api.serviceApi.getUserServices, {
    enabled: true, // Only enabled when authenticated
    ...options,
  });
};

export const useSubscriptions = (options?: any) => {
  return useApiQuery(
    queryKeys.subscriptions,
    api.subscriptionApi.getSubscriptions,
    options
  );
};

export const useAdminUsers = (options?: any) => {
  return useApiQuery(queryKeys.adminUsers(), api.adminApi.getUsers, options);
};

export const useCookie = (id: string, options?: any) => {
  return useApiQuery(
    queryKeys.cookie(id),
    () => api.cookieManagementApi.getCookie(id),
    {
      enabled: !!id,
      ...options,
    }
  );
};

// Mutation hooks
export const useCreateService = (options?: any) => {
  const queryClient = useQueryClient();

  return useApiMutation(api.serviceApi.createService, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services });
      queryClient.invalidateQueries({ queryKey: queryKeys.userServices() });
    },
    ...options,
  });
};

export const usePurchaseSubscription = (options?: any) => {
  const queryClient = useQueryClient();

  return useApiMutation(api.subscriptionApi.purchaseSubscription, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions });
      queryClient.invalidateQueries({ queryKey: queryKeys.userServices() });
    },
    ...options,
  });
};

export const useCreatePayment = (options?: any) => {
  const queryClient = useQueryClient();

  return useApiMutation(api.paymentApi.createPayment, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments });
    },
    ...options,
  });
};

export const useAddLoginService = (options?: any) => {
  const queryClient = useQueryClient();

  return useApiMutation(api.cookieManagementApi.addLoginService, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loginServices() });
    },
    ...options,
  });
};

// hooks/useSession.ts
import { useState, useEffect } from "react";
import { sessionManager } from "../utils/sessionManager";

export const useSession = () => {
  const [sessionInfo, setSessionInfo] = useState(
    sessionManager.getSessionInfo()
  );

  useEffect(() => {
    const updateSessionInfo = () => {
      setSessionInfo(sessionManager.getSessionInfo());
    };

    // Update session info periodically
    const interval = setInterval(updateSessionInfo, 30000); // Every 30 seconds

    // Listen for session changes
    const handleStorageChange = () => updateSessionInfo();
    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return {
    sessionInfo,
    isValid: sessionInfo?.isValid ?? false,
    shouldRefresh: sessionInfo?.shouldRefresh ?? false,
    timeUntilExpiry: sessionInfo?.timeUntilExpiry ?? 0,
    user: sessionInfo?.user ?? null,
  };
};

// hooks/useLocalStorage.ts (for non-auth data)
import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  const removeValue = () => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage key "${key}":`, error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue] as const;
}

// hooks/useDebounce.ts
import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// hooks/useOnlineStatus.ts
import { useState, useEffect } from "react";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

// hooks/usePrevious.ts
import { useRef, useEffect } from "react";

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}
