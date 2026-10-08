import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getSessionUser } from "../../auth/auth";

/** Redirects to /login when there's no active session. */
export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const user = getSessionUser();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
};

/** Redirects to /login when signed out, or to home when signed in as a non-admin. */
export const RequireAdmin = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const user = getSessionUser();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};