import axios from 'axios';
import { auth } from './endpoints/auth';
import { useAuthStore } from '@/store/use-auth';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use(function (config) {
  const storage = localStorage.getItem('auth-storage');

  if (storage) {
    const parsedStorage = JSON.parse(storage);

    if (!parsedStorage.state.accessToken) return config;

    config.headers.Authorization = `Bearer ${parsedStorage.state.accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const { refreshToken, setTokens, logout, idToken } = useAuthStore.getState();

      try {
        if (!refreshToken) return Promise.reject(error);

        const response = await auth.refresh({
          refreshToken,
        });

        if (response.status !== 200) {
          window.location.href = '/';
          return Promise.reject(error);
        }

        setTokens({
          accessToken: response.data.data.accessToken,
          refreshToken,
          idToken: idToken!,
        });

        error.config.headers.Authorization = `Bearer ${response.data.data.accessToken}`;

        return api(error.config);
      } catch (refreshError) {
        logout();

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
