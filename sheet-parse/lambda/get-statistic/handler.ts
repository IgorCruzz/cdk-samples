import { ArchiveRepository } from "../shared/repository/archive.repository";
import { GetStatisticServices } from "./get-statistic.service";

export const handler = async () => {
  const archiveRepository = new ArchiveRepository();
  const getFilesServices = new GetStatisticServices(archiveRepository);

  return getFilesServices.getFiles();
};
