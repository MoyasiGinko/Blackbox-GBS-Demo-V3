// context/AuthContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SessionManager } from "../utils/sessionManager";
import { queryKeys, queryInvalidation } from "../lib/queryClient";
import {
  User,
  AuthState,
  AuthTokens,
  SessionData,
  LoginCredentials,
  AuthContextType,
} from "../types/auth";
import { authApi, profileApi } from "../utils/api";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();
  const [state, setState] = useState<AuthState>({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });

  // Initialize auth state from session
  useEffect(() => {
    const session = SessionManager.getSession();
    if (session) {
      setState({
        user: session.user,
        tokens: session.tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  // Login method
  const login = async (credentials: LoginCredentials) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const tokenRes = await authApi.login(credentials.email, credentials.password);
      const tokens = tokenRes.data;
      const profileRes = await profileApi.getProfile();
      const user = profileRes.data;
      const expiresAt = Date.now() + tokens.expires_in * 1000;
      const sessionData: SessionData = { user, tokens, expiresAt };
      SessionManager.setSession(sessionData);
      setState({
        user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      setState({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: err?.message || "Login failed",
      });
      SessionManager.clearSession();
    }
  };

  // Logout method
  const logout = async () => {
    try {
      await authApi.logout();
    } catch {}
    SessionManager.clearSession();
    setState({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    queryClient.clear();
  };

  // Refresh tokens method
  const refreshTokens = async () => {
    try {
      const refreshToken = SessionManager.getRefreshToken();
      if (!refreshToken) throw new Error("No refresh token");
      const response = await authApi.refresh();
      const newTokens: AuthTokens = response.data;
      SessionManager.updateTokens(newTokens);
      setState((prev) => ({ ...prev, tokens: newTokens }));
    } catch (error) {
      SessionManager.clearSession();
      setState({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: "Session expired",
      });
    }
  };

  // Set user method
  const setUser = (user: User | null) => {
    setState((prev) => ({ ...prev, user }));
    const session = SessionManager.getSession();
    if (session && user) {
      SessionManager.setSession({ ...session, user });
    } else if (!user) {
      SessionManager.clearSession();
    }
  };

  // Set tokens method
  const setTokens = (tokens: AuthTokens | null) => {
    setState((prev) => ({ ...prev, tokens }));
    const session = SessionManager.getSession();
    if (session && tokens) {
      SessionManager.setSession({ ...session, tokens });
    }
  };

  const value: AuthContextType = {
    state,
    login,
    logout,
    refreshTokens,
    setUser,
    setTokens,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
