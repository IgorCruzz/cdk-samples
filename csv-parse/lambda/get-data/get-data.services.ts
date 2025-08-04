import { dataRepository } from "../_shared/repository/data.repository";

export const service = async ({
  page,
  limit,
  archiveId,
}: {
  page: number;
  limit: number;
  archiveId: string;
}): Promise<{
  itens: unknown[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}> => {
  const data = await dataRepository.get({
    page,
    limit,
    archiveId,
  });

  return data;
};
