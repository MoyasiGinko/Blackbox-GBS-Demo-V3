// utils/cookies.ts
export interface CookieOptions {
  maxAge?: number; // seconds
  expires?: Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: "strict" | "lax" | "none";
}

export const setCookie = (
  name: string,
  value: string,
  options: CookieOptions = {}
): void => {
  if (typeof document === "undefined") return;

  const {
    maxAge,
    expires,
    path = "/",
    domain,
    secure = false,
    httpOnly = false,
    sameSite = "lax",
  } = options;

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (maxAge !== undefined) {
    cookieString += `; Max-Age=${maxAge}`;
  }

  if (expires) {
    cookieString += `; Expires=${expires.toUTCString()}`;
  }

  cookieString += `; Path=${path}`;

  if (domain) {
    cookieString += `; Domain=${domain}`;
  }

  if (secure) {
    cookieString += `; Secure`;
  }

  if (httpOnly) {
    cookieString += `; HttpOnly`;
  }

  cookieString += `; SameSite=${sameSite}`;

  document.cookie = cookieString;
};

export const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;

  const nameEQ = `${encodeURIComponent(name)}=`;
  const cookies = document.cookie.split(";");

  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }

  return null;
};

export const deleteCookie = (
  name: string,
  options: Pick<CookieOptions, "path" | "domain"> = {}
): void => {
  setCookie(name, "", {
    ...options,
    maxAge: -1,
  });
};

export const getAllCookies = (): Record<string, string> => {
  if (typeof document === "undefined") return {};

  const cookies: Record<string, string> = {};

  document.cookie.split(";").forEach((cookie) => {
    const [name, value] = cookie.trim().split("=");
    if (name && value) {
      cookies[decodeURIComponent(name)] = decodeURIComponent(value);
    }
  });

  return cookies;
};

export const clearAllCookies = (): void => {
  const cookies = getAllCookies();
  Object.keys(cookies).forEach((name) => {
    deleteCookie(name);
  });
};
