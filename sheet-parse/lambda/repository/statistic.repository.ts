import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { UpdateCommandInput, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});

type StatisticRepositoryInput = {
  type: "COMPLETED" | "FAILED";
};

type StatisticRepositoryOutput = Promise<void>;

export interface IStatisticRepository {
  save: (input: StatisticRepositoryInput) => StatisticRepositoryOutput;
}

export class StatisticRepository implements IStatisticRepository {
  async save(input: StatisticRepositoryInput): StatisticRepositoryOutput {
    const params: UpdateCommandInput = {
      TableName: process.env.TABLE_NAME as string,
      Key: {
        PK: "STATISTIC",
        SK: "STATISTIC",
      },
      UpdateExpression:
        input.type === "COMPLETED"
          ? "SET #completed =  if_not_exists(#completed, :completed) + :completed"
          : "SET #failed = if_not_exists(#failed, :failed) + :failed",
      ExpressionAttributeNames: {
        ...(input.type === "COMPLETED"
          ? { "#completed": "completed" }
          : { "#failed": "failed" }),
      },
      ExpressionAttributeValues: {
        ...(input.type === "COMPLETED"
          ? { ":completed": 1 }
          : { ":failed": 1 }),
      },
    };

    const command = new UpdateCommand(params);

    await client.send(command);
  }
}
