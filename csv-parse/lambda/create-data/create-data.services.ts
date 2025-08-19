import { dataRepository } from "../_shared/repository/data.repository";

export const service = async (data: unknown) => {
  await dataRepository.singleSave(data);

  return { message: "Data created successfully", success: true, data: null };
};
