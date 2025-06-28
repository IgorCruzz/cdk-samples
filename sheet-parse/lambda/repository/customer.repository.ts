import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  BatchWriteCommandInput,
  BatchWriteCommand,
  BatchGetCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { CustomerType } from "../schema/customer.schema";
import { actualDate } from "../utils/locale-date.util";

const client = new DynamoDBClient({});

type CustomerRepositoryInput = {
  data: CustomerType[];
};

type CustomerRepositoryOutput = Promise<BatchGetCommandOutput>;

export interface ICustomerRepository {
  save: ({ data }: CustomerRepositoryInput) => CustomerRepositoryOutput;
}

export class CustomerRepository implements ICustomerRepository {
  async save({ data }: CustomerRepositoryInput): CustomerRepositoryOutput {
    const customers = await Promise.all(
      data.map(async (item) => {
        return {
          Put: {
            TableName: process.env.TABLE_NAME as string,
            Item: {
              PK: `CUSTOMER#${item.cnpj}`,
              SK: `METADATA#${item.cnpj}`,
              ...item,
            },
          },
        };
      })
    );

    const params: BatchWriteCommandInput = {
      RequestItems: {
        [process.env.TABLE_NAME as string]: customers,
      },
    };

    const command = new BatchWriteCommand(params);

    const res: BatchGetCommandOutput = await client.send(command);

    return res;
  }
}
