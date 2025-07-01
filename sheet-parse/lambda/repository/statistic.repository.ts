import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  UpdateCommandInput,
  UpdateCommand,
  GetCommandInput,
  GetCommand,
  GetCommandOutput,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});

type SaveInput = {
  type: "COMPLETED" | "FAILED";
};

type SaveOutput = Promise<void>;

type GetOutput = Promise<{
  Completed: number;
  Failed: number;
}>;

export interface IStatisticRepository {
  save: (input: SaveInput) => SaveOutput;
  get: () => GetOutput;
}

export class StatisticRepository implements IStatisticRepository {
  async get(): GetOutput {
    const params: GetCommandInput = {
      TableName: process.env.TABLE_NAME as string,
      Key: {
        PK: "STATISTIC",
        SK: "STATISTIC",
      },
      ProjectionExpression: "Completed, Failed",
    };

    const command = new GetCommand(params);

    const res: GetCommandOutput = await client.send(command);

    return res.Item as {
      Completed: number;
      Failed: number;
    };
  }

  async save(input: SaveInput): SaveOutput {
    const params: UpdateCommandInput = {
      TableName: process.env.TABLE_NAME as string,
      Key: {
        PK: "STATISTIC",
        SK: "STATISTIC",
      },
      UpdateExpression:
        input.type === "COMPLETED"
          ? "SET #completed =  if_not_exists(#completed, :zero) + :completed, #failed = if_not_exists(#failed, :zero)"
          : "SET #failed = if_not_exists(#failed, :zero) + :failed, #completed = if_not_exists(#completed, :zero)",
      ExpressionAttributeNames: {
        ...(input.type === "COMPLETED"
          ? { "#completed": "Completed" }
          : { "#failed": "Failed" }),
      },
      ExpressionAttributeValues: {
        ":zero": 0,
        ...(input.type === "COMPLETED"
          ? { ":completed": 1 }
          : { ":failed": 1 }),
      },
    };

    const command = new UpdateCommand(params);

    await client.send(command);
  }
}
