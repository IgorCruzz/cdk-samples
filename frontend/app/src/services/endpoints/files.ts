import { api } from '../api'

export const files = {
  statistics: async () => {
    return await api.get('files/statistics');
  },
  preSignedUrl: async () => {
    return await api.post('files');
  },
  getFiles: async ({ page, limit }: { page: number; limit: number }) => {
    return await api.get('files', {
      params: {
        limit,
        page
      }
    });
  }
}