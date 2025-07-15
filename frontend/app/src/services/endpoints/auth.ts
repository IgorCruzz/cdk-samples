import { api } from '../api'

export const auth = {
  login: async (data: { email: string; password: string }) => {
    return await api.post("auth/signin", {
      email: data.email,
      password: data.password,
    })
  },
  refresh: async (data: { token: string }) => {
    return await api.post("auth/refresh", {
      token: data.token,
    })
  }
}