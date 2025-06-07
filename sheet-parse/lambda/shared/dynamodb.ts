import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  BatchWriteCommandInput,
  BatchWriteCommand,
  PutCommandInput,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { CustomerType } from "../schema/customer.schema";
import KSUID from "ksuid";

const client = new DynamoDBClient({});

type FileProps = {
  key: string;
  size: number;
};

export interface DynamoDBInterface {
  putBatchItem: ({ data }: { data: CustomerType[] }) => Promise<void>;
  putItem: (item: FileProps) => Promise<void>;
}

export class DynamoDB implements DynamoDBInterface {
  async putItem(item: FileProps): Promise<void> {
    const { key } = item;

    const params: PutCommandInput = {
      TableName: process.env.TABLE_NAME as string,
      Item: {
        ...item,
        PK: `ARCHIVE#${key}`,
        SK: `METADATA#${key}`,
        ...item,
        CreatedAt: new Date().toISOString(),
      },
      ConditionExpression: "attribute_not_exists(PK)",
    };

    const command = new PutCommand(params);

    await client.send(command);
  }

  async putBatchItem({ data }: { data: CustomerType[] }): Promise<void> {
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
