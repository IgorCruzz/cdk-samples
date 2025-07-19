import { useAuthStore } from "@/store/use-auth";
import { Navigate, Outlet } from "react-router-dom";

const isNotAuthenticated = () => {
  const getAccessToken = useAuthStore((state) => state.getAccessToken);
  return !getAccessToken();
}

export function PublicRoute() {
  return !isNotAuthenticated() ? <Navigate to="/home" replace /> : <Outlet />;
} 
