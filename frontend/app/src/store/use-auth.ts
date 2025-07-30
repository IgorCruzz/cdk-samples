import { create } from 'zustand';
import { persist } from 'zustand/middleware'; 

interface AuthState { 
  accessToken: string | null;
  refreshToken: string | null;   
  getAccessToken: () => string | null;
  logout: () => void;
  setTokens: (payload: { accessToken: string, refreshToken: string }) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({   
      accessToken: null,
      refreshToken: null,   
      getAccessToken: () => get().accessToken,   
      setTokens: ({ accessToken, refreshToken }) => {
        set({
          accessToken,
          refreshToken,
        });

        window.location.href = '/home';  
      },
      logout: () => {
        window.location.href = '/'

        return set({
          accessToken: null,
          refreshToken: null, 
        })  
      }        
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
