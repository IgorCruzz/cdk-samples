import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  BatchWriteCommandInput,
  BatchWriteCommand,
  BatchGetCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { CustomerType } from "../schema/customer.schema";

const client = new DynamoDBClient({});

export interface ICustomerRepository {
  save: ({ data }: { data: CustomerType[] }) => Promise<BatchGetCommandOutput>;
}

export class CustomerRepository implements ICustomerRepository {
  async save({
    data,
  }: {
    data: CustomerType[];
  }): Promise<BatchGetCommandOutput> {
    const customers = await Promise.all(
      data.map(async (item) => {
        return {
          Put: {
            TableName: process.env.TABLE_NAME as string,
            Item: {
              PK: `CUSTOMER#${item.cnpj}`,
              SK: `METADATA#${item.cnpj}`,
              ...item,
              CreatedAt: new Date().toISOString(),
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
