import {
  archiveRepository,
  Files,
} from "../_shared/repository/archive.repository";

import { dataRepository } from "../_shared/repository/data.repository";

type Input = {
  page: number;
  limit: number;
  sub?: string;
};

export const service = async ({
  page,
  limit,
  sub,
}: Input): Promise<{
  itens: Files[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
  keys: any;
}> => {
  const files = await archiveRepository.getFiles({
    page,
    limit,
    sub,
  });

  const keys = await dataRepository.getKeys({
    archiveId: files.itens[0]?.id as string,
  });

  return {
    ...files,
    keys,
  };
};
