import { dataRepository } from "../_shared/repository/data.repository";

export const service = async (data: Record<string, unknown>) => {
  return { message: "Data updated successfully", success: true, data: null };
};
