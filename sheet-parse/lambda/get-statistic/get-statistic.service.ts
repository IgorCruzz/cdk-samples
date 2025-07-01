import { IStatisticRepository } from "../repository/statistic.repository";
import { APIGatewayProxyResult } from "aws-lambda";

type GetStatisticOutput = Promise<APIGatewayProxyResult>;

interface IGetStatisticService {
  getFiles: () => GetStatisticOutput;
}

export class GetStatisticServices implements IGetStatisticService {
  constructor(private readonly statisticRepository: IStatisticRepository) {}

  getFiles = async (): GetStatisticOutput => {
    try {
      const files = await this.statisticRepository.get();

      return {
        statusCode: 200,
        body: JSON.stringify(files),
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers":
            "Content-Type, Authorization, X-Api-Key",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
        },
      };
    } catch (error) {
      console.log({ error });

      return {
        statusCode: 500,
        body: "Internal Server Error",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers":
            "Content-Type, Authorization, X-Api-Key",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
        },
      };
    }
  };
}
