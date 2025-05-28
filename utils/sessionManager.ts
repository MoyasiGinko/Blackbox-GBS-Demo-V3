// utils/sessionManager.ts
import { SessionData, User, AuthTokens } from "@/types/auth";
import { getCookie, setCookie, deleteCookie } from "./cookies";

export interface SessionConfig {
  tokenRefreshThreshold: number;
  maxRetries: number;
  retryDelay: number;
  sessionTimeout: number;
}

class SessionManagerClass {
  private session: SessionData | null = null;
  private config: SessionConfig = {
    tokenRefreshThreshold: 5, // 5 minutes before expiry
    maxRetries: 3,
    retryDelay: 1000,
    sessionTimeout: 60 * 24, // 24 hours
  };

  private readonly SESSION_KEY = "auth_session";
  private readonly REFRESH_KEY = "refresh_token";

  constructor(config?: Partial<SessionConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    this.initializeSession();
  }

  private initializeSession(): void {
    if (typeof window === "undefined") return;

    try {
      const sessionCookie = getCookie(this.SESSION_KEY);
      if (sessionCookie) {
        const parsedSession = JSON.parse(sessionCookie);
        if (this.isValidSessionData(parsedSession)) {
          this.session = parsedSession;
        }
      }
    } catch (error) {
      console.warn("Failed to initialize session from cookie:", error);
      this.clearSession();
    }
  }

  private isValidSessionData(data: any): data is SessionData {
    return (
      data &&
      typeof data === "object" &&
      data.user &&
      data.tokens &&
      typeof data.expiresAt === "number"
    );
  }

  getSession(): SessionData | null {
    if (!this.session) return null;

    if (!this.isSessionValid()) {
      this.clearSession();
      return null;
    }

    return this.session;
  }

  setSession(sessionData: SessionData): void {
    this.session = sessionData;

    if (typeof window !== "undefined") {
      // Only set secure cookies if running on HTTPS
      const isSecure = window.location.protocol === "https:";
      setCookie(
        this.SESSION_KEY,
        JSON.stringify({
          user: sessionData.user,
          tokens: sessionData.tokens,
          expiresAt: sessionData.expiresAt,
        }),
        {
          maxAge: this.config.sessionTimeout * 60,
          secure: isSecure,
          sameSite: "strict",
        }
      );

      // Store refresh token separately
      setCookie(this.REFRESH_KEY, sessionData.tokens.refresh_token, {
        maxAge: this.config.sessionTimeout * 60,
        secure: isSecure,
        sameSite: "strict",
        httpOnly: false, // In production, should be httpOnly
      });
    }
  }

  clearSession(): void {
    this.session = null;

    if (typeof window !== "undefined") {
      deleteCookie(this.SESSION_KEY);
      deleteCookie(this.REFRESH_KEY);
    }
  }

  isSessionValid(): boolean {
    if (!this.session) return false;

    const now = Date.now();
    return now < this.session.expiresAt;
  }

  shouldRefreshToken(): boolean {
    if (!this.session) return false;

    const now = Date.now();
    const thresholdTime =
      this.session.expiresAt - this.config.tokenRefreshThreshold * 60 * 1000;

    return now >= thresholdTime && now < this.session.expiresAt;
  }

  getAccessToken(): string | null {
    const session = this.getSession();
    return session?.tokens.access_token || null;
  }

  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return getCookie(this.REFRESH_KEY);
  }

  updateTokens(tokens: AuthTokens): void {
    if (!this.session) return;

    const expiresAt = Date.now() + tokens.expires_in * 1000;
    this.session = {
      ...this.session,
      tokens,
      expiresAt,
    };

    this.setSession(this.session);
  }

  getUser(): User | null {
    const session = this.getSession();
    return session && session.user ? session.user : null;
  }

  getSessionInfo(): {
    user: User | null;
    isValid: boolean;
    shouldRefresh: boolean;
    timeUntilExpiry: number;
  } {
    const session = this.getSession();
    if (!session) {
      return {
        user: null,
        isValid: false,
        shouldRefresh: false,
        timeUntilExpiry: 0,
      };
    }

    const now = Date.now();
    const isValid = now < session.expiresAt;
    const shouldRefresh =
      now >= session.expiresAt - this.config.tokenRefreshThreshold * 60 * 1000;
    const timeUntilExpiry = Math.max(
      0,
      Math.floor((session.expiresAt - now) / 1000)
    );

    return {
      user: session.user,
      isValid,
      shouldRefresh,
      timeUntilExpiry,
    };
  }
}

export const SessionManager = new SessionManagerClass();
