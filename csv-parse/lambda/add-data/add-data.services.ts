import { archiveRepository } from "../_shared/repository/archive.repository";
import { dataRepository } from "../_shared/repository/data.repository";

export const service = async (data: Record<string, unknown>) => {
  const archive = await archiveRepository.getByEndpoint({
    endpoint: data.endpoint as string,
    userId: data.userId as string,
  });

  if (!archive) {
    return { message: "Data not found", success: false, data: null };
  }

  await dataRepository.singleSave({ ...data, archiveId: archive.id });

  return { message: "Data created successfully", success: true, data: null };
};
