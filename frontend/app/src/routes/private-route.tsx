import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/use-auth';

const isAuthenticated = () => {
  const getAccessToken = useAuthStore((state) => state.getAccessToken);

  return Boolean(getAccessToken());
};

export function PrivateRoute() {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/" replace />;
}
