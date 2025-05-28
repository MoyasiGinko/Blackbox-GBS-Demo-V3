// hooks/useSession.ts
import { useState, useEffect } from "react";
import { SessionManager } from "../utils/sessionManager";

export const useSession = () => {
  const [sessionInfo, setSessionInfo] = useState(
    SessionManager.getSessionInfo()
  );

  useEffect(() => {
    const updateSessionInfo = () => {
      setSessionInfo(SessionManager.getSessionInfo());
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
