// hooks/useApi.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryClient";
import * as api from "../utils/api";

// Generic API hook factory
export function useApiQuery<TData = any>(
  queryKey: readonly any[],
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
  return useApiQuery(
    queryKeys.services,
    async () => {
      const response = await api.serviceApi.getServices();
      return { data: response.data };
    },
    options
  );
};

export const useUserServices = (options?: any) => {
  return useApiQuery(
    queryKeys.userServices(),
    async () => {
      const response = await api.serviceApi.getUserServices();
      return { data: response.data };
    },
    {
      enabled: true, // Only enabled when authenticated
      ...options,
    }
  );
};

export const useSubscriptions = (options?: any) => {
  return useApiQuery(
    queryKeys.subscriptions,
    async () => {
      const response = await api.subscriptionApi.getSubscriptions();
      return { data: response.data };
    },
    options
  );
};

export const useAdminUsers = (options?: any) => {
  return useApiQuery(
    queryKeys.adminUsers(),
    async () => {
      const response = await api.adminApi.getUsers();
      return { data: response.data };
    },
    options
  );
};

export const useCookie = (id: string, options?: any) => {
  return useApiQuery(
    queryKeys.cookie(id),
    () =>
      new Promise<{ data: unknown }>((resolve, reject) => {
        api.cookieManagementApi
          .getCookie(id)
          .then((response: any) => resolve({ data: response.data }))
          .catch(reject);
      }),
    {
      enabled: !!id,
      ...options,
    }
  );
};

// Mutation hooks
export const useCreateService = (options?: any) => {
  const queryClient = useQueryClient();

  return useApiMutation(
    async (variables: any) => {
      const response = await api.serviceApi.createService(variables);
      return { data: response.data };
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.services });
        queryClient.invalidateQueries({ queryKey: queryKeys.userServices() });
      },
      ...options,
    }
  );
};

export const usePurchaseSubscription = (options?: any) => {
  const queryClient = useQueryClient();

  return useApiMutation(
    async (variables: any) => {
      const response = await api.subscriptionApi.purchaseSubscription(
        variables
      );
      return { data: response.data };
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions });
        queryClient.invalidateQueries({ queryKey: queryKeys.userServices() });
      },
      ...options,
    }
  );
};

export const useCreatePayment = (options?: any) => {
  const queryClient = useQueryClient();

  return useApiMutation(
    async (variables: any) => {
      const response = await api.paymentApi.createPayment(variables);
      return { data: response.data };
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.payments });
      },
      ...options,
    }
  );
};

export const useAddLoginService = (options?: any) => {
  const queryClient = useQueryClient();

  return useApiMutation(
    async (variables: any) => {
      const response = await api.cookieManagementApi.addLoginService(variables);
      return { data: response.data };
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.loginServices() });
      },
      ...options,
    }
  );
};
