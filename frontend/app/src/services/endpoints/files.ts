import { api } from '../api'

export const files = {
  preSignedUrl: async () => {
    return await api.post('files');
  }, 
  getFiles: async () => {
    return await api.get('files');
  }
}