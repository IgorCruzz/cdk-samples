import { dataRepository } from "../_shared/repository/data.repository";
import { archiveRepository } from "../_shared/repository/archive.repository";

type Input = {
  page: number;
  limit: number;
  userId: string;
  endpoint: string;
};

export const service = async ({
  page,
  limit,
  userId,
  endpoint,
}: Input): Promise<{
  itens: unknown[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}> => {
  const archive = await archiveRepository.getByEndpoint({
    endpoint,
    userId,
  });

  if (!archive) {
    return {
      itens: [],
      count: 0,
      page,
      limit,
      totalPages: 0,
    };
  }

  const data = await dataRepository.get({
    page,
    limit,
    archiveId: archive.id!,
  });

  return data;
};
