import { api } from '../api';

export const files = {
  delete: async ({ apiId }: { apiId: string }) => {
    return await api.delete(`api/${apiId}`);
  },
  preSignedUrl: async ({ size, filename, endpoint }: { size: number; filename: string; endpoint: string }) => {
    return await api.post('files/generate-pre-signed-url', { size, filename, endpoint });
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
