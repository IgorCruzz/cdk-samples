import { dataRepository } from "../_shared/repository/data.repository";

export const service = async (data: Record<string, unknown>, id: string) => {
  await dataRepository.updateData(data, id);

  return { message: "Data updated successfully", success: true, data: null };
};
