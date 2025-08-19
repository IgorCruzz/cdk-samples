import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  idToken: string | null;
  getAccessToken: () => string | null;
  logout: () => void;
  setTokens: (payload: { accessToken: string; refreshToken: string; idToken: string }) => void;
  getUser: any;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: {
        name: null,
      },
      accessToken: null,
      refreshToken: null,
      idToken: null,
      getUser: () => {
        const idToken = get().idToken;

        if (!idToken) {
          return null;
        }

        const user = jwtDecode(idToken);
        return user;
      },
      getAccessToken: () => get().accessToken,
      setTokens: ({ accessToken, refreshToken, idToken }) => {
        set({
          accessToken,
          refreshToken,
          idToken,
        });

        window.location.href = '/home';
      },
      logout: async () => {
        set({
          accessToken: null,
          refreshToken: null,
          idToken: null,
        });
        window.location.href = import.meta.env.VITE_COGNITO_LOGOUT;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        idToken: state.idToken,
      }),
    },
  ),
);
