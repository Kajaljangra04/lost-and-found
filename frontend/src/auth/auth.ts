import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import type { decodedUser } from "../types/types";

const TOKEN_KEY = "accessToken";
/** Dispatched whenever auth state changes, so the UI can re-read storage. */
export const AUTH_EVENT = "auth-change";

const emitAuthChange = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_EVENT));
  }
};

const clearToken = (navigate?: (path: string) => void, path = "/") => {
  if (typeof window !== "undefined" && window.localStorage) {
    localStorage.removeItem(TOKEN_KEY);
    emitAuthChange();
    if (navigate) {
      navigate(path);
    } else {
      window.location.href = path;
    }
  }
};

export const setUserLocalStorage = (
  token: string,
  navigate?: (path: string) => void
) => {
  if (typeof window !== "undefined" && window.localStorage) {
    if (token == null) {
      clearToken(navigate);
    } else {
      localStorage.setItem(TOKEN_KEY, token);
      emitAuthChange();
    }
  }
};

export const getUserLocalStorage = () => {
  if (typeof window !== "undefined" && window.localStorage) {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

export const removeUserLocalStorage = (
  navigate?: (path: string) => void
) => {
  clearToken(navigate, "/login");
};

export const verifyToken = (token: string) => {
  const decodedUser: decodedUser = jwtDecode(token);
  return decodedUser;
};

/** Returns the decoded user from the stored token, or null if missing/expired. */
export const getSessionUser = (): decodedUser | null => {
  const token = getUserLocalStorage();
  if (!token) return null;
  try {
    const decoded = verifyToken(token);
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
    return decoded;
  } catch {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
};

export const useUserVerification = () => {
  const [user, setUser] = useState<decodedUser | null>(() => getSessionUser());

  useEffect(() => {
    const sync = () => setUser(getSessionUser());
    window.addEventListener(AUTH_EVENT, sync);
    return () => window.removeEventListener(AUTH_EVENT, sync);
  }, []);

  return user;
};

export const signOut = (navigate?: (path: string) => void) => {
  clearToken(navigate);
};