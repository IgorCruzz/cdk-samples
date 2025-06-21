import { S3Event } from "aws-lambda";
import { ArchiveRepository } from "../repository/archive.repository";
import { GetFilesServices } from "./get-files.services";

export const extractDataHandler = async (event: S3Event) => {
  const archiveRepository = new ArchiveRepository();
  const getFilesServices = new GetFilesServices(archiveRepository);

  return getFilesServices.getFiles();
};
