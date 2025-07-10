import {
  archiveRepository,
  Files,
} from "../shared/repository/archive.repository";

export const service = async ({
  page,
  limit,
}: {
  page: number;
  limit: number;
}): Promise<{
  itens: Files[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}> => {
  const files = await archiveRepository.getFiles({
    page,
    limit,
  });

  return files;
};
