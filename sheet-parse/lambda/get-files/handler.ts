import { APIGatewayProxyEvent } from "aws-lambda";
import { ArchiveRepository } from "../repository/archive.repository";
import { GetFilesServices } from "./get-files.services";

export const getFilesDataHanlder = async (event: APIGatewayProxyEvent) => {
  const archiveRepository = new ArchiveRepository();
  const getFilesServices = new GetFilesServices(archiveRepository);

  const startKey = event.queryStringParameters?.startKey;

  const limit = parseInt(event.queryStringParameters?.limit || "20");

  return getFilesServices.getFiles({ startKey, limit });
};
