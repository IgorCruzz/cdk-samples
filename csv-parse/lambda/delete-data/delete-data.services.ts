import { dataRepository } from "../_shared/repository/data.repository";

export const service = async ({ id }: { id: string }) => {
  const data = await dataRepository.findById({ id });

  if (!data) {
    return { message: "Data not found", success: false, data: null };
  }

  await dataRepository.delete({ id });

  return null;
};
