// types/auth.ts
export interface User {
  id: string;
  full_name: string;
  email: string;
  role?: string;
  is_admin?: boolean;
  is_verified?: boolean;
  is_active?: boolean;
  date_joined?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface SessionData {
  user: User;
  tokens: AuthTokens;
  expiresAt: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
export interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<void>;
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
}

export interface LoginRequest {
  email: string;
  password: string;
}
