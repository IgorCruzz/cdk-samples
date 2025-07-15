import { create } from 'zustand';
import { persist } from 'zustand/middleware'; 

interface AuthState { 
  accessToken: string | null;
  refreshToken: string | null;  
  setAccessToken: (payload: { accessToken: string }) => void;
  setRefreshToken: (payload: { refreshToken: string }) => void;
  getAccessToken: () => string | null;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({   
      accessToken: null,
      refreshToken: null,  
      setAccessToken: ({ accessToken }) =>
        set({
          accessToken, 
        }),
      setRefreshToken: ({ refreshToken }) => set({ refreshToken }),
      getAccessToken: () => get().accessToken,   
      logout: () =>
        set({
          accessToken: null,
          refreshToken: null, 
        }),
    }),
    {
      name: 'auth-storage',   
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);
