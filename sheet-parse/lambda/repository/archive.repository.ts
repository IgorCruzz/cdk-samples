import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  PutCommandInput,
  PutCommand,
  UpdateCommand,
  UpdateCommandInput,
  QueryCommandInput,
  QueryCommand,
  QueryCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { actualDate } from "../utils/locale-date.util";

const client = new DynamoDBClient({});

export type Files = {
  key: string;
  size: number;
  message: string;
  status: "PROCESSING" | "COMPLETED" | "FAILED";
};

type ArchiveRepositoryInput = Files;

type ArchiveRepositoryOutput = {
  success: boolean;
  message: string;
};

type GetFilesOutput = Files;

export interface IArchiveRepository {
  getFiles: () => Promise<GetFilesOutput[]>;
  save: (item: ArchiveRepositoryInput) => Promise<ArchiveRepositoryOutput>;
  updateStatus({
    key,
    status,
    message,
  }: Pick<ArchiveRepositoryInput, "key" | "status" | "message">): Promise<void>;
}

export class ArchiveRepository implements IArchiveRepository {
  async getFiles(): Promise<GetFilesOutput[]> {
    const params: QueryCommandInput = {
      TableName: process.env.TABLE_NAME as string,
      KeyConditionExpression: "PK = :pk",
      ExpressionAttributeValues: {
        ":pk": "ARCHIVE",
      },
      ProjectionExpression: "SK",
    };

    const command = new QueryCommand(params);
    const response: QueryCommandOutput = await client.send(command);

    return response.Items as ArchiveRepositoryInput[];
  }

  async save(item: ArchiveRepositoryInput): Promise<ArchiveRepositoryOutput> {
    try {
      const { key } = item;

      const params: PutCommandInput = {
        TableName: process.env.TABLE_NAME as string,
        Item: {
          PK: `ARCHIVE`,
          SK: `METADATA#${key}`,
          ...item,
          CreatedAt: actualDate,
        },
        ConditionExpression: "attribute_not_exists(SK)",
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
    message,
  }: Pick<
    ArchiveRepositoryInput,
    "key" | "status" | "message"
  >): Promise<void> {
    const params: UpdateCommandInput = {
      TableName: process.env.TABLE_NAME as string,
      Key: {
        PK: `ARCHIVE#${key}`,
        SK: `METADATA#${key}`,
      },
      UpdateExpression: "SET #status = :status, #message = :message",
      ExpressionAttributeNames: {
        "#status": "status",
        "#message": "message",
      },
      ExpressionAttributeValues: {
        ":status": status,
        ":message": message,
      },
    };

    const command = new UpdateCommand(params);

    await client.send(command);
  }
}
