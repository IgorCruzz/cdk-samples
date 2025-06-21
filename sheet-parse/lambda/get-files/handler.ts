import { ArchiveRepository } from "../repository/archive.repository";
import { GetFilesServices } from "./get-files.services";

export const getFilesDataHanlder = async () => {
  const archiveRepository = new ArchiveRepository();
  const getFilesServices = new GetFilesServices(archiveRepository);

  return getFilesServices.getFiles();
};
