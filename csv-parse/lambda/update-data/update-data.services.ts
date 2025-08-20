import { dataRepository } from "../_shared/repository/data.repository";

type Input = {
  data: Record<string, unknown>;
  id: string;
};

export const service = async ({ data, id }: Input) => {
  await dataRepository.updateData(data, id);

  return { message: "Data updated successfully", success: true, data: null };
};
