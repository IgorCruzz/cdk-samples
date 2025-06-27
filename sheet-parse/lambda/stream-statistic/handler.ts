import { DynamoDBStreamEvent } from "aws-lambda";
import { StreamService } from "./stream-statistic.service";

export const handler = async (event: DynamoDBStreamEvent): Promise<void> => {
  const streamService = new StreamService();
  await streamService.stream(event);
};
