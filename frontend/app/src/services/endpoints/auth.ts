import { api } from '../api'

export const auth = {
  login: async (data: { email: string; password: string }) => {
    return await api.post('auth', data);
  }
}