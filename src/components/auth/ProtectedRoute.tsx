// components/auth/ProtectedRoute.tsx
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import PageLoader from "../PageLoader";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "customer" | "salesrep" | "storekeeper" | "admin";
  requireAuth?: boolean;
}

const ProtectedRoute = ({ children, requiredRole, requireAuth = true }: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <PageLoader />
    );
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    const roleRedirects: Record<string, string> = {
      customer: "/shop",
      salesrep: "/salesrep",
      storekeeper: "/storekeeper",
      admin: "/admin",
    };

    const redirectPath = roleRedirects[user?.role || "customer"] || "/";
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
