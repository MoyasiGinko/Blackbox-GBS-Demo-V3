// context/AuthContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionManager } from "../utils/sessionManager";
import { queryKeys, queryInvalidation } from "../lib/queryClient";
import {
  User,
  AuthState,
  LoginRequest,
  AuthTokens,
  SessionData,
} from "../types/auth";
import { authApi, profileApi } from "../utils/api";

interface AuthContextType extends AuthState {
  // Authentication methods
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;

  // Session info
  getSessionInfo: () => any;

  // User methods
  updateProfile: (userData: Partial<User>) => Promise<void>;

  // State methods
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Profile query - only runs when authenticated
  const {
    data: profileData,
    error: profileError,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: queryKeys.profile(),
    queryFn: async () => {
      const response = await profileApi.getProfile();
      return response.data;
    },
    enabled: !!sessionManager.getAccessToken(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await authApi.login(
        credentials.email,
        credentials.password
      );
      return response.data;
    },
    onSuccess: async (data: AuthTokens) => {
      // Get user profile after successful login
      const profileResponse = await profileApi.getProfile();
      const user = profileResponse.data;

      // Create session data
      const sessionData: SessionData = {
        user,
        tokens: data,
        expiresAt: Date.now() + data.expires_in * 1000,
      };

      // Set session in manager
      sessionManager.setSession(sessionData);

      // Update auth state
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      // Invalidate and refetch user queries
      queryInvalidation.invalidateUserQueries();
    },
    onError: (error: any) => {
      setAuthState((prev) => ({
        ...prev,
        error: error.message || "Login failed",
        isLoading: false,
      }));
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Call logout endpoint if available
      try {
        await authApi.logout?.();
      } catch (error) {
        // Ignore logout API errors
        console.warn("Logout API call failed:", error);
      }
    },
    onSettled: () => {
      // Clear session regardless of API call result
      sessionManager.clearSession();

      // Update auth state
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      // Clear all cached data
      queryInvalidation.clearAll();
    },
  });

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (userData: Partial<User>) => {
      const response = await profileApi.updateProfile?.(userData);
      return response?.data;
    },
    onSuccess: (updatedUser) => {
      if (updatedUser) {
        // Update session user data
        sessionManager.updateUser(updatedUser);

        // Update auth state
        setAuthState((prev) => ({
          ...prev,
          user: updatedUser,
        }));

        // Update cached profile data
        queryClient.setQueryData(queryKeys.profile(), updatedUser);
      }
    },
  });

  // Initialize auth state from session
  const initializeAuth = useCallback(async () => {
    try {
      const session = sessionManager.getSession();

      if (session) {
        setAuthState({
          user: session.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        // Validate session by fetching fresh profile data
        await refetchProfile();
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      sessionManager.clearSession();
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, [refetchProfile]);

  // Handle session expiry events
  useEffect(() => {
    const handleSessionExpiry = () => {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: "Session expired",
      });
      queryInvalidation.clearAll();
    };

    window.addEventListener("auth:session-expired", handleSessionExpiry);
    return () =>
      window.removeEventListener("auth:session-expired", handleSessionExpiry);
  }, []);

  // Update auth state when profile data changes
  useEffect(() => {
    if (profileData) {
      setAuthState((prev) => ({
        ...prev,
        user: profileData,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }));
    } else if (profileError && !profileLoading) {
      // Only clear auth if we have a definitive error and not loading
      sessionManager.clearSession();
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, [profileData, profileError, profileLoading]);

  // Initialize on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Auto token refresh
  useEffect(() => {
    const checkTokenRefresh = () => {
      if (sessionManager.shouldRefreshToken()) {
        refreshToken();
      }
    };

    const interval = setInterval(checkTokenRefresh, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // Context methods
  const login = async (credentials: LoginRequest) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
    await loginMutation.mutateAsync(credentials);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshToken = sessionManager.getRefreshToken();
      if (!refreshToken) return false;

      const response = await authApi.refresh();
      const newTokens: AuthTokens = response.data;

      sessionManager.updateTokens(newTokens);
      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      sessionManager.clearSession();
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: "Session expired",
      });
      return false;
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    await updateProfileMutation.mutateAsync(userData);
  };

  const clearError = () => {
    setAuthState((prev) => ({ ...prev, error: null }));
  };

  const getSessionInfo = () => {
    return sessionManager.getSessionInfo();
  };

  const contextValue: AuthContextType = {
    ...authState,
    isLoading:
      authState.isLoading ||
      loginMutation.isPending ||
      logoutMutation.isPending,
    login,
    logout,
    refreshToken,
    updateProfile,
    clearError,
    getSessionInfo,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
