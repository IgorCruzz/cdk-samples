import { useAuthStore } from "@/store/use-auth";
import { Navigate, Outlet } from "react-router-dom";

export function PublicRoute() {
  const getAccessToken = useAuthStore((state) => state.getAccessToken);
  const isAuth = Boolean(getAccessToken());

  return isAuth ? <Navigate to="/home" replace /> : <Outlet />;
} 
