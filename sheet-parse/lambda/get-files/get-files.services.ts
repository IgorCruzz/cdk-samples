import { IArchiveRepository } from "../shared/repository/archive.repository";
import { APIGatewayProxyResult } from "aws-lambda";

type GetFilesInput = {
  page: number;
  limit: number;
};

type GetFilesOutput = Promise<APIGatewayProxyResult>;

interface IGetFilesService {
  getFiles: (input: GetFilesInput) => GetFilesOutput;
}

export class GetFilesServices implements IGetFilesService {
  constructor(private readonly archiveRepository: IArchiveRepository) {}

  getFiles = async ({ page, limit }: GetFilesInput): GetFilesOutput => {
    try {
      const files = await this.archiveRepository.getFiles({
        page,
        limit,
      });

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
