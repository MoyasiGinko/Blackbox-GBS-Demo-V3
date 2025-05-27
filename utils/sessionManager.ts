// utils/sessionManager.ts
import { SessionData, SessionConfig, User, AuthTokens } from "@/types/auth";
import { getCookie, setCookie, deleteCookie } from "./cookies";

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
      // Store session data in httpOnly cookie (if server supports it)
      // For client-side, we'll use secure cookie
      setCookie(
        this.SESSION_KEY,
        JSON.stringify({
          user: sessionData.user,
          expiresAt: sessionData.expiresAt,
        }),
        {
          maxAge: this.config.sessionTimeout * 60,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        }
      );

      // Store refresh token separately
      setCookie(this.REFRESH_KEY, sessionData.tokens.refresh_token, {
        maxAge: this.config.sessionTimeout * 60,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        httpOnly: false, // Note: In production, this should be httpOnly
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
    return session?.user || null;
  }

  updateUser(user: User): void {
    if (!this.session) return;

    this.session = {
      ...this.session,
      user,
    };

    this.setSession(this.session);
  }

  getSessionInfo() {
    const session = this.getSession();
    if (!session) return null;

    return {
      user: session.user,
      expiresAt: session.expiresAt,
      isValid: this.isSessionValid(),
      shouldRefresh: this.shouldRefreshToken(),
      timeUntilExpiry: session.expiresAt - Date.now(),
    };
  }
}

// Singleton instance
export const sessionManager = new SessionManagerClass();

// Factory function for custom configurations
export const createSessionManager = (config?: Partial<SessionConfig>) => {
  return new SessionManagerClass(config);
};

export default sessionManager;
