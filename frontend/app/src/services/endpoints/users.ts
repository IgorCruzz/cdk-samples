import { UserInput } from '@/schemas/users';
import { api } from '../api'

export const users = { 
  get: async ({ page, limit }: { page: number; limit: number }) => {
    return await api.get('users', {
      params: {
        limit,
        page
      }
    });
  },
  post: async (data: UserInput) => {
    return await api.post('users', data);
  },
  put: async (data: UserInput) => {
    return await api.put(`users/${data.id}`, data);
  },
  delete: async (id: string) => {
    return await api.delete(`users/${id}`);
  }
}