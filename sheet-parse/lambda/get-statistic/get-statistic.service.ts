import { archiveRepository } from "../shared/repository/archive.repository";

export const service = async (): Promise<{
  totalSuccess: number;
  totalFailed: number;
}> => {
  const files = await archiveRepository.getStatistics();

  return files;
};
