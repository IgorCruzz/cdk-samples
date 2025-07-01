import { StatisticRepository } from "../repository/statistic.repository";
import { GetStatisticServices } from "./get-statistic.service";

export const handler = async () => {
  const statisticRepository = new StatisticRepository();
  const getFilesServices = new GetStatisticServices(statisticRepository);

  return getFilesServices.getFiles();
};
