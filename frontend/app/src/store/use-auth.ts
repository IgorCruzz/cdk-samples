import { create } from 'zustand';
import { persist } from 'zustand/middleware'; 

interface AuthState { 
  accessToken: string | null;
  refreshToken: string | null;   
  idToken: string | null; 
  getAccessToken: () => string | null;
  logout: () => void;
  setTokens: (payload: { accessToken: string, refreshToken: string, idToken: string }) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({   
      accessToken: null,
      refreshToken: null,   
      idToken: null,
      getAccessToken: () => get().accessToken,   
      setTokens: ({ accessToken, refreshToken, idToken }) => {
        set({
          accessToken,
          refreshToken,
          idToken
        });

        window.location.href = '/home';  
      },
      logout: () => {
        window.location.href = '/'

        return set({
          accessToken: null,
          refreshToken: null, 
          idToken: null
        })  
      }        
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
