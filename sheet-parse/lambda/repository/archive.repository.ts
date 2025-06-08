import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  PutCommandInput,
  PutCommand,
  UpdateCommand,
  UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});

type ArchiveInput = {
  key: string;
  size: number;
  message: string;
  status: "PROCESSING" | "COMPLETED" | "FAILED";
};

type ArchiveOutput = {
  success: boolean;
  message: string;
};

export interface IArchiveRepository {
  save: (item: ArchiveInput) => Promise<ArchiveOutput>;
  updateStatus({
    key,
    status,
  }: Pick<ArchiveInput, "key" | "status">): Promise<void>;
}

export class ArchiveRepository implements IArchiveRepository {
  async save(item: ArchiveInput): Promise<ArchiveOutput> {
    try {
      const { key } = item;

      const params: PutCommandInput = {
        TableName: process.env.TABLE_NAME as string,
        Item: {
          PK: `ARCHIVE#${key}`,
          SK: `METADATA#${key}`,
          ...item,
          CreatedAt: new Date().toISOString(),
        },
        ConditionExpression: "attribute_not_exists(PK)",
      };

      const command = new PutCommand(params);

      await client.send(command);

      return {
        success: true,
        message: `Item with PK ${key} saved successfully.`,
      };
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        error.name === "ConditionalCheckFailedException"
      ) {
        console.error("Error putting item in DynamoDB:", error.message);

        return {
          success: false,
          message: `Item with PK ${item.key} already exists.`,
        };
      }

      return {
        success: false,
        message: `Error putting item in DynamoDB: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }

  async updateStatus({
    key,
    status,
  }: Pick<ArchiveInput, "key" | "status">): Promise<void> {
    const params: UpdateCommandInput = {
      TableName: process.env.TABLE_NAME as string,
      Key: {
        PK: `ARCHIVE#${key}`,
        SK: `METADATA#${key}`,
      },
      UpdateExpression: "SET #status = :status",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":status": status,
      },
    };

    const command = new UpdateCommand(params);

    await client.send(command);
  }
}
