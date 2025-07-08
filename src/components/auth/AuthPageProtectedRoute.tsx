import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ReactNode } from "react";
import PageLoader from "../PageLoader";

interface Props {
  children: ReactNode;
}

const roleRedirects: Record<string, string> = {
  customer: "/customer",
  storekeeper: "/storekeeper",
  salesrep: "/salesrep",
  admin: "/admin",
};

const AuthPageProtectedRoute = ({ children }: Props) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <PageLoader />
    );
  }

  if (user) {
    // Redirect based on user role
    const redirectPath = roleRedirects[user.role] || "/";
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default AuthPageProtectedRoute;
