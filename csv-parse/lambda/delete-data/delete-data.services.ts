import { dataRepository } from "../_shared/repository/data.repository";

export const service = async ({ id }: { id: string }) => {
  await dataRepository.delete({ id });

  return null;
};
