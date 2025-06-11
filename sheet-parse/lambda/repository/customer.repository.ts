import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  BatchWriteCommandInput,
  BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { CustomerType } from "../schema/customer.schema";

const client = new DynamoDBClient({});

export interface ICustomerRepository {
  save: ({ data }: { data: CustomerType[] }) => Promise<void>;
}

export class CustomerRepository implements ICustomerRepository {
  async save({ data }: { data: CustomerType[] }): Promise<void> {
    const customers = await Promise.all(
      data.map(async (item) => {
        return {
          PutRequest: {
            Item: {
              PK: `CUSTOMER#${item.cnpj}`,
              SK: `METADATA#${item.cnpj}`,
              ...item,
              CreatedAt: new Date().toISOString(),
            },
            ConditionExpression: "attribute_not_exists(PK)",
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

    await client.send(command);
  }
}
