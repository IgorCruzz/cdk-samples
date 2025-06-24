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
  successLines?: number;
  failedLines?: number;
};

type ArchiveRepositoryInput = Files;

type ArchiveRepositoryOutput = {
  success: boolean;
  message: string;
};

type GetFilesInput = {
  exclusiveStartKey?: string;
};

type GetFilesOutput = Promise<{
  itens: Files[];
  lastEvaluatedKey: string | undefined;
  count: number;
}>;

export interface IArchiveRepository {
  getFiles: (input: GetFilesInput) => GetFilesOutput;
  save: (input: ArchiveRepositoryInput) => Promise<ArchiveRepositoryOutput>;
  updateStatus(
    data: Pick<
      ArchiveRepositoryInput,
      "key" | "status" | "message" | "successLines" | "failedLines"
    >
  ): Promise<void>;
}

export class ArchiveRepository implements IArchiveRepository {
  async getFiles({ exclusiveStartKey }: GetFilesInput): GetFilesOutput {
    const exclusiveStartKeyParsed = exclusiveStartKey
      ? (JSON.parse(
          Buffer.from(exclusiveStartKey, "base64").toString()
        ) as Record<string, string>)
      : undefined;

    const params: QueryCommandInput = {
      TableName: process.env.TABLE_NAME as string,
      KeyConditionExpression: "PK = :pk",
      ExpressionAttributeValues: {
        ":pk": "ARCHIVE",
      },
      ProjectionExpression: "#key, #size, #message, #status",
      ScanIndexForward: false,
      ExpressionAttributeNames: {
        "#status": "status",
        "#message": "message",
        "#key": "key",
        "#size": "size",
      },
      ...(exclusiveStartKey && {
        ExclusiveStartKey: exclusiveStartKeyParsed,
      }),
      Limit: 20,
    };

    const command = new QueryCommand(params);
    const response: QueryCommandOutput = await client.send(command);

    return {
      count: response.Count || 0,
      itens: response.Items as Files[],
      lastEvaluatedKey: response.LastEvaluatedKey
        ? Buffer.from(JSON.stringify(response.LastEvaluatedKey)).toString(
            "base64"
          )
        : undefined,
    };
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
          successLines: 0,
          failedLines: 0,
          CreatedAt: actualDate,
        },
        ConditionExpression: "attribute_not_exists(SK)",
      };

      const command = new PutCommand(params);

      await client.send(command);

      return {
        success: true,
        message: `Item with SK ${key} saved successfully.`,
      };
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        error.name === "ConditionalCheckFailedException"
      ) {
        console.error("Error putting item in DynamoDB:", error.message);

        return {
          success: false,
          message: `Item with SK ${item.key} already exists.`,
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
    successLines = 0,
    failedLines = 0,
  }: Pick<
    ArchiveRepositoryInput,
    "key" | "status" | "message" | "successLines" | "failedLines"
  >): Promise<void> {
    const params: UpdateCommandInput = {
      TableName: process.env.TABLE_NAME as string,
      Key: {
        PK: `ARCHIVE`,
        SK: `METADATA#${key}`,
      },
      UpdateExpression:
        "SET #status = :status, #message = :message, #successLines = :successLines, #failedLines = :failedLines",
      ExpressionAttributeNames: {
        "#status": "status",
        "#message": "message",
        "#successLines": "successLines",
        "#failedLines": "failedLines",
      },
      ExpressionAttributeValues: {
        ":status": status,
        ":message": message,
        ":successLines": successLines,
        ":failedLines": failedLines,
      },
    };

    const command = new UpdateCommand(params);

    await client.send(command);
  }
}
