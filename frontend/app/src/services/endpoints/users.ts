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
  post: async (data: any) => {
    return await api.post('users', data);
  },
  put: async (id: string, data: any) => {
    return await api.put(`users/${id}`, data);
  },
  delete: async (id: string) => {
    return await api.delete(`users/${id}`);
  }
}