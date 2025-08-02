import {
  archiveRepository,
  Files,
} from "../_shared/repository/archive.repository";

export const service = async ({
  page,
  limit,
  sub,
}: {
  page: number;
  limit: number;
  sub?: string;
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
    sub,
  });

  return files;
};
