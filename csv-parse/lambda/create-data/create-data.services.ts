import { dataRepository } from "../_shared/repository/data.repository";

export const service = async (data: Record<string, unknown>) => {
  await dataRepository.singleSave(data);

  return { message: "Data created successfully", success: true, data: null };
};
