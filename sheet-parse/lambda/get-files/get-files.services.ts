import { IArchiveRepository } from "../repository/archive.repository";
import { APIGatewayProxyResult } from "aws-lambda";

interface IGetFilesService {
  getFiles: () => Promise<GetFilesOutput>;
}

type GetFilesOutput = APIGatewayProxyResult;

export class GetFilesServices implements IGetFilesService {
  constructor(private readonly archiveRepository: IArchiveRepository) {}

  getFiles = async (): Promise<GetFilesOutput> => {
    try {
      const files = await this.archiveRepository.getFiles();

      console.log({
        files,
      });

      return {
        statusCode: 200,
        body: JSON.stringify(files),
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
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
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
        },
      };
    }
  };
}
