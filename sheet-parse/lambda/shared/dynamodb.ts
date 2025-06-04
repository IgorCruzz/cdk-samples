import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  BatchWriteCommandInput,
  BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { CustomerType } from "../schema/customer.schema";
import KSUID from "ksuid";

const client = new DynamoDBClient({});

export interface DynamoDBInterface {
  putItem: ({ data }: { data: CustomerType[] }) => Promise<void>;
}

export class DynamoDB implements DynamoDBInterface {
  async putItem({ data }: { data: CustomerType[] }): Promise<void> {
    const customers = await Promise.all(
      data.map(async (item) => {
        const ID = (await KSUID.random()).string;

        return {
          PutRequest: {
            Item: {
              ...item,
              PK: `CUSTOMER#${ID}`,
              SK: `METADATA#${ID}`,
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

    await client.send(command);
  }
}
