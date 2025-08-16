import { api } from '../api';

export const files = {
  statistics: async () => {
    return await api.get('files/statistics');
  },
  preSignedUrl: async ({ size, filename }: { size: number; filename: string }) => {
    return await api.post('files/generate-pre-signed-url', { size, filename });
  },
  getFiles: async ({ page, limit }: { page: number; limit: number }) => {
    return await api.get('files', {
      params: {
        limit,
        page,
      },
    });
  },
};
