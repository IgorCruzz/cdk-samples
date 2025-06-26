import { LIMIT } from '@/utils/limit';
import { api } from '../api'

export const files = {
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