import { CustomerType } from "../schema/customer.schema";
import { dbHelper } from "./db-helper";

type CustomerRepositoryInput = {
  data: CustomerType[];
};

type CustomerRepositoryOutput = Promise<void>;

export interface ICustomerRepository {
  save: ({ data }: CustomerRepositoryInput) => CustomerRepositoryOutput;
}

export class CustomerRepository implements ICustomerRepository {
  async save({ data }: CustomerRepositoryInput): CustomerRepositoryOutput {
    const customer = dbHelper.getCollection("customers");

    await customer?.insertMany(data);

    return;
  }
}
