import { api } from '../api';

export const auth = {
  signup: async (data: { email: string; password: string; name: string }) => {
    return await api.post('auth/signup', {
      email: data.email,
      password: data.password,
      name: data.name,
    });
  },
  login: async (data: { email: string; password: string }) => {
    return await api.post('auth/signin', {
      email: data.email,
      password: data.password,
    });
  },
  refresh: async (data: { refreshToken: string }) => {
    return await api.post('auth/refresh-token', {
      refreshToken: data.refreshToken,
    });
  },

  confirm: async (data: { code: string; email: string }) => {
    return await api.post('auth/confirm', {
      code: data.code,
      email: data.email,
    });
  },
  oAuth2: async (data: { credential: string; clientId: string }) => {
    return await api.post('auth/oauth2', {
      credential: data.credential,
      clientId: data.clientId,
    });
  },
};
