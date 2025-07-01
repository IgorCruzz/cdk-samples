import { DynamoDBStreamEvent } from "aws-lambda";
import { StreamService } from "./stream-statistic.service";
import { StatisticRepository } from "../repository/statistic.repository";

export const handler = async (event: DynamoDBStreamEvent): Promise<void> => {
  const statisticRepository = new StatisticRepository();
  const streamService = new StreamService(statisticRepository);
  await streamService.stream(event);
};
