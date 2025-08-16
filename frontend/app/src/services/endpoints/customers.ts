import { api } from '../api';

export const customers = {
  getCustomers: async ({ page, limit }: { page: number; limit: number }) => {
    return await api.get('customers', {
      params: {
        limit,
        page,
      },
    });
  },
};
