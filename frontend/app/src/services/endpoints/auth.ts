import { api } from '../api'

export const auth = {
  login: async (data: { email: string; password: string }) => {
    return await api.post("auth/signin", {
      email: data.email,
      password: data.password,
    })
  },
  refresh: async (data: { refreshToken: string }) => {
    return await api.post("auth/refresh-token", {
      refreshToken: data.refreshToken,
    })
  },
  confirm: async (data: { code: string }) => {
    return await api.post("auth/confirm", {
      code: data.code,
    })
  },
  oAuth2: async (data: { credential: string; clientId: string }) => {
    return await api.post("auth/oauth2", {
      credential: data.credential,
      clientId: data.clientId,
    })
  }
}