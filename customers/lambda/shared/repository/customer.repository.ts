import { dbHelper } from "./db-helper";

export type Customers = {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
};

export interface ICustomersRepository {
  getCustomers(input: { page: number; limit: number }): Promise<{
    itens: Customers[];
    count: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}

export const customersRepository: ICustomersRepository = {
  async getCustomers({ page, limit }: { page: number; limit: number }) {
    const userCollection = dbHelper.getCollection("customers");
    const skip = (page - 1) * limit;
    const count = await userCollection.countDocuments();

    const Customers = await userCollection
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const totalPages = Math.ceil(count / limit);

    return {
      itens: dbHelper.mapCollection(Customers),
      count,
      page,
      limit,
      totalPages,
    };
  },
};
