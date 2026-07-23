import { getAccessToken } from "@/lib/authStorage";
import { Navigate, Outlet, useLocation } from "react-router-dom";

/** Blocks app pages unless a JWT access token is present. */
export function ProtectedRoute() {
  const location = useLocation();
  const token = getAccessToken();

  if (!token) {
    return (
      <Navigate to="/login" replace state={{ from: location.pathname }} />
    );
  }

  return <Outlet />;
}

/** Sends already-logged-in users away from login/signup. */
export function GuestRoute() {
  const token = getAccessToken();
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
