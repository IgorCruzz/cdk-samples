import { LIMIT } from '@/utils/limit';
import { api } from '../api'

export const files = {
  statistics: async () => {
    return await api.get('files/statistics');
  },
  preSignedUrl: async () => {
    return await api.post('files');
  }, 
  getFiles: async ({ startKey }: { startKey?: string | null}) => {
    return await api.get('files', {
      params: {
        startKey,
        limit: LIMIT
      }
    });
  }
}